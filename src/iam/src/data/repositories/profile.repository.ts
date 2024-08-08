import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Profile } from '../../module/user/entities/profile.entity';
import { Repository } from 'typeorm';

export interface IProfileRepository {
  createProfile(profile: Profile): Promise<Profile>;

  updateProfile(profile: Profile): Promise<void>;
}

@Injectable()
export class ProfileRepository implements IProfileRepository {
  constructor(
    @InjectRepository(Profile)
    private readonly profileRepository: Repository<Profile>,
  ) {}

  async updateProfile(profile: Profile): Promise<void> {
    await this.profileRepository.update(profile.id, profile);
  }

  async createProfile(profile: Profile): Promise<Profile> {
    return await this.profileRepository.save(profile);
  }
}
