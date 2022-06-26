import type {PathOptions} from '@micra/core/utilities/PathParams';
import {RouteBuilder} from './RouteBuilder';
import {RouteGroupBuilder} from './RouteGroupBuilder';
import {RouteRegistry} from './RouteRegistry';

const BASE_ROUTER_METHODS: (keyof Micra.BaseRouter)[] = [
  'any',
  'register',
  'group',
  'extend',
  'registry',
  'clone',
  'middlewares',
];

export class BaseRouter<Options extends PathOptions = Micra.RoutePathOptions>
  implements Micra.BaseRouter<Options>
{
  readonly registry: Micra.RouteRegistry<Options>;
  private _extensions!: Partial<Micra.RouterExtensionDefinition<Options>>;

  constructor(registry: Micra.RouteRegistry<Options> = new RouteRegistry()) {
    this.registry = registry;
    Object.defineProperty(this, '_extensions', {
      configurable: false,
      enumerable: false,
      value: {},
    });
  }

  any<Path extends string>(
    path: Path,
    serviceOrHandler: Micra.TypeOrService<Micra.RouteHandler<Path, Options>>,
  ): Micra.RouteBuilder {
    return this.register(['*'], path, serviceOrHandler);
  }

  register<Path extends string>(
    methods: string[],
    path: Path,
    handler: Micra.TypeOrService<Micra.RouteHandler<Path, Options>>,
  ): Micra.RouteBuilder {
    const builder = new RouteBuilder(this, {
      path,
      methods,
      handler,
    });

    this.registry.register(builder.route);

    return builder;
  }

  extend(definitions: Partial<Micra.RouterExtensionDefinition<Options>>): this {
    Object.entries(definitions).forEach(([name, extension]) => {
      if (BASE_ROUTER_METHODS.includes(name as keyof Micra.BaseRouter)) {
        throw new Error(`Cannot redefine the Router's ${name} method`);
      }
      if (extension) {
        this._extensions[name as keyof Application.Routers] = extension;
        (this as unknown as Micra.Router)[name as keyof Application.Routers] =
          extension(this);
      }
    });

    return this;
  }

  group(
    routeGroup: (router: Micra.Router<Options>) => void,
  ): Micra.RouteGroupBuilder {
    const router = this.clone();

    routeGroup(router);
    router.registry.findAll().forEach((route) => this.registry.register(route));

    return new RouteGroupBuilder(router.registry);
  }

  middlewares(...middlewares: Micra.TypeOrService<Micra.Middleware>[]): this {
    this.registry.use(...middlewares);
    return this;
  }

  clone(registry?: Micra.RouteRegistry<Options>): Micra.Router<Options> {
    return new BaseRouter<Options>(registry).extend(
      this._extensions,
    ) as unknown as Micra.Router<Options>;
  }
}
