import { SetMetadata } from '@nestjs/common/decorators/core/set-metadata.decorator';
import { Roles } from 'src/modules/users/enum/roles.enum';
export const ROLES_KEY = 'roles';

export const Role = (...roles: Roles[]) => SetMetadata(ROLES_KEY, roles);
