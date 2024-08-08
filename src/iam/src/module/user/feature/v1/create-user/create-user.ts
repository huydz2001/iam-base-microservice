import {
  Body,
  ConflictException,
  Controller,
  HttpStatus,
  Inject,
  Post,
  Res,
} from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import { UserCreated } from 'building-blocks/constracts/identity-constract';
import { HttpContext } from 'building-blocks/context/context';
import { ConfigData } from 'building-blocks/databases/config/config-data';
import { IRabbitmqPublisher } from 'building-blocks/rabbitmq/interfaces/rabbitmq-publisher.interface';
import { encryptPassword } from 'building-blocks/utils/encryption';
import { Response } from 'express';
import Joi from 'joi';
import { IGroupRepository } from '../../../../../data/repositories/group.repository';
import { IPermissionRepository } from '../../../../../data/repositories/permission.repository';
import { IProfileRepository } from '../../../../../data/repositories/profile.repository';
import { IUserRepository } from '../../../../../data/repositories/user.repository';
import { Group } from '../../../../../module/group/entities/group.entity';
import { Permission } from '../../../../../module/permission/entities/permission.entity';
import { Profile } from '../../../../../module/user/entities/profile.entity';
import { UserDto } from '../../../dtos/user-dto';
import { User } from '../../../entities/user.entity';
import { Role } from '../../../enums/role.enum';
import mapper from '../../../mapping';
import { QueryRunner, DataSource } from 'typeorm';
import { TYPE_ACTION } from '../../../../../module/permission/enums/type-action.enum';

export class CreateUser {
  email: string;
  password: string;
  name: string;
  permissionIds: string[];
  groupIds: string[];
  phone: string;
  role: Role;

  constructor(request: Partial<CreateUser> = {}) {
    Object.assign(this, request);
  }
}

export class CreateUserRequestDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  password: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  role: Role;

  @ApiProperty()
  permissionIds: string[];

  @ApiProperty()
  groupIds: string[];

  constructor(request: Partial<CreateUserRequestDto> = {}) {
    Object.assign(this, request);
  }
}

@ApiBearerAuth()
@ApiTags('Users')
@Controller({
  path: `/user`,
  version: '1',
})
export class CreateUserController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('create')
  public async createUser(
    @Body() request: CreateUserRequestDto,
    @Res() res: Response,
  ): Promise<UserDto> {
    const result = await this.commandBus.execute(
      new CreateUser({
        email: request.email,
        phone: request.phone,
        permissionIds: request.permissionIds,
        groupIds: request.groupIds,
        password: request.password,
        name: request.name,
        role: request.role,
      }),
    );

    res.status(HttpStatus.CREATED).send(result);

    return result;
  }
}

@CommandHandler(CreateUser)
export class CreateUserHandler implements ICommandHandler<CreateUser> {
  constructor(
    @Inject('IRabbitmqPublisher')
    private readonly rabbitmqPublisher: IRabbitmqPublisher,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
    @Inject('IProfileRepository')
    private readonly profileRepository: IProfileRepository,
    @Inject('IGroupRepository')
    private readonly groupRepository: IGroupRepository,
    private readonly configData: ConfigData,
    private readonly dataSource: DataSource,
  ) {}
  async execute(command: CreateUser): Promise<UserDto> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    const { email, password, name, permissionIds, groupIds, phone, role } =
      command;

    const createUserValidations = Joi.object({
      email: Joi.string().required().email(),
      name: Joi.string().required(),
      phone: Joi.string().optional(),
      permissionIds: Joi.array(),
      groupIds: Joi.array(),
      password: Joi.string().required(),
      role: Joi.string().required().valid(Role.USER, Role.ADMIN, Role.GUEST),
    });

    let groups: Group[];
    let permissions: Permission[];

    await createUserValidations.validateAsync(command);

    const existUser = await this.userRepository.findUserByEmail(email);

    if (existUser) {
      throw new ConflictException('Email already taken');
    }

    if (groupIds.length > 0) {
      groups = await this.groupRepository.findGroupByIds(groupIds);
    }

    permissions = await this.permissionRepository.findByType(TYPE_ACTION.VIEW);

    if (permissionIds.length > 0) {
      const permissionsFilter =
        await this.permissionRepository.findByIds(permissionIds);
      permissions = [...new Set([...permissions, ...permissionsFilter])];
    }

    await queryRunner.startTransaction();

    try {
      const userEntity = new User({
        email: email,
        phone: phone,
        hashPass: await encryptPassword(password),
        role: role,
        profile: null,
        permissions: permissions ?? [],
        groups: groups ?? [],
        isEmailVerified: false,
      });

      const userId = HttpContext.request?.user?.['id'] ?? '99';

      const newUserEntity = this.configData.createData(userEntity, userId);

      // Lưu user entity
      const createdUser = await queryRunner.manager.save(User, newUserEntity);

      // Tạo profile entity
      const profileEntity = new Profile({
        id: createdUser.id,
        userName: null,
        fullName: name,
        dob: null,
        gender: null,
        image: null,
        user: createdUser,
      });

      const newProfileEntity = this.configData.createData(
        profileEntity,
        userId,
      );

      // Lưu profile entity
      await queryRunner.manager.save(Profile, newProfileEntity);

      // Commit transaction
      await queryRunner.commitTransaction();

      const result = mapper.map<User, UserDto>(userEntity, new UserDto());

      await this.rabbitmqPublisher.publishMessage(new UserCreated(result));

      return result;
    } catch (error) {
      // Rollback transaction in case of error
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
}
