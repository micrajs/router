import type {PathOptions} from '@micra/core/utilities/PathParams';
import {generateId} from '../utilities/generateId';
import { RoutePath } from "./RoutePath.1";
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
    const id = generateId('route');
    Object.defineProperty(this, 'id', {
      get: () => id,
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
