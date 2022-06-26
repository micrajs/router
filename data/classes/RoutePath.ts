/* eslint-disable @typescript-eslint/no-explicit-any */
import type {PathOptions} from '@micra/core/utilities/PathParams';
import {
  compile,
  match,
  MatchFunction,
  PathFunction,
  pathToRegexp,
} from 'path-to-regexp';

function normalizePath<Path extends string>(path: Path): Path {
  path = (
    path.endsWith('/') && path !== '/' ? path.slice(0, -1) : path
  ).replace(/[\/]+/g, '/') as Path;

  return path as Path;
}

function initializePathToRegexp(
  instance: RoutePath<any, any>,
  definition: string,
) {
  Object.defineProperty(instance, '_regExp', {
    configurable: true,
    enumerable: false,
    value: pathToRegexp(definition),
  });
  Object.defineProperty(instance, '_matcher', {
    configurable: true,
    enumerable: false,
    value: match(definition),
  });
  Object.defineProperty(instance, '_compiler', {
    configurable: true,
    enumerable: false,
    value: compile(definition),
  });
}

export class RoutePath<
  Path extends string = string,
  Options extends PathOptions = Micra.RoutePathOptions,
> implements Micra.RoutePath<Path, Options>
{
  definition: Path;
  private _regExp!: RegExp;
  private _matcher!: MatchFunction;
  private _compiler!: PathFunction;

  constructor(definition: string) {
    this.definition = normalizePath(definition as Path);
    initializePathToRegexp(this, this.definition);
  }

  test(path: string): boolean {
    return this._regExp.test(path);
  }

  match: Micra.RoutePath<Path, Options>['match'] = (path) => {
    const result = this._matcher(path);

    return (result ? result.params : {}) as any;
  };

  toString: Micra.RoutePath<Path, Options>['toString'] = (options) => {
    return this._compiler(options);
  };

  prefix<Prefix extends string>(
    path: Prefix,
  ): Micra.RoutePath<`${Prefix}${Options['PATH_SEPARATOR']}${Path}`, Options> {
    const catchAll = '(.*)';
    if (path.endsWith(catchAll)) {
      path = path.slice(0, -catchAll.length) as Prefix;
    }

    this.definition = normalizePath(`${path}/${this.definition}` as Path);
    initializePathToRegexp(this, this.definition);

    return this as unknown as Micra.RoutePath<
      `${Prefix}${Options['PATH_SEPARATOR']}${Path}`,
      Options
    >;
  }
}
