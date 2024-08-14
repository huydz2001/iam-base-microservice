import { ApiBearerAuth } from '@nestjs/swagger';
import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';

import { AdminThirtyGuard } from 'building-blocks/passport/auth-thirty.guard';
import { JwtThirtyGuard } from 'building-blocks/passport/jwt-thirty.guard';

export const ROLES_KEY = 'roles';

export const Auth = (...apis: string[]) => {
  return applyDecorators(
    SetMetadata(ROLES_KEY, apis),
    UseGuards(JwtThirtyGuard),
    ApiBearerAuth(),
  );
};

export const AdminAuth = () =>
  applyDecorators(UseGuards(AdminThirtyGuard), ApiBearerAuth());
