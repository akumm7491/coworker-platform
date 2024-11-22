import { Request, Response, RequestHandler } from 'express';

interface RouteHandler {
  (req: Request, res: Response): Promise<Response> | Response;
}

interface AsyncRouteHandler {
  (req: Request, res: Response): Promise<Response>;
}

export const wrapHandler = (handler: AsyncRouteHandler): RequestHandler => {
  return async (req: Request, res: Response) => {
    await handler(req, res);
  };
};

export { RouteHandler, AsyncRouteHandler };
