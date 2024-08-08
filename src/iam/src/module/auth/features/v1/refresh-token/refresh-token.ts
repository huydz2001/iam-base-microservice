import {
  Body,
  Controller,
  Inject,
  Post,
  UnauthorizedException,
} from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import Joi from 'joi';
import { IAuthRepository } from '../../../../../data/repositories/auth.repository';
import { AuthDto } from '../../../dtos/auth.dto';
import { TokenType } from '../../../enums/token-type.enum';
import { GenerateToken } from '../generate-token/generate-token';
import { ValidateToken } from '../validate-token/validate-token';
import { IUserRepository } from '../../../../../data/repositories/user.repository';
import { Auth } from '../../../../../common/decorator/auth.decorator';

export class RefreshToken {
  refreshToken: string;

  constructor(request: Partial<RefreshToken> = {}) {
    Object.assign(this, request);
  }
}

const refreshTokenValidations = {
  params: Joi.object().keys({
    refreshToken: Joi.string().required(),
  }),
};

@ApiBearerAuth()
@ApiTags('Identities')
@Controller({
  path: `/identity`,
  version: '1',
})
export class RefreshTokenController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('refresh-token')
  @Auth()
  public async refreshToken(
    @Body('refreshToken') refreshToken: string,
  ): Promise<AuthDto> {
    const result = await this.commandBus.execute(
      new RefreshToken({ refreshToken: refreshToken }),
    );

    return result;
  }
}

@CommandHandler(RefreshToken)
export class RefreshTokenHandler implements ICommandHandler<RefreshToken> {
  constructor(
    @Inject('IAuthRepository') private readonly authRepository: IAuthRepository,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: RefreshToken): Promise<AuthDto> {
    await refreshTokenValidations.params.validateAsync(command);

    try {
      const refreshTokenData = await this.commandBus.execute(
        new ValidateToken({
          token: command.refreshToken,
          type: TokenType.REFRESH,
        }),
      );
      const { userId } = refreshTokenData;

      const user = await this.userRepository.findUserById(userId);

      await this.authRepository.removeToken(refreshTokenData);

      const result = await this.commandBus.execute(
        new GenerateToken({ userId: userId, role: user.role }),
      );

      return result;
    } catch (error) {
      throw new UnauthorizedException('Please authenticate');
    }
  }
}
