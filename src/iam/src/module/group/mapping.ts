import { TypeMapper } from 'ts-mapper';
import { Group } from 'src/module/group/entities/group.entity';
import { GroupDto } from './dtos/group-dto';

export class Mapper extends TypeMapper {
  constructor() {
    super();
    this.config();
  }

  private config(): void {
    this.createMap<Group, GroupDto>()
      .map(
        (src) => src.id,
        (dest) => dest.id,
      )
      .map(
        (src) => src.name,
        (dest) => dest.name,
      )
      .map(
        (src) => src.desc,
        (dest) => dest.desc,
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
