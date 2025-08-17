// src/auth/auth.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { MongooseModule } from '@nestjs/mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { Auth, AuthSchema } from './schema/auth.schema';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';

jest.setTimeout(30000);

describe('AuthController (direct call, no HTTP) /me', () => {
    let moduleRef: TestingModule;
    let authService: AuthService;
    let authController: AuthController;
    let jwtService: JwtService;
    let mongod: MongoMemoryServer;

    beforeAll(async () => {
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();

        moduleRef = await Test.createTestingModule({
            imports: [
                MongooseModule.forRoot(uri),
                MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }]),
                // configure JwtModule with the same secret used by your service
                JwtModule.register({
                    secret: '123',
                    signOptions: { expiresIn: '1h' },
                }),
            ],
            controllers: [AuthController],
            providers: [AuthService],
        }).compile();

        authService = moduleRef.get<AuthService>(AuthService);
        authController = moduleRef.get<AuthController>(AuthController);
        jwtService = moduleRef.get<JwtService>(JwtService);
    });

    afterAll(async () => {
        if (moduleRef) await moduleRef.close();
        if (mongoose.connection.readyState !== 0) {
            await mongoose.connection.dropDatabase();
            await mongoose.connection.close();
        }
        if (mongod) await mongod.stop();
    });

    afterEach(async () => {
        // clear collection between tests
        if (mongoose.connection.db) {
            await mongoose.connection.db.collection('auth').deleteMany({});
        }
    });

    it('should register, login and return current user via controller.getMe (simulated req.user)', async () => {
        // 1) register user (real DB + hashing)
        const created = await authService.registerUser({
            email: 'me@example.com',
            password: 'strongPass123',
        });

        // 2) login to get token (real jwt)
        const loginRes = await authService.loginUser({
            email: 'me@example.com',
            password: 'strongPass123',
        });
        expect(loginRes).toHaveProperty('access_token');

        const token = loginRes.access_token;

        // 3) decode/verify token to get payload (same as JwtStrategy would)
        const payload = jwtService.verify(token, { secret: '123' });

        // 4) call controller directly, simulating req.user set by guard
        const result = await authController.getMe({ user: payload } as any);

        expect(result).toBeDefined();
        expect(result.email).toBe('me@example.com');
        expect(result._id).toBeDefined();
    });

    it('should throw NotFoundException when token payload has non-existing user id', async () => {
        // create token with a fake id
        const fakeId = new mongoose.Types.ObjectId().toString();
        const fakeTokenPayload = { id: fakeId, email: 'x@x.com' };
        // sign token so shape is realistic (not strictly required for direct call, but kept consistent)
        const fakeToken = jwtService.sign(fakeTokenPayload);
        const payload = jwtService.verify(fakeToken);

        // calling controller.getMe with payload that references missing user
        await expect(authController.getMe({ user: payload } as any)).rejects.toThrow(
            NotFoundException,
        );
    });

    describe('auth controller - register & login (direct calls)', () => {
        it('controller.registerUser should register and return user', async () => {
            const dto = { email: 'controller.register@example.com', password: 'pass1234' };

            const created = await authController.registerUser(dto);

            expect(created).toBeDefined();
            expect(created.email).toBe(dto.email);
            // password should be hashed (not equal to plain text)
            expect(created.password).not.toBe(dto.password);

            // @ts-ignore
            expect(created._id).toBeDefined();
        });

        it('controller.registerUser should throw when email already exists', async () => {
            const dto = { email: 'dup@example.com', password: 'p1' };

            // first create
            await authController.registerUser(dto);

            // second attempt should throw BadRequestException (Email already Exists)
            await expect(authController.registerUser(dto)).rejects.toThrow(BadRequestException);
            // optionally check message
            await expect(authController.registerUser(dto)).rejects.toThrow('Email already Exists');
        });

        it('controller.loginUser should return access_token for valid credentials', async () => {
            const email = 'ctrl.login@example.com';
            const password = 'securePass';

            // register via service/controller so DB has user and password is hashed
            await authController.registerUser({ email, password });

            const result = await authController.loginUser({ email, password });
            expect(result).toBeDefined();
            expect(result).toHaveProperty('access_token');
            expect(typeof result.access_token).toBe('string');

            // Optionally verify token payload with jwtService
            const payload = jwtService.verify(result.access_token, { secret: '123' });
            expect(payload).toHaveProperty('id');
            expect(payload.email).toBe(email);
        });

        it('controller.loginUser should throw if email not found', async () => {
            await expect(
                authController.loginUser({ email: 'no-such@example.com', password: 'x' }),
            ).rejects.toThrow(ConflictException);
        });

        it('controller.loginUser should throw if password is wrong', async () => {
            const email = 'ctrl.wrongpass@example.com';
            const password = 'rightpass';

            // register the user
            await authController.registerUser({ email, password });

            // attempt login with wrong password
            await expect(
                authController.loginUser({ email, password: 'wrong' }),
            ).rejects.toThrow(BadRequestException);
        });
    });

});
