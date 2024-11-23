import { IQuery } from '@nestjs/cqrs';

export class GetTaskByIdQuery implements IQuery {
  constructor(public readonly taskId: string) {}
}

export class GetTasksByProjectQuery implements IQuery {
  constructor(public readonly projectId: string) {}
}

export class GetTasksByAgentQuery implements IQuery {
  constructor(public readonly agentId: string) {}
}

export class GetTasksByStatusQuery implements IQuery {
  constructor(public readonly status: string) {}
}

export class GetTasksByPriorityQuery implements IQuery {
  constructor(public readonly priority: string) {}
}

export class GetTaskMetricsQuery implements IQuery {
  constructor(public readonly taskId: string) {}
}

export class GetTaskDependenciesQuery implements IQuery {
  constructor(public readonly taskId: string) {}
}
