import { Request, Response } from 'express';
import { BaseController } from '../BaseController.js';
import { monitoringService } from './MonitoringService.js';
import { MiddlewareFactory } from '../middlewareFactory.js';
import { z } from 'zod';
import logger from '../../../utils/logger.js';

export class MonitoringController extends BaseController {
  constructor() {
    super('/api/monitoring');
    this.initializeRoutes();
  }

  protected initializeRoutes(): void {
    // Health check routes
    this.router.post(
      '/health-checks',
      MiddlewareFactory.validate(
        z.object({
          body: z.object({
            name: z.string(),
            type: z.enum(['http', 'tcp', 'custom']),
            target: z.string(),
            interval: z.number(),
            timeout: z.number(),
            retries: z.number(),
            config: z.record(z.any()).optional(),
          }),
        }),
      ),
      this.createHealthCheck.bind(this),
    );

    this.router.get('/health-checks', this.listHealthChecks.bind(this));
    this.router.get('/health-checks/:id', this.getHealthCheck.bind(this));

    // Metric threshold routes
    this.router.post(
      '/thresholds',
      MiddlewareFactory.validate(
        z.object({
          body: z.object({
            name: z.string(),
            metric: z.string(),
            operator: z.enum(['gt', 'lt', 'eq', 'ne', 'gte', 'lte']),
            value: z.number(),
            duration: z.number(),
            severity: z.enum(['info', 'warning', 'error', 'critical']),
            actions: z.array(
              z.object({
                type: z.string(),
                config: z.record(z.any()),
              }),
            ),
          }),
        }),
      ),
      this.createThreshold.bind(this),
    );

    this.router.get('/thresholds', this.listThresholds.bind(this));
    this.router.get('/thresholds/:id', this.getThreshold.bind(this));

    // Alert routes
    this.router.get('/alerts', this.listAlerts.bind(this));
    this.router.get('/alerts/:id', this.getAlert.bind(this));

    this.router.post(
      '/alerts/:id/acknowledge',
      MiddlewareFactory.validate(
        z.object({
          body: z.object({
            note: z.string().optional(),
          }),
        }),
      ),
      this.acknowledgeAlert.bind(this),
    );

    this.router.post(
      '/alerts/:id/resolve',
      MiddlewareFactory.validate(
        z.object({
          body: z.object({
            resolution: z.string().optional(),
          }),
        }),
      ),
      this.resolveAlert.bind(this),
    );
  }

  private async createHealthCheck(req: Request, res: Response) {
    try {
      const healthCheck = await monitoringService.createHealthCheck(req.body);
      res.status(201).json(healthCheck);
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  private async listHealthChecks(_req: Request, res: Response) {
    try {
      const healthChecks = await monitoringService.listHealthChecks();
      res.json(healthChecks);
    } catch (error) {
      this.handleError(error, _req, res);
    }
  }

  private async getHealthCheck(req: Request, res: Response) {
    try {
      const healthCheck = await monitoringService.getHealthCheck(req.params.id);
      if (!healthCheck) {
        res.status(404).json({ message: 'Health check not found' });
        return;
      }
      res.json(healthCheck);
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  private async createThreshold(req: Request, res: Response) {
    try {
      const threshold = await monitoringService.createThreshold(req.body);
      res.status(201).json(threshold);
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  private async listThresholds(_req: Request, res: Response) {
    try {
      const thresholds = await monitoringService.listThresholds();
      res.json(thresholds);
    } catch (error) {
      this.handleError(error, _req, res);
    }
  }

  private async getThreshold(req: Request, res: Response) {
    try {
      const threshold = await monitoringService.getThreshold(req.params.id);
      if (!threshold) {
        res.status(404).json({ message: 'Threshold not found' });
        return;
      }
      res.json(threshold);
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  private async listAlerts(req: Request, res: Response) {
    try {
      const status = req.query.status as string | undefined;
      const severity = req.query.severity as string | undefined;
      const alerts = await monitoringService.listAlerts({ status, severity });
      res.json(alerts);
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  private async getAlert(req: Request, res: Response) {
    try {
      const alert = await monitoringService.getAlert(req.params.id);
      if (!alert) {
        res.status(404).json({ message: 'Alert not found' });
        return;
      }
      res.json(alert);
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  private async acknowledgeAlert(req: Request, res: Response) {
    try {
      await monitoringService.acknowledgeAlert(req.params.id, req.user!.id, req.body.note);
      res.status(204).send();
    } catch (error) {
      this.handleError(error, req, res);
    }
  }

  private async resolveAlert(req: Request, res: Response) {
    try {
      await monitoringService.resolveAlert(req.params.id, req.user!.id, req.body.resolution);
      res.status(204).send();
    } catch (error) {
      this.handleError(error, req, res);
    }
  }
}

export const monitoringController = new MonitoringController();
