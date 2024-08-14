import { In, Repository, SelectQueryBuilder } from 'typeorm';
import { User } from '../../module/user/entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';

export interface IUserRepository {
  createUser(user: User): Promise<User>;

  updateUser(user: User): Promise<void>;

  updatePass(userId: string, newPass: string): Promise<void>;

  findUsers(
    page: number,
    pageSize: number,
    orderBy: string,
    order: 'ASC' | 'DESC',
    searchTerm?: string,
  ): Promise<[User[], number]>;

  findUserByIds(ids: string[]): Promise<User[]>;

  findUserByName(name: string): Promise<User>;

  findUserByEmail(email: string): Promise<User>;

  findUserByPhone(phone: string): Promise<User>;

  findUserById(id: string): Promise<User>;

  getAllUsers(): Promise<User[]>;

  removeUser(user: User): Promise<User>;
}

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async updatePass(userId: string, newPass: string): Promise<void> {
    await this.userRepository.update(userId, {
      hashPass: newPass,
      updatedAt: new Date(),
    });
  }

  async findUserByPhone(phone: string): Promise<User> {
    return await this.userRepository.findOne({
      where: {
        phone: phone,
      },
      relations: {
        profile: true,
      },
      select: ['id', 'hashPass', 'role'],
    });
  }

  async findUserByName(name: string): Promise<User> {
    return await this.userRepository.findOne({
      where: {
        profile: {
          userName: name,
        },
      },
      relations: {
        profile: true,
        permissions: true,
      },
    });
  }

  async findUserByIds(ids: string[]): Promise<User[]> {
    return await this.userRepository.find({
      where: { id: In(ids) },
      relations: {
        profile: true,
        permissions: true,
      },
    });
  }

  async createUser(user: User): Promise<User> {
    return await this.userRepository.save(user);
  }

  async updateUser(user: User): Promise<void> {
    await this.userRepository.update(user.id, user);
  }

  async findUsers(
    page: number,
    pageSize: number,
    orderBy: string,
    order: 'ASC' | 'DESC',
    searchTerm?: string,
  ): Promise<[User[], number]> {
    const skip = (page - 1) * pageSize;
    const take = pageSize;

    const queryBuilder: SelectQueryBuilder<User> = this.userRepository
      .createQueryBuilder('user')
      .orderBy(`user.${orderBy}`, order)
      .skip(skip)
      .take(take);

    // Apply filter criteria to the query
    if (searchTerm) {
      queryBuilder.andWhere('user.email LIKE :email', {
        email: `%${searchTerm}%`,
      });
    }

    return await queryBuilder.getManyAndCount();
  }

  async findUserByEmail(email: string): Promise<User> {
    return await this.userRepository.findOne({
      where: {
        email: email,
      },
      relations: {
        profile: true,
      },
      select: ['id', 'hashPass', 'role'],
    });
  }

  async findUserById(id: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { id: id },
      relations: {
        profile: true,
      },
      select: ['id', 'hashPass', 'role', 'email'],
    });
  }

  async removeUser(user: User): Promise<User> {
    return await this.userRepository.remove(user);
  }

  async getAllUsers(): Promise<User[]> {
    return await this.userRepository.find();
  }
}
