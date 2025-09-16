// user.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let service: UserService;

  const mockUserService = {
    findAll: jest.fn(),
    create: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    service = module.get<UserService>(UserService);
  });

  it('should return an empty array if no users exists', async () => {
    mockUserService.findAll.mockResolvedValue([]);
    const result = await controller.findAll();
    expect(result).toEqual([]);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should return all users', async () => {
    const fakeUsers = [
      { name: 'Alice', age: 22 },
      { name: 'Bob', age: 33},
    ];
    mockUserService.findAll.mockResolvedValue(fakeUsers);

    const result = await controller.findAll();
    expect(result).toEqual(fakeUsers);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should create a new user', async () => {
    const newUser = { name: 'Charlie', age: 22 };
    mockUserService.create.mockResolvedValue(newUser);

    const result = await controller.create(newUser);
    expect(result).toEqual(newUser);
    expect(service.create).toHaveBeenCalledWith(newUser);
  });

  it('should return specific user by ID',async () => {
    const fakeUser = {_id : 123,name: 'Mohamed',age: 40}
    mockUserService.findOne.mockResolvedValue(fakeUser)

    const result = await controller.findOne(123)
    expect(result).toEqual(fakeUser)
  })

  it('should return null if user not found',async () => {
    mockUserService.findOne.mockResolvedValue(null)

    const result = await controller.findOne(999)
    expect(result).toBeNull()
    expect(service.findOne).toHaveBeenCalledWith(999)
  })

  it('should update an existing user', async () => {
    const userId = 123;
    const updateDto = { name: 'Mohamed Updated', age: 23 };

    const updatedUser = { _id: userId, ...updateDto };

    // mock the service update method
    mockUserService.update.mockResolvedValue(updatedUser);

    // call controller
    // @ts-ignore
    const result = await controller.update(+userId, updateDto);

    // expectations
    expect(result).toEqual(updatedUser);
    expect(service.update).toHaveBeenCalledWith(userId, updateDto); 
 })
});
