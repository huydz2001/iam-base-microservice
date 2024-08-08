import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Group } from '../..//module/group/entities/group.entity';

export interface IGroupRepository {
  createGroup(group: Group): Promise<Group>;

  findGroupById(id: string): Promise<Group>;

  findGroupByIds(ids: string[]): Promise<Group[]>;

  findGroupByName(name: string): Promise<Group>;

  updateGroup(group: Group): Promise<void>;

  removeGroup(group: Group): Promise<Group>;
}

export class GroupRepository implements IGroupRepository {
  constructor(
    @InjectRepository(Group)
    private readonly groupRepository: Repository<Group>,
  ) {}

  async findGroupById(id: string): Promise<Group> {
    return await this.groupRepository.findOne({
      where: { id: id },
      relations: {
        users: true,
        permissions: true,
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
