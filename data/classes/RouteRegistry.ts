import {PathOptions} from '@micra/core/utilities/PathParams';

function normalizeMethods(methods: string | string[] = ['*']): string[] {
  let normalizedMethods: string[] = [];
  if (typeof methods === 'string') {
    normalizedMethods.push(methods);
  } else {
    normalizedMethods = normalizedMethods.concat(methods);
  }

  if (!normalizedMethods.includes('*')) {
    normalizedMethods.push('*');
  }

  return normalizedMethods;
}

export class RouteRegistry<Options extends PathOptions = Micra.RoutePathOptions>
  implements Micra.RouteRegistry<Options>
{
  private _definitions!: Micra.Route<string, Options>[];

  private _frozen!: boolean;
  get frozen(): boolean {
    return Object.freeze(this._frozen);
  }

  private _middlewares!: Micra.TypeOrService<Micra.Middleware>[];
  get middlewares(): readonly Micra.TypeOrService<Micra.Middleware>[] {
    return Object.freeze(this._middlewares);
  }

  constructor(definitions: Micra.Route<string, Options>[] = []) {
    Object.defineProperty(this, '_definitions', {
      configurable: false,
      enumerable: false,
      value: definitions,
    });
    Object.defineProperty(this, '_middlewares', {
      configurable: false,
      enumerable: false,
      value: [],
    });
    Object.defineProperty(this, '_frozen', {
      configurable: true,
      enumerable: false,
      value: false,
    });
  }

  findAll(
    path?: string,
    methods?: string | string[],
  ): Readonly<Micra.Route<string, Options>>[] {
    return this._definitions.reduce(
      (list: Readonly<Micra.Route<string, Options>>[], route) => {
        if (
          !path ||
          (route.path.test(path) &&
            (!methods ||
              normalizeMethods(methods).some((method) =>
                route.methods.includes(method),
              )))
        ) {
          list.push(Object.freeze(route));
        }
        return list;
      },
      [],
    );
  }

  findByName(
    name: string,
    methods?: string | string[],
  ): Readonly<Micra.Route<string, Options>> | undefined {
    return Object.freeze(
      this._definitions.find(
        (route) =>
          route.name &&
          route.name === name &&
          (!methods ||
            normalizeMethods(methods).some((method) =>
              route.methods.includes(method),
            )),
      ),
    );
  }

  find<Path extends string>(
    path: Path,
    methods?: string | string[],
  ): Readonly<Micra.Route<Path, Options>> | undefined {
    return Object.freeze(
      this._definitions.find(
        (route) =>
          route.path.test(path) &&
          (!methods ||
            normalizeMethods(methods).some((method) =>
              route.methods.includes(method),
            )),
      ) as Micra.Route<Path, Options> | undefined,
    );
  }

  register(...routes: Micra.Route<string, Options>[]): this {
    if (this._frozen) {
      console.error('Cannot register routes once the RouteRegistry is frozen');
      return this;
    }

    this._definitions.push(...routes);

    return this;
  }

  use(...middlewares: Micra.TypeOrService<Micra.Middleware>[]): this {
    if (this._frozen) {
      console.error(
        'Cannot register middlewares once the RouteRegistry is frozen',
      );
      return this;
    }

    this._middlewares.push(...middlewares);

    return this;
  }

  freeze(): this {
    this._frozen = true;

    return this;
  }
}
