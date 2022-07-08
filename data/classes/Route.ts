import type {PathOptions} from '@micra/core/utilities/PathParams';
import {RoutePath} from './RoutePath';
import {RouteRegistry} from './RouteRegistry';

export type RouteOptions<
  Path extends string,
  Options extends PathOptions,
> = Pick<Micra.Route<Path, Options>, 'handler'> &
  Partial<Omit<Micra.Route<Path, Options>, 'path' | 'nested'>> & {path: Path};

export class Route<
  Path extends string = string,
  Options extends PathOptions = Micra.RoutePathOptions,
> implements Micra.Route<Path, Options>
{
  readonly id!: string;
  methods: string[];
  name?: string | undefined;
  middlewares: Micra.TypeOrService<Micra.Middleware>[];
  path: Micra.RoutePath<Path, Options>;
  handler: Micra.TypeOrService<Micra.RouteHandler<Path, Options>>;
  nested: Micra.RouteRegistry<Options>;

  constructor({
    name,
    path,
    handler,
    methods = [],
    middlewares = [],
  }: RouteOptions<Path, Options>) {
    Object.defineProperty(this, 'id', {
      get: () =>
        [
          this.path.definition,
          this.methods.join('|'),
          typeof this.handler === 'string' ? this.handler : this.handler.name,
          this.nested.findAll().length,
          this.middlewares
            .map((middleware) =>
              typeof middleware === 'string' ? middleware : middleware.name,
            )
            .join('|'),
          this.name,
        ].join('-'),
    });
    this.nested = new RouteRegistry();
    this.handler = handler;
    this.methods = methods;
    this.middlewares = middlewares;
    this.name = name;
    this.path = (typeof path === 'string'
      ? new RoutePath<Path, Options>(path)
      : path) as unknown as Micra.RoutePath<Path, Options>;
  }
}
