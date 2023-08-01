export type MiddlewareFactory<T extends object = object> = (
  config: T,
  ctx: { strapi: Strapi }
) => Middleware | null | void;

export type MiddlewareHandler = Koa.Middleware;

export type Middleware = MiddlewareHandler | MiddlewareFactroy;
