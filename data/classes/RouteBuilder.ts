/* eslint-disable @typescript-eslint/no-explicit-any */
import {Route} from './Route';
import type {RouteOptions} from './Route';

export class RouteBuilder implements Micra.RouteBuilder {
  route: Micra.Route<any, any>;
  private router: Micra.BaseRouter<any>;

  constructor(router: Micra.BaseRouter<any>, options: RouteOptions<any, any>) {
    this.router = router;
    this.route = new Route(options);
  }

  name(name: string): this {
    this.route.name = name;
    return this;
  }

  middlewares(...middlewares: Micra.TypeOrService<Micra.Middleware>[]): this {
    this.route.middlewares.push(...middlewares);
    return this;
  }

  nested(routeGroup: (router: Micra.Router) => void): this {
    routeGroup(this.router.clone(this.route.nested));
    return this;
  }
}
