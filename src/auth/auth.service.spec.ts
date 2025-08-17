import { Test, TestingModule } from "@nestjs/testing";
import { MongooseModule } from "@nestjs/mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { AuthService } from "./auth.service";
import { Auth, AuthSchema } from "./schema/auth.schema";
import { JwtService } from "@nestjs/jwt";
import { BadRequestException, ConflictException, NotFoundException } from "@nestjs/common";

jest.setTimeout(30000)

describe('AuthService (Integration', () => {
  let service: AuthService
  let mongod: MongoMemoryServer

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create()
    const uri = mongod.getUri()

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: Auth.name, schema: AuthSchema }])
      ],
      providers: [
        AuthService,
        JwtService
      ]
    }).compile()

    service = module.get<AuthService>(AuthService)
  })

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase()
      await mongoose.connection.close()
    }
    if (mongod) {
      await mongod.stop()
    }
  })

  afterEach(async () => {
    await mongoose.connection.db?.collection('auth').deleteMany({})
  })

  describe('registerUser', () => {
    it('should register a new user', async () => {
      const user = await service.registerUser({
        email: "test@example.com",
        password: 'password123'
      })

      expect(user).toBeDefined()
      expect(user.email).toBe('test@example.com')
      expect(user.password).not.toBe('password123')
    })

    it('should throw if email already exists', async () => {
      await expect(
        service.registerUser({
          email: 'test@example.com',
          password: '1234',
        }),
      ).rejects.toMatchObject({
        message: 'Email already Exists',
        constructor: BadRequestException,
      });
    })
  })


  describe('loginUser', () => {
    it('should login successfully and return token', async () => {
      await service.registerUser({
        email: 'mohamed@example.com',
        password: "password123"
      })

      const result = await service.loginUser({
        email: 'mohamed@example.com',
        password: 'password123'
      })

      expect(result).toHaveProperty('access_token')
      expect(typeof result.access_token).toBe('string')
    })

    it('should throw if email not found', async () => {
      await expect(
        service.loginUser({
          email: "dsd@gmail.com",
          password: '32444'
        }),
      ).rejects.toThrow(ConflictException)
    })

    it('should throw if password is wrong', async () => {
      await service.registerUser({
        email: "ahmed@gmail.com",
        password: "1234"
      })

      await expect(
        service.loginUser({
          email: 'ahmed@gmail.com',
          password: "wrongpassword"
        })
      ).rejects.toThrow(BadRequestException)
    })
  })


  describe('show user data', () => {
    it('should return the current user data', async () => {
      // register user 
      const created = await service.registerUser({
        email: 'profile@gmail.com',
        password: '123432'
      })

      // @ts-ignore
      const profile = await service.getCurrentUser(created._id.toString())

      expect(profile).toBeDefined()
      expect(profile.email).toBe('profile@gmail.com')

    })

    it('should throw NotFoundException if current user not found', async () => {
      const fakeId = new mongoose.Types.ObjectId().toString();
      await expect(service.getCurrentUser(fakeId)).rejects.toThrow(NotFoundException);
    });
  })
})