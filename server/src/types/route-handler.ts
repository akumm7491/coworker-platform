import { Request, Response } from 'express';

interface RouteHandler {
  (req: Request, res: Response): Promise<Response> | Response;
}

interface AsyncRouteHandler {
  (req: Request, res: Response): Promise<Response>;
}

export { RouteHandler, AsyncRouteHandler };
