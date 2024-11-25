// src/users/users.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { AuthProvider, User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { generateRandomNickname } from 'src/core/utils/create-nickname';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async findById(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    return user;
  }

  async createNickname() {
    const nickname = generateRandomNickname();

    const user = await this.userRepository.findOne({
      where: { userName: nickname },
    });

    if (user) {
      return this.createNickname();
    }

    return nickname;
  }

  async createUser(user: CreateUserDto) {
    const newUser = this.userRepository.create();

    newUser.avatar = user.avatar;
    newUser.userName = await this.createNickname();
    newUser.email = user.email;
    newUser.provider = user.provider ?? AuthProvider.EMAIL;

    return await this.userRepository.manager.transaction(
      async (transactionalEntityManager) => {
        return await transactionalEntityManager.save(newUser, {
          reload: false,
        });
      },
    );
  }

  async findOrCreateUser(
    { email, avatar }: CreateUserDto,
    transactionEntityManager: EntityManager,
  ) {
    const currentUser = await this.userRepository.findOne({
      where: { email: email },
    });

    if (!currentUser) {
      const user = transactionEntityManager.create(User);

      user.avatar = avatar;
      user.userName = await this.createNickname();
      user.email = email;

      return transactionEntityManager.save(user);
    }

    return currentUser;
  }

  async findOneByUserName(userName: string) {
    const user = await this.userRepository.findOne({ where: { userName } });
    return user;
  }

  async updateUser(userName: string, updateUser: Partial<User>): Promise<User> {
    const user = await this.userRepository.findOne({ where: { userName } });
    const updatedUser = Object.assign(user, updateUser);
    return this.userRepository.save(updatedUser);
  }

  async deleteUser(id: number): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found.`);
    }
  }
}
