import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

import { ROLES_KEY } from '../../../common/decorators/roles.decorators';
import { Role } from '../enum/role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  //context is the execution context that we can use to get access to the request object
  canActivate(context: ExecutionContext) {
    const RequiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!RequiredRoles) return true;
    const { user } = context.switchToHttp().getRequest();

    if (!user) return false;

    // if true then user has the right role to access the resource
    return RequiredRoles.some((role) => user.role == role);
  }
}
