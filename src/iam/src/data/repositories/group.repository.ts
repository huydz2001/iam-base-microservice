import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Group } from '../..//module/group/entities/group.entity';

export interface IGroupRepository {
  createGroup(group: Group): Promise<Group>;

  findGroupById(id: string): Promise<Group>;

  findGroupByIds(ids: string[]): Promise<Group[]>;

  findGroupsByUserId(id: string): Promise<Group[]>;

  findGroupByName(name: string): Promise<Group>;

  updateGroup(group: Group): Promise<void>;

  removeGroup(group: Group): Promise<Group>;
}

export class GroupRepository implements IGroupRepository {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  async findGroupsByUserId(id: string): Promise<Group[]> {
    return await this.groupRepository.find({
      where: {
        isDeleted: false,
        users: {
          id: id,
        },
      },
      relations: { users: true },
    });
  }

  async findGroupById(id: string): Promise<Group> {
    return await this.groupRepository.findOne({
      where: { id: id },
      relations: {
        users: true,
        permissions: {
          module: true,
        },
      },
      select: {
        users: {
          id: true,
          email: true,
          phone: true,
          role: true,
          isEmailVerified: true,
        },
        permissions: {
          id: true,
          type: true,
          desc: true,
          moduleId: true,
          module: {
            id: true,
            name: true,
            desc: true,
            parentId: true,
          },
        },
      },
    });
  }

  async findGroupByName(name: string): Promise<Group> {
    return await this.groupRepository.findOne({
      where: { name: name, isDeleted: false },
    });
  }

  async findGroupByIds(ids: string[]): Promise<Group[]> {
    return this.groupRepository.find({
      where: { id: In(ids), isDeleted: false },
    });
  }

  async createGroup(group: Group): Promise<Group> {
    return await this.groupRepository.save(group);
  }

  async updateGroup(group: Group): Promise<void> {
    await this.groupRepository.save(group);
  }

  async removeGroup(group: Group): Promise<Group> {
    return await this.groupRepository.remove(group);
  }
}
