export class TokenDto {
  token: string;
  expires: Date;
  userId?: string;

  constructor(request: Partial<TokenDto> = {}) {
    Object.assign(this, request);
  }
}
