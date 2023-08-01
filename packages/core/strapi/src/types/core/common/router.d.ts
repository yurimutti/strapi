export type RouterType = 'admin' | 'content-api';

export type Route = {
  method: string;
  path: string;
};

export type Router = {
  type: RouterType;
  prefix?: string;
  routes: Route[] | (() => Route[]);
};
