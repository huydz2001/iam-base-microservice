import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';

export class ReponseDto {
  message: string;
  name: string;

  constructor(item: Partial<ReponseDto>) {
    Object.assign(this, item);
  }
}

export const handleRpcError = (response: ReponseDto) => {
  const { name, message } = response;
  switch (name) {
    case 'ForbiddenException':
      throw new ForbiddenException(message);

    case 'UnauthorizedException':
      throw new UnauthorizedException(message);

    case 'BadRequestException':
      throw new BadRequestException(message);

    case 'NotFoundException':
      throw new NotFoundException(message);

    case 'InternalServerErrorException':
      throw new InternalServerErrorException(message);

    default:
      throw new HttpException(message, HttpStatus.CONFLICT);
  }
};
