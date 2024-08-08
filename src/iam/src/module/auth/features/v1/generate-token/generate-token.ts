import { Inject } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import configs from 'building-blocks/configs/configs';
import Joi from 'joi';
import jwt from 'jsonwebtoken';
import moment from 'moment';
import { IAuthRepository } from '../../../../../data/repositories/auth.repository';
import { Role } from '../../../../../module/user/enums/role.enum';
import { AuthDto } from '../../../dtos/auth.dto';
import { Token } from '../../../entities/token.entity';
import { TokenType } from '../../../enums/token-type.enum';

export class GenerateToken {
  userId: string;
  role: number;

  constructor(request: Partial<GenerateToken> = {}) {
    Object.assign(this, request);
  }
}

const generateTokenValidations = {
  params: Joi.object().keys({
    userId: Joi.string().required(),
    role: Joi.number().required(),
  }),
};

const generateJwtToken = (
  userId: string,
  role: Role,
  expires: number,
  type: TokenType,
  secret: string = configs.jwt.secret,
): string => {
  const payload = {
    id: userId,
    role: role,
    iat: moment().unix(),
    exp: expires,
    type,
  };
  return jwt.sign(payload, secret);
};

@CommandHandler(GenerateToken)
export class GenerateTokenHandler implements ICommandHandler<GenerateToken> {
  constructor(
    @Inject('IAuthRepository') private readonly authRepository: IAuthRepository,
  ) {}

  async execute(command: GenerateToken): Promise<AuthDto> {
    await generateTokenValidations.params.validateAsync(command);

    const accessTokenExpires = moment().add(
      configs.jwt.accessExpirationHours,
      'hours',
    );

    const accessToken = generateJwtToken(
      command.userId,
      command.role,
      accessTokenExpires.unix(),
      TokenType.ACCESS,
    );

    const refreshTokenExpires = moment().add(
      configs.jwt.refreshExpirationDays,
      'days',
    );
    const refreshToken = generateJwtToken(
      command.userId,
      command.role,
      refreshTokenExpires.unix(),
      TokenType.REFRESH,
    );

    await this.authRepository.createToken(
      new Token({
        accessToken: accessToken,
        refreshToken: refreshToken,
        expires: accessTokenExpires.toDate(),
        type: TokenType.ACCESS,
        blacklisted: false,
        userId: command.userId,
      }),
    );

    const result = {
      access: {
        token: accessToken,
        expires: accessTokenExpires.toDate(),
      },
      refresh: {
        token: refreshToken,
        expires: refreshTokenExpires.toDate(),
      },
    };

    return new AuthDto(result);
  }
}
