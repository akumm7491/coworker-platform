import { SetMetadata } from '@nestjs/common';
import { PermissionName, RoleName } from '../types/auth.types';

export const AUTH_REQUIRED_KEY = 'auth:required';
export const ROLES_KEY = 'auth:roles';
export const PERMISSIONS_KEY = 'auth:permissions';
export const PUBLIC_KEY = 'auth:public';

export const RequireAuth = () => SetMetadata(AUTH_REQUIRED_KEY, true);
export const RequireRoles = (...roles: RoleName[]) => SetMetadata(ROLES_KEY, roles);
export const RequirePermissions = (...permissions: PermissionName[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
export const Public = () => SetMetadata(PUBLIC_KEY, true);

// Combined decorators for common use cases
export const RequireAdmin = () => RequireRoles('admin');
export const RequireUser = () => RequireRoles('user');

// Decorator factory for requiring multiple conditions
export interface AuthRequirements {
  roles?: RoleName[];
  permissions?: PermissionName[];
}

export const Secure = (requirements: AuthRequirements) => {
  const decorators = [RequireAuth()];

  if (requirements.roles?.length) {
    decorators.push(RequireRoles(...requirements.roles));
  }

  if (requirements.permissions?.length) {
    decorators.push(RequirePermissions(...requirements.permissions));
  }

  return function (target: any, propertyKey?: string | symbol, descriptor?: PropertyDescriptor) {
    for (const decorator of decorators) {
      if (descriptor) {
        // Method decorator
        decorator(target, propertyKey!, descriptor);
      } else {
        // Class decorator
        decorator(target);
      }
    }
    return descriptor;
  };
};
