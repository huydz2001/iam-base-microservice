import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import {
  ConflictException,
  Inject,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { ConfigData } from 'building-blocks/databases/config/config-data';
import { randomQueueName } from 'building-blocks/utils/random-queue';
import { DataSource, QueryRunner } from 'typeorm';
import { IModuleRepository } from '../../../../../data/repositories/module.repository';
import { IPermissionRepository } from '../../../../../data/repositories/permission.repository';
import { ModuleDto } from '../../../../../module/menu/dtos/module.dto';
import { Modules } from '../../../../../module/menu/entities/module.entity';
import mapper from '../../../../../module/menu/mapping';
import { Permission } from '../../../../../module/permission/entities/permission.entity';
import { TYPE_DESC } from '../../../../../module/permission/enums/type-action.enum';

// =================================== Command ==========================================
export class UpdateModule {
  id: string;
  name: string;
  desc: string;
  parentId: string;
  typePermisisons: number[];
  userIdLogin: string;

  constructor(item: Partial<UpdateModule> = {}) {
    Object.assign(this, item);
  }
}

export class UpdateModuleHandler {
  private logger = new Logger(UpdateModuleHandler.name);
  constructor(
    @Inject('IModuleRepository')
    private readonly moduleRepository: IModuleRepository,
    @Inject('IPermissionRepository')
    private readonly permissionRepository: IPermissionRepository,
    private readonly configData: ConfigData,
    private readonly dataSource: DataSource,
  ) {}

  @RabbitRPC({
    exchange: configs.rabbitmq.exchange,
    routingKey: RoutingKey.MOBILE_BE.UPDATE_MODULE,
    queue: randomQueueName(),
    queueOptions: { autoDelete: true },
  })
  async execute(command: UpdateModule): Promise<ModuleDto> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();
    try {
      const { id, name, parentId, desc, typePermisisons, userIdLogin } =
        command;

      let existModule = await this.moduleRepository.findById(id);
      if (!existModule) {
        throw new NotFoundException('Module not found!');
      }

      const moduleFilter = await this.moduleRepository.findByName(name);
      if (moduleFilter && moduleFilter.id !== id) {
        throw new ConflictException('Module has already exsit!');
      }

      existModule.name = name;
      existModule.desc = desc;
      existModule = this.configData.updateData(existModule, userIdLogin);

      let parentModule: Modules;
      const permissions = [];
      if (parentId) {
        parentModule = await this.moduleRepository.findById(parentId);

        if (!parentModule) {
          throw new NotFoundException('Parent module not found');
        }

        const existPermission =
          await this.permissionRepository.findByModuleId(id);
        const exsitPermissonType = existPermission.map((item) => item.type);

        const typesDel = exsitPermissonType.filter(
          (item) => !typePermisisons.includes(item),
        );

        const typesNew = typePermisisons.filter(
          (item) => !exsitPermissonType.includes(item),
        );

        existModule.permisions = existModule.permisions.filter(
          (item) => !typesDel.includes(item.type),
        );

        if (typesDel.length > 0) {
          const permissionsDel =
            await this.permissionRepository.findByTypesAndModuleId(
              typesDel,
              id,
            );
          await queryRunner.manager.delete(Permission, permissionsDel);
        }

        if (typesNew.length > 0) {
          for (const item of typesNew) {
            let permission = new Permission({
              type: item,
              moduleId: id,
              desc: TYPE_DESC[`${item}`],
            });
            permission = this.configData.createData(permission, userIdLogin);
            permission.module = existModule;
            permissions.push(permission);
          }
        }
      } else {
        existModule.parentId = null;
      }

      existModule = await queryRunner.manager.save(Modules, existModule);

      if (permissions.length > 0) {
        await queryRunner.manager.save(Permission, permissions);
      }

      await queryRunner.commitTransaction();

      const result = mapper.map<Modules, ModuleDto>(
        existModule,
        new ModuleDto(),
      );

      result.permissions = [...permissions, ...existModule.permisions].map(
        (item) => {
          return {
            id: item.id,
            type: item.type,
            desc: item.desc,
          };
        },
      );

      return result;
    } catch (err) {
      this.logger.error(err.message);
      await queryRunner.rollbackTransaction();
      return err;
    } finally {
      await queryRunner.release();
    }
  }
}
