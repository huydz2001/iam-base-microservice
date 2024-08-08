import { TypeMapper } from 'ts-mapper';
import { PermissionDto } from './dtos/permission.dto';
import { Permission } from './entities/permission.entity';

export class Mapper extends TypeMapper {
  constructor() {
    super();
    this.config();
  }

  private config(): void {
    this.createMap<Permission, PermissionDto>()
      .map(
        (src) => src.type,
        (dest) => dest.type,
      )
      .map(
        (src) => src.desc,
        (dest) => dest.desc,
      )
      .map(
        (src) => src.moduleId,
        (dest) => dest.moduleId,
      )
      .map(
        (src) => src.module,
        (dest) => dest.module,
      )
      .map(
        (src) => src.createdAt,
        (dest) => dest.createdAt,
      )
      .map(
        (src) => src.updatedAt,
        (dest) => dest.updatedAt,
      )
      .map(
        (src) => src.createdBy,
        (dest) => dest.createdBy,
      )
      .map(
        (src) => src.updatedBy,
        (dest) => dest.updatedBy,
      )
      .map(
        (src) => src.isDeleted,
        (dest) => dest.isDeleted,
      )
      .map(
        (src) => src.deletedBy,
        (dest) => dest.deletedBy,
      );
  }
}

const mapper = new Mapper();

export default mapper;
