import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Auth } from './schema/auth.schema';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {

    constructor(
        @InjectModel(Auth.name) private authModel: Model<Auth>,
        private jwtService: JwtService
    ) {}

    async registerUser(createUser: CreateUserDto): Promise<Auth> {
        const { email , password} = createUser
        const alreadyExist = await this.authModel.findOne({email})

        if(alreadyExist) {
            throw new BadRequestException('Email already Exists')
        }

        const hashPassword = bcrypt.hashSync(password,8)

        const user = new this.authModel({
            email,
            password: hashPassword
        });

        return user.save()

    }

    async loginUser(loginUser: CreateUserDto): Promise<{access_token: string}> {
        const user = await this.authModel.findOne({email: loginUser.email})

        if(!user) {
            throw new ConflictException('Email not found')
        }

        if(!bcrypt.compareSync(loginUser.password,user.password)) {
            throw new BadRequestException('Invalid Password')
        }

        const access_token = this.jwtService.sign(
            {
                id: user['_id'],
                email: user['email']
            },
        { secret: '123', expiresIn: '1h' }, // ✅ Corrected expiration format
        )

        return { access_token}
    }


    async getCurrentUser(userId: string) {
        const user = await this.authModel.findById(userId)
        if(!user) {
            throw new NotFoundException('User not found')
        }
        return user
    }
}
