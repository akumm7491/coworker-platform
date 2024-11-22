import { Request, Response } from 'express';
import { BaseController } from '../../shared/BaseController.js';
import { agentManagerService } from '../manager/AgentManagerService.js';
import { taskExecutorService } from '../executor/TaskExecutorService.js';
import { collaborationService } from '../collaboration/CollaborationService.js';
import { MiddlewareFactory } from '../../shared/middlewareFactory.js';
import { z } from 'zod';

export class AgentController extends BaseController {
  constructor() {
    super('/api/agents');
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    // Team management routes
    this.router.post(
      '/teams',
      MiddlewareFactory.validate(
        z.object({
          body: z.object({
            name: z.string(),
            description: z.string(),
            roles: z.array(
              z.object({
                name: z.string(),
                description: z.string(),
                capabilities: z.array(z.string()),
                requiredSkills: z.array(z.string()),
                permissions: z.array(z.string()),
              }),
            ),
          }),
        }),
      ),
      this.createTeam.bind(this),
    );

    this.router.post(
      '/teams/:teamId/agents',
      MiddlewareFactory.validate(
        z.object({
          body: z.object({
            name: z.string(),
            description: z.string(),
            capabilities: z.array(z.string()),
            model: z.string(),
            config: z.record(z.any()),
          }),
        }),
      ),
      this.addAgentToTeam.bind(this),
    );

    // Task management routes
    this.router.post(
      '/tasks',
      MiddlewareFactory.validate(
        z.object({
          body: z.object({
            type: z.string(),
            title: z.string(),
            description: z.string(),
            requirements: z.object({
              capabilities: z.array(z.string()),
              resources: z.array(z.string()),
              permissions: z.array(z.string()),
            }),
            parameters: z.record(z.any()),
          }),
        }),
      ),
      this.defineTask.bind(this),
    );

    this.router.post(
      '/tasks/:taskId/execute',
      MiddlewareFactory.validate(
        z.object({
          body: z.object({
            teamId: z.string(),
            priority: z.enum(['low', 'medium', 'high']),
            parameters: z.record(z.any()).optional(),
          }),
        }),
      ),
      this.executeTask.bind(this),
    );

    // Collaboration routes
    this.router.post(
      '/collaboration/sessions',
      MiddlewareFactory.validate(
        z.object({
          body: z.object({
            type: z.enum(['knowledge_sharing', 'task_collaboration', 'learning']),
            participants: z.array(z.string()),
            metadata: z.record(z.any()).optional(),
          }),
        }),
      ),
      this.createCollaborationSession.bind(this),
    );

    this.router.post(
      '/collaboration/sessions/:sessionId/knowledge',
      MiddlewareFactory.validate(
        z.object({
          body: z.object({
            sourceAgentId: z.string(),
            targetAgentId: z.string(),
            knowledge: z.object({
              type: z.string(),
              content: z.string(),
              context: z.record(z.any()).optional(),
            }),
          }),
        }),
      ),
      this.transferKnowledge.bind(this),
    );
  }

  private async createTeam(req: Request, res: Response): Promise<void> {
    try {
      const { name, description, roles } = req.body;
      const team = await agentManagerService.createTeam(req.user!.id, name, description, roles);
      res.status(201).json(team);
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  private async addAgentToTeam(req: Request, res: Response): Promise<void> {
    try {
      const { teamId } = req.params;
      const agentId = await agentManagerService.addAgentToTeam(teamId, req.body);
      res.status(201).json({ agentId });
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  private async defineTask(req: Request, res: Response): Promise<void> {
    try {
      const task = await taskExecutorService.defineTask(req.body);
      res.status(201).json(task);
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  private async executeTask(req: Request, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const { teamId, priority, parameters } = req.body;

      const assignment = await agentManagerService.assignTask(
        teamId,
        taskId,
        req.body.requirements?.capabilities || [],
        priority,
      );

      const execution = await taskExecutorService.executeTask(
        taskId,
        assignment.agentId,
        parameters,
      );

      res.status(202).json(execution);
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  private async createCollaborationSession(req: Request, res: Response): Promise<void> {
    try {
      const session = await collaborationService.createSession(
        req.body.type,
        req.body.participants,
        req.body.metadata,
      );
      res.status(201).json(session);
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  private async transferKnowledge(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const transfer = await collaborationService.transferKnowledge(
        sessionId,
        req.body.sourceAgentId,
        req.body.targetAgentId,
        req.body.knowledge,
      );
      res.status(202).json(transfer);
    } catch (error) {
      this.handleError(error, req, res);
    }
  }
}

export const agentController = new AgentController();
