import { AmqpConnection, RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import configs from 'building-blocks/configs/configs';
import { ConfigData } from 'building-blocks/databases/config/config-data';
import { RedisCacheService } from 'building-blocks/redis/redis-cache.service';
import ApplicationException from 'building-blocks/types/exceptions/application.exception';
import { randomQueueName } from 'building-blocks/utils/random-queue';
import { DataSource } from 'typeorm';
import { IGroupRepository } from '../../../../../data/repositories/group.repository';
import { IPermissionRepository } from '../../../../../data/repositories/permission.repository';
import { IProfileRepository } from '../../../../../data/repositories/profile.repository';
import { IUserRepository } from '../../../../../data/repositories/user.repository';
import { Role } from '../../../enums/role.enum';
import { RoutingKey } from './../../../../../../../building-blocks/constants/rabbitmq.constant';

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

@Injectable()
export class CreateUserHandler {
  private logger = new Logger(CreateUserHandler.name);
  constructor(
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
    @Inject('IProfileRepository')
    private readonly profileRepository: IProfileRepository,
    @Inject('IGroupRepository')
    private readonly groupRepository: IGroupRepository,
    private readonly configData: ConfigData,
    private readonly dataSource: DataSource,
    private readonly amqpConnection: AmqpConnection,
    private readonly redisCacheService: RedisCacheService,
  ) {}

  @RabbitRPC({
    exchange: configs.rabbitmq.exchange,
    routingKey: RoutingKey.MOBILE_BE.REGISTER,
    queue: randomQueueName(),
    queueOptions: { autoDelete: true },
  })
  private async execute(payload: any) {
    try {
      const existUser = await this.userRepository.findUserByEmail(
        payload.email,
      );
      if (existUser) {
        throw new ConflictException('Email has already taken');
      }

      const existPhone = await this.userRepository.findUserByPhone(
        payload.email,
      );
      if (existPhone) {
        throw new ConflictException('Phone number has already taken');
      }

      const otp = await this.amqpConnection.request<any>({
        exchange: configs.rabbitmq.exchange,
        routingKey: RoutingKey.AUTH.REGISTER,
        payload: payload,
        timeout: 10000,
      });

      if (otp) {
        await this.redisCacheService.setCacheExpried(
          `otp:${payload.email}`,
          JSON.stringify(payload),
          60,
        );
        return otp;
      } else {
        throw new ApplicationException(
          'Something went wrong. Please try again!',
        );
      }
    } catch (error) {
      this.logger.error(error.message);
      return {
        messageResp: error.message,
      };
    }
  }
}
