import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { ConfigData } from 'building-blocks/databases/config/config-data';
import { randomQueueName } from 'building-blocks/utils/random-queue';
import { DataSource, QueryRunner } from 'typeorm';
import { IModuleRepository } from '../../../../../data/repositories/module.repository';
import { ModuleDto } from '../../../../../module/menu/dtos/module.dto';
import { Modules } from '../../../../../module/menu/entities/module.entity';
import mapper from '../../../../../module/menu/mapping';
import { Permission } from '../../../../../module/permission/entities/permission.entity';
import { TYPE_DESC } from '../../../../../module/permission/enums/type-action.enum';
import { IPermissionRepository } from './../../../../../data/repositories/permission.repository';

// =================================== Command ==========================================
export class CreateModule {
  userIdLogin: string;
  name: string;
  desc: string;
  parentId: string;
  typePermissions: number[];

  constructor(item: Partial<CreateModule> = {}) {
    Object.assign(this, item);
  }
}

// =====================================Command Handler =================================================
@CommandHandler(CreateModule)
export class CreateModuleHandler implements ICommandHandler<CreateModule> {
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
    routingKey: RoutingKey.MOBILE_BE.CREATE_MODULE,
    queue: randomQueueName(),
    queueOptions: { autoDelete: true },
  })
  async execute(command: CreateModule): Promise<ModuleDto> {
    const queryRunner: QueryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();

    await queryRunner.startTransaction();

    try {
      const { name, parentId, desc, typePermissions, userIdLogin } = command;
      let parentModule: Modules;

      let module = new Modules({
        name: name,
        desc: desc,
        parentId: parentId,
      });

      if (parentId) {
        parentModule = await this.moduleRepository.findById(parentId);

        if (!parentModule) {
          throw new NotFoundException('Parent module not found');
        }

        module = this.configData.createData(module, userIdLogin);
        module.parent = parentModule;
        module.permisions = [];
      } else {
        module = this.configData.createData(module, userIdLogin);
        module.subModules = [];
        module.permisions = [];
      }

      module = await queryRunner.manager.save(Modules, module);

      const permisisons = [];
      if (typePermissions.length > 0) {
        for (const item of typePermissions) {
          let permission = new Permission({
            type: item,
            moduleId: module.id,
            desc: TYPE_DESC[`${item}`],
          });
          permission = this.configData.createData(permission, userIdLogin);
          permission.module = module;
          permisisons.push(permission);
        }
      }

      if (permisisons.length > 0) {
        await queryRunner.manager.save(Permission, permisisons);
      }

      await queryRunner.commitTransaction();

      const result = mapper.map<Modules, ModuleDto>(module, new ModuleDto());

      result.permissions = permisisons.map((item) => {
        return {
          id: item.id,
          type: item.type,
          desc: item.desc,
        };
      });

      return result;
    } catch (err) {
      await queryRunner.rollbackTransaction();
      return err;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }
}
