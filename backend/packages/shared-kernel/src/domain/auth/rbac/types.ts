import { Result } from '../../../common/Result';
import { IAuthUser, PermissionName, RoleName } from '../types/auth.types';

export interface IRole {
  name: RoleName;
  permissions: PermissionName[];
  inherits?: RoleName[];
  description?: string;
}

export interface IRoleDefinition {
  roles: Record<RoleName, IRole>;
  defaultRole?: RoleName;
}

export interface IRBACService {
  hasRole(user: IAuthUser, role: RoleName): boolean;
  hasAnyRole(user: IAuthUser, roles: RoleName[]): boolean;
  hasAllRoles(user: IAuthUser, roles: RoleName[]): boolean;
  hasPermission(user: IAuthUser, permission: PermissionName): boolean;
  hasAnyPermission(user: IAuthUser, permissions: PermissionName[]): boolean;
  hasAllPermissions(user: IAuthUser, permissions: PermissionName[]): boolean;
  getRolePermissions(role: RoleName): Result<PermissionName[]>;
  getUserPermissions(user: IAuthUser): PermissionName[];
}

export interface IRoleRepository {
  findByName(name: RoleName): Promise<Result<IRole>>;
  findAll(): Promise<Result<IRole[]>>;
  save(role: IRole): Promise<Result<void>>;
  delete(name: RoleName): Promise<Result<void>>;
}
