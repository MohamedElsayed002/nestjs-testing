import { IsString, IsEmail, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateUserDto {

    @IsNotEmpty()
    @IsString()
    email: string

    @IsNotEmpty()
    @IsString()
    password: string
}
