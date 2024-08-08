import { Body, Controller, Inject, Post } from '@nestjs/common';
import { CommandBus, CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ApiBearerAuth, ApiProperty, ApiTags } from '@nestjs/swagger';
import ApplicationException from 'building-blocks/types/exceptions/application.exception';
import { isPasswordMatch } from 'building-blocks/utils/encryption';

import Joi from 'joi';
import { IAuthRepository } from '../../../../../data/repositories/auth.repository';
import { IUserRepository } from '../../../../../data/repositories/user.repository';
import { AuthDto } from '../../../../auth/dtos/auth.dto';
import { GenerateToken } from '../generate-token/generate-token';

export class Login {
  email: string;
  password: string;

  constructor(request: Partial<Login> = {}) {
    Object.assign(this, request);
  }
}

export class LoginRequestDto {
  @ApiProperty()
  email: string;

  @ApiProperty()
  password: string;

  constructor(request: Partial<LoginRequestDto> = {}) {
    Object.assign(this, request);
  }
}

const loginValidations = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

@ApiBearerAuth()
@ApiTags('Identities')
@Controller({
  path: `/identity`,
  version: '1',
})
export class LoginController {
  constructor(private readonly commandBus: CommandBus) {}

  @Post('login')
  public async login(@Body() request: LoginRequestDto): Promise<AuthDto> {
    const result = await this.commandBus.execute(new Login(request));

    return result;
  }
}

@CommandHandler(Login)
export class LoginHandler implements ICommandHandler<Login> {
  constructor(
    @Inject('IAuthRepository') private readonly authRepository: IAuthRepository,
    @Inject('IUserRepository') private readonly userRepository: IUserRepository,
    private readonly commandBus: CommandBus,
  ) {}

  async execute(command: Login): Promise<AuthDto> {
    await loginValidations.validateAsync(command);

    const user = await this.userRepository.findUserByEmail(command.email);

    if (
      !user ||
      !(await isPasswordMatch(command.password, user.hashPass as string))
    ) {
      throw new ApplicationException('Incorrect email or password');
    }

    const token = await this.commandBus.execute(
      new GenerateToken({ userId: user.id, role: user.role }),
    );

    return token;
  }
}
