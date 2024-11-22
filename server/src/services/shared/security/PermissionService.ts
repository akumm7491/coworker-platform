import { v4 as uuidv4 } from 'uuid';
import { cacheService } from '../cache/CacheService.js';
import { metricsService } from '../metrics/MetricsService.js';
import logger from '../../../utils/logger.js';

export interface Permission {
  id: string;
  name: string;
  description: string;
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'execute' | '*';
  conditions?: Array<{
    field: string;
    operator: 'equals' | 'contains' | 'startsWith' | 'endsWith' | 'regex';
    value: string;
  }>;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  metadata?: Record<string, any>;
}

export interface PolicyStatement {
  effect: 'allow' | 'deny';
  resources: string[];
  actions: string[];
  conditions?: Record<string, any>;
}

export interface Policy {
  id: string;
  name: string;
  description: string;
  statements: PolicyStatement[];
  metadata?: Record<string, any>;
}

export class PermissionService {
  private static instance: PermissionService;
  private permissions: Map<string, Permission> = new Map();
  private roles: Map<string, Role> = new Map();
  private policies: Map<string, Policy> = new Map();
  private userRoles: Map<string, Set<string>> = new Map();
  private agentRoles: Map<string, Set<string>> = new Map();

  private constructor() {
    this.initialize();
  }

  static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  private async initialize(): Promise<void> {
    await this.loadPermissions();
    await this.loadRoles();
    await this.loadPolicies();
    await this.setupDefaultPermissions();
  }

  private async loadPermissions(): Promise<void> {
    // Load permissions from database
    // Implementation depends on your database schema
  }

  private async loadRoles(): Promise<void> {
    // Load roles from database
    // Implementation depends on your database schema
  }

  private async loadPolicies(): Promise<void> {
    // Load policies from database
    // Implementation depends on your database schema
  }

  private async setupDefaultPermissions(): Promise<void> {
    // Agent permissions
    await this.createPermission({
      name: 'agent:create',
      description: 'Create new agents',
      resource: 'agent',
      action: 'create',
    });

    await this.createPermission({
      name: 'agent:manage',
      description: 'Manage agent lifecycle',
      resource: 'agent',
      action: '*',
    });

    // Task permissions
    await this.createPermission({
      name: 'task:create',
      description: 'Create new tasks',
      resource: 'task',
      action: 'create',
    });

    await this.createPermission({
      name: 'task:execute',
      description: 'Execute tasks',
      resource: 'task',
      action: 'execute',
    });

    // Knowledge permissions
    await this.createPermission({
      name: 'knowledge:share',
      description: 'Share knowledge between agents',
      resource: 'knowledge',
      action: 'create',
    });

    await this.createPermission({
      name: 'knowledge:access',
      description: 'Access knowledge base',
      resource: 'knowledge',
      action: 'read',
    });
  }

  async createPermission(permission: Omit<Permission, 'id'>): Promise<Permission> {
    const newPermission: Permission = {
      ...permission,
      id: uuidv4(),
    };

    this.permissions.set(newPermission.id, newPermission);
    await this.persistPermission(newPermission);

    return newPermission;
  }

  async createRole(name: string, description: string, permissions: string[]): Promise<Role> {
    const role: Role = {
      id: uuidv4(),
      name,
      description,
      permissions,
    };

    this.roles.set(role.id, role);
    await this.persistRole(role);

    return role;
  }

  async createPolicy(
    name: string,
    description: string,
    statements: PolicyStatement[],
  ): Promise<Policy> {
    const policy: Policy = {
      id: uuidv4(),
      name,
      description,
      statements,
    };

    this.policies.set(policy.id, policy);
    await this.persistPolicy(policy);

    return policy;
  }

  async assignRoleToUser(userId: string, roleId: string): Promise<void> {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    if (!this.userRoles.has(userId)) {
      this.userRoles.set(userId, new Set());
    }

    this.userRoles.get(userId)!.add(roleId);
    await this.persistUserRoles(userId);

    // Update metrics
    metricsService.getMetric('user_roles_assigned')?.inc();
  }

  async assignRoleToAgent(agentId: string, roleId: string): Promise<void> {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error('Role not found');
    }

    if (!this.agentRoles.has(agentId)) {
      this.agentRoles.set(agentId, new Set());
    }

    this.agentRoles.get(agentId)!.add(roleId);
    await this.persistAgentRoles(agentId);

    // Update metrics
    metricsService.getMetric('agent_roles_assigned')?.inc();
  }

  async checkPermission(
    subjectId: string,
    resource: string,
    action: string,
    context?: Record<string, any>,
  ): Promise<boolean> {
    try {
      const roles = this.getUserRoles(subjectId) || this.getAgentRoles(subjectId);
      if (!roles) {
        return false;
      }

      for (const roleId of roles) {
        const role = this.roles.get(roleId);
        if (role) {
          for (const permissionId of role.permissions) {
            const permission = this.permissions.get(permissionId);
            if (permission) {
              if (this.matchesPermission(permission, resource, action, context)) {
                return true;
              }
            }
          }
        }
      }

      return false;
    } catch (error) {
      logger.error('Error checking permission:', error);
      return false;
    } finally {
      // Update metrics
      metricsService.getMetric('permission_checks')?.inc({ resource, action });
    }
  }

  async evaluatePolicy(policyId: string, context: Record<string, any>): Promise<boolean> {
    const policy = this.policies.get(policyId);
    if (!policy) {
      return false;
    }

    for (const statement of policy.statements) {
      if (this.evaluatePolicyStatement(statement, context)) {
        return statement.effect === 'allow';
      }
    }

    return false;
  }

  private getUserRoles(userId: string): Set<string> | undefined {
    return this.userRoles.get(userId);
  }

  private getAgentRoles(agentId: string): Set<string> | undefined {
    return this.agentRoles.get(agentId);
  }

  private matchesPermission(
    permission: Permission,
    resource: string,
    action: string,
    context?: Record<string, any>,
  ): boolean {
    if (
      permission.resource !== resource &&
      permission.resource !== '*' &&
      !permission.resource.endsWith('*')
    ) {
      return false;
    }

    if (permission.action !== action && permission.action !== '*') {
      return false;
    }

    if (permission.conditions && context) {
      return permission.conditions.every(condition => {
        const value = context[condition.field];
        if (value === undefined) {
          return false;
        }

        switch (condition.operator) {
          case 'equals':
            return value === condition.value;
          case 'contains':
            return value.includes(condition.value);
          case 'startsWith':
            return value.startsWith(condition.value);
          case 'endsWith':
            return value.endsWith(condition.value);
          case 'regex':
            return new RegExp(condition.value).test(value);
          default:
            return false;
        }
      });
    }

    return true;
  }

  private evaluatePolicyStatement(
    statement: PolicyStatement,
    context: Record<string, any>,
  ): boolean {
    const matchesResources = statement.resources.some(
      resource =>
        resource === '*' ||
        resource === context.resource ||
        (resource.endsWith('*') && context.resource.startsWith(resource.slice(0, -1))),
    );

    const matchesActions = statement.actions.some(
      action =>
        action === '*' ||
        action === context.action ||
        (action.endsWith('*') && context.action.startsWith(action.slice(0, -1))),
    );

    if (!matchesResources || !matchesActions) {
      return false;
    }

    if (statement.conditions) {
      return Object.entries(statement.conditions).every(([key, condition]) => {
        const value = context[key];
        if (value === undefined) {
          return false;
        }

        if (typeof condition === 'object') {
          return Object.entries(condition).every(([op, expected]) => {
            switch (op) {
              case 'equals':
                return value === expected;
              case 'notEquals':
                return value !== expected;
              case 'in':
                return Array.isArray(expected) && expected.includes(value);
              case 'notIn':
                return Array.isArray(expected) && !expected.includes(value);
              default:
                return false;
            }
          });
        }

        return value === condition;
      });
    }

    return true;
  }

  private async persistPermission(permission: Permission): Promise<void> {
    // Store permission in database
    // Implementation depends on your database schema
  }

  private async persistRole(role: Role): Promise<void> {
    // Store role in database
    // Implementation depends on your database schema
  }

  private async persistPolicy(policy: Policy): Promise<void> {
    // Store policy in database
    // Implementation depends on your database schema
  }

  private async persistUserRoles(userId: string): Promise<void> {
    // Store user roles in database
    // Implementation depends on your database schema
  }

  private async persistAgentRoles(agentId: string): Promise<void> {
    // Store agent roles in database
    // Implementation depends on your database schema
  }
}

export const permissionService = PermissionService.getInstance();
