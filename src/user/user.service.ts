import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './schema/user.schema';
import { Model } from 'mongoose';


@Injectable()
export class UserService {

  constructor(
    @InjectModel(User.name) private userModel : Model<User>,
  ) {}



  create(createUserDto: CreateUserDto) {
    const createUser = new this.userModel(createUserDto)
    return createUser.save()
  }

  async findAll() {
    const users = await this.userModel.find({})
    return users
  }

  async findOne(id) {
      const user = await this.userModel.findById(id).exec()
      if(!user) {
        throw new NotFoundException(`User with ID ${id} not found`)
      }
      return user
  }

  async update(id, updateUserDto: UpdateUserDto) {
    const userUpdated = await this.userModel.findByIdAndUpdate(id,updateUserDto,{new: true})
    if(!userUpdated) {
      throw new NotFoundException(`User with ID ${id} not found`)
    }
    return userUpdated
  }

  async remove(id) {
    const user = await this.userModel.findByIdAndDelete(id)
    if(!user) {
            throw new NotFoundException(`User with ID ${id} not found`)
    }
    return { message : 'User deleted'}
  }

  getHello() : string {
    return 'Hello Mr Mohamed!'
  }
}
