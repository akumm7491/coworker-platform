import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { IAuthUser, RoleName, PermissionName } from '../types/auth.types';
import { IRBACService } from '../rbac/types';
import { AuthenticationError, AuthorizationError } from '../errors/AuthErrors';
import {
  AUTH_REQUIRED_KEY,
  PERMISSIONS_KEY,
  PUBLIC_KEY,
  ROLES_KEY,
} from '../decorators/AuthDecorators';

@Injectable()
export abstract class BaseAuthGuard implements CanActivate {
  constructor(
    protected readonly reflector: Reflector,
    protected readonly rbacService: IRBACService
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requireAuth = this.reflector.getAllAndOverride<boolean>(AUTH_REQUIRED_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requireAuth) {
      return true;
    }

    return this.validateRequest(context);
  }

  protected abstract extractToken(request: any): string | null;
  protected abstract validateToken(token: string): Promise<IAuthUser>;

  protected async validateRequest(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractToken(request);

    if (!token) {
      throw AuthenticationError.invalidToken();
    }

    const user = await this.validateToken(token);
    request.user = user;

    const requiredRoles = this.reflector.getAllAndOverride<RoleName[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredPermissions = this.reflector.getAllAndOverride<PermissionName[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()]
    );

    if (requiredRoles?.length) {
      const hasRole = this.rbacService.hasAnyRole(user, requiredRoles);
      if (!hasRole) {
        throw AuthorizationError.insufficientPermissions();
      }
    }

    if (requiredPermissions?.length) {
      const hasPermission = this.rbacService.hasAllPermissions(user, requiredPermissions);
      if (!hasPermission) {
        throw AuthorizationError.insufficientPermissions();
      }
    }

    return true;
  }
}
