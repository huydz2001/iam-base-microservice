import { RabbitRPC } from '@golevelup/nestjs-rabbitmq';
import { Inject, Logger, NotFoundException } from '@nestjs/common';
import configs from 'building-blocks/configs/configs';
import { RoutingKey } from 'building-blocks/constants/rabbitmq.constant';
import { ConfigData } from 'building-blocks/databases/config/config-data';
import { randomQueueName } from 'building-blocks/utils/random-queue';
import { IModuleRepository } from '../../../../../data/repositories/module.repository';
import { ModuleDto } from '../../../../../module/menu/dtos/module.dto';
import { Modules } from '../../../../../module/menu/entities/module.entity';
import mapper from '../../../../../module/menu/mapping';

// =================================== Caommand ==========================================
export class DeleteModule {
  id: string;

  constructor(item: Partial<DeleteModule> = {}) {
    Object.assign(this, item);
  }
}

export class DeleteModuleHandler {
  private logger = new Logger(DeleteModuleHandler.name);
  constructor(
    @Inject('IModuleRepository')
    private readonly moduleRepository: IModuleRepository,
    private readonly configData: ConfigData,
  ) {}

  @RabbitRPC({
    exchange: configs.rabbitmq.exchange,
    routingKey: RoutingKey.MOBILE_BE.DEL_MODULE,
    queue: randomQueueName(),
    queueOptions: { autoDelete: true },
  })
  async execute(command: DeleteModule): Promise<ModuleDto> {
    try {
      const { id } = command;

      const exsitModule = await this.moduleRepository.findById(id);

      if (!exsitModule) {
        throw new NotFoundException('Module not found');
      }

      const module = await this.moduleRepository.removeModule(exsitModule);
      module.id = id;

      const result = mapper.map<Modules, ModuleDto>(module, new ModuleDto());

      return result;
    } catch (err) {
      this.logger.error(err.message);
      return err;
    }
  }
}
