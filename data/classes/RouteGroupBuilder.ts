/* eslint-disable @typescript-eslint/no-explicit-any */
export class RouteGroupBuilder implements Micra.RouteGroupBuilder {
  private nestedRouterBuilder: Record<string, Micra.RouteGroupBuilder> = {};

  constructor(private registry: Micra.RouteRegistry<any>) {}

  prefix(prefix: string): this {
    this.registry.findAll().forEach((route) => {
      route.path.prefix(prefix);
      const nestedBuilder = this.nestedRouterBuilder[route.id];
      if (!nestedBuilder) {
        this.nestedRouterBuilder[route.id] = new RouteGroupBuilder(
          route.nested,
        ).prefix(prefix);
      } else {
        nestedBuilder.prefix(prefix);
      }
    });

    return this;
  }

  middlewares(...middlewares: Micra.TypeOrService<Micra.Middleware>[]): this {
    this.registry.findAll().forEach((route) => {
      middlewares.forEach((middleware) => {
        if (!route.middlewares.includes(middleware)) {
          route.middlewares.push(middleware);
        }
      });
    });

    return this;
  }
}
