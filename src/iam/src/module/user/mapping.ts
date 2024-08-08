import { TypeMapper } from 'ts-mapper';
import { User } from './entities/user.entity';
import { UserDto } from './dtos/user-dto';

export class Mapper extends TypeMapper {
  constructor() {
    super();
    this.config();
  }

  private config(): void {
    this.createMap<User, UserDto>()
      .map(
        (src) => src.id,
        (dest) => dest.id,
      )
      .map(
        (src) => src.profile,
        (dest) => dest.profile,
      )
      .map(
        (src) => src.isEmailVerified,
        (dest) => dest.isEmailVerified,
      )
      .map(
        (src) => src.groups,
        (dest) => dest.groups,
      )
      .map(
        (src) => src.token,
        (dest) => dest.token,
      )
      .map(
        (src) => src.role,
        (dest) => dest.role,
      )
      .map(
        (src) => src.email,
        (dest) => dest.email,
      )
      .map(
        (src) => src.permissions,
        (dest) => dest.permissions,
      )
      .map(
        (src) => src.phone,
        (dest) => dest.phone,
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
