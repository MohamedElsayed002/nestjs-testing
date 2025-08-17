import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { MongoMemoryServer } from 'mongodb-memory-server';
// import { User, UserSchema } from './schemas/user.schema';
import { MongooseModule } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { User, UserSchema } from './schema/user.schema';
import { NotFoundException } from '@nestjs/common';

jest.setTimeout(30000); // 30 seconds

describe('UserService (Integration)', () => {
  let service: UserService;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();


    const module: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
      ],
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterAll(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.dropDatabase();
      await mongoose.connection.close();
    }
    if (mongod) {
      await mongod.stop();
    }
  });

  afterEach(async () => {
    await mongoose.connection.db?.collection('users').deleteMany({});
  });


  it('getHello', () => {
    expect(service.getHello()).toBe('Hello Mr Mohamed!')
  })

  it('should return an empty array when no users exist', async () => {
    const users = await service.findAll();
    expect(users).toEqual([]);
  });

  it('should return all users when they exist', async () => {
    await service.create({ name: 'Mohamed', age: 54, tags: ['tag1'] });
    await service.create({ name: 'Bob', age: 22 });

    const users = await service.findAll();

    expect(users.length).toBe(2);
    expect(users[0].name).toBe('Mohamed');
    expect(users[1].name).toBe('Bob');
  });

  it('should return specific user by id', async () => {
     const user = await service.create({
      name: 'Mohamed',
      age: 22,
      tags: ['tag1']
     })

     // @ts-ignore
     const foundUser = await service.findOne(user._id.toString())

     expect(foundUser).toBeDefined()
     expect(foundUser.name).toBe('Mohamed')
  })

  it('Should throw NotFoundException if user does not exists',async () => {
    const fakeId = new mongoose.Types.ObjectId().toString()

    await expect(service.findOne(fakeId)).rejects.toThrow(NotFoundException)
  })  


  it('should update a user successfully',async () => {
    // 1- Create a user 
    const user = await service.create({
      name: 'Mohamed',
      age: 22,
      tags: ['tag1']
    })

    // 2- Update the user 
    const updateDto = { name: 'Mohamed', age: 25}

    // @ts-ignore
    const updateUser = await service.update(user._id.toString(),updateDto)


    // 3- Assertions
    expect(updateUser).toBeDefined()
    expect(updateUser.name).toBe('Mohamed')
    expect(updateUser.age).toBe(25)

    // Make sure it updated
    // @ts-ignore
    const foundUser = await service.findOne(user._id.toString())
    expect(foundUser.name).toBe('Mohamed')
    expect(foundUser.age).toBe(25)
  })

  it('should throw an error if the user not found',async () => {
    const fakeID = new mongoose.Types.ObjectId().toString()
    const updatedDto = { name : 'Mohamed update'}

    // @ts-ignore
    await expect(service.update(fakeID,updatedDto)).rejects.toThrow(NotFoundException)
  })


  it('delete the user', async () => {
    // 1- Create a user 
    const user = await service.create({
      name: 'Mohamed',
      age: 22
    })

    // 2- Delete user 
    const deleteUser = await service.remove(user._id.toString())

    expect(deleteUser.message).toBe('User deleted')
  })

  it('return an error. user not found to delete',async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();
    await expect(service.remove(fakeId)).rejects.toThrow(NotFoundException);
  })
});
