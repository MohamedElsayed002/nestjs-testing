import { IsString, IsEmail, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateUserDto {

    @IsNotEmpty()
    @IsString()
    name: string

    @IsNotEmpty()
    @IsNumber()
    age: number

    @IsOptional()
    tags?: string[]
}
