/* eslint-disable @typescript-eslint/no-explicit-any */
import {HTTPError, isMicraError, WrappedError} from '@micra/error';
import {error} from '@micra/request-handler/data/utilities/error';
import {resolveFromContainer} from './resolveFromContainer';

export interface OnChangeEvent {
  id: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  handler: Micra.RouteHandler;
  params: Record<string, any>;
  request: Request;
  data?: Record<string, any>;
  route: Micra.Route;
  nested: Micra.Route[];
}

export interface RouteHandlerOptions {
  method: string;
  route: Micra.Route;
  context: Micra.RouteHandlerContext<string>;
  onChange?: (event: OnChangeEvent) => void | Promise<void>;
}

export async function handleRoute({
  method,
  context,
  route,
  onChange,
}: RouteHandlerOptions): Promise<Response> {
  const path = new URL(context.request.url).pathname;
  const nested = route.nested.findAll(path, method);
  const id = route.id;
  const params = route.path.match(path);
  const handler =
    typeof route.handler === 'string'
      ? resolveFromContainer<Micra.RouteHandler>(context.use, route.handler)
      : route.handler;

  onChange?.({
    nested,
    handler,
    id,
    params,
    route,
    request: context.request,
    status: 'loading',
  });

  try {
    const [response] = await Promise.all([
      handler(context).then(async (response) => {
        if (response.status < 400) {
          onChange?.({
            nested,
            handler,
            id,
            params,
            route,
            data: await response.clone().json(),
            request: context.request,
            status: 'success',
          });
        } else {
          onChange?.({
            nested,
            handler,
            id,
            params,
            route,
            data: await response.clone().json(),
            request: context.request,
            status: 'error',
          });
        }

        return response;
      }),
      ...route.nested.findAll(path, method).map((child) =>
        executeRouteHandler({
          method,
          route: child,
          context,
          onChange,
        }),
      ),
    ]);

    return response;
  } catch (maybeError) {
    const response = error(500, {
      message: maybeError instanceof Error ? maybeError : `${maybeError}`,
    });

    onChange?.({
      nested,
      handler,
      id,
      params,
      route,
      request: context.request,
      status: 'error',
      data: await response.clone().json(),
    });

    return response;
  }
}

export interface ExecuteRouteHandlerOptions {
  method: string;
  context: Micra.RouteHandlerContext<string>;
  middlewares?:
    | Micra.TypeOrService<Micra.Middleware>[]
    | Readonly<Micra.TypeOrService<Micra.Middleware>[]>;
  route: Micra.Route;
  onChange?: (event: OnChangeEvent) => void | Promise<void>;
}

export async function executeRouteHandler({
  route,
  context,
  onChange,
  method = context.request.method,
  middlewares: extraMiddlewares = [],
}: ExecuteRouteHandlerOptions): Promise<Response> {
  let index = 0;
  const middlewares = [
    ...extraMiddlewares.slice(),
    ...route.middlewares.slice(),
  ];
  async function next(error?: Micra.Error) {
    try {
      if (error) {
        throw error;
      }

      const maybeMiddleware = middlewares[index++];

      if (maybeMiddleware) {
        const middleware =
          typeof maybeMiddleware === 'string'
            ? resolveFromContainer<Micra.Middleware>(
                context.use,
                maybeMiddleware,
              )
            : maybeMiddleware;

        const response = (await middleware(context, next)) as Response;

        return response instanceof Response
          ? response
          : new Response(JSON.stringify(response));
      }

      return await handleRoute({route, context, onChange, method});
    } catch (maybeError) {
      const error = isMicraError(maybeError)
        ? maybeError
        : new WrappedError(
            maybeError instanceof Error
              ? maybeError
              : new HTTPError(
                  500,
                  `Error while handling route ${route.id}: ${maybeError}`,
                ),
          );

      return new Response(JSON.stringify(error.serialize()), {
        status: error.statusCode,
      });
    }
  }

  return await next();
}
