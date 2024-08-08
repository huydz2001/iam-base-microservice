import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenType } from '../../module/auth/enums/token-type.enum';
import { Token } from '../../module/auth/entities/token.entity';

export interface IAuthRepository {
  createToken(token: Token): Promise<void>;

  findToken(token: string, tokenType: TokenType): Promise<Token>;

  findTokenByUserId(
    token: string,
    userId: string,
    blacklisted: boolean,
  ): Promise<Token>;

  findRefreshTokenByUserId(
    refreshToken: string,
    userId: string,
    blacklisted: boolean,
  ): Promise<Token>;

  removeToken(token: Token): Promise<Token>;
}

export class AuthRepository implements IAuthRepository {
  constructor(
    @InjectRepository(Token)
    private readonly tokenRepository: Repository<Token>,
  ) {}

  async createToken(token: Token): Promise<void> {
    await this.tokenRepository.upsert(token, ['userId']);
  }

  async findToken(token: string, tokenType: TokenType): Promise<Token> {
    return await this.tokenRepository.findOneBy({
      accessToken: token,
      type: tokenType,
    });
  }

  async findTokenByUserId(
    token: string,
    userId: string,
    blacklisted: boolean,
  ): Promise<Token> {
    return await this.tokenRepository.findOneBy({
      accessToken: token,
      userId: userId,
      blacklisted: blacklisted,
    });
  }

  async findRefreshTokenByUserId(
    refreshToken: string,
    userId: string,
    blacklisted: boolean,
  ): Promise<Token> {
    return await this.tokenRepository.findOneBy({
      refreshToken: refreshToken,
      userId: userId,
      blacklisted: blacklisted,
    });
  }

  async removeToken(token: Token): Promise<Token> {
    return await this.tokenRepository.remove(token);
  }
}
