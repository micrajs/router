/* eslint-disable @typescript-eslint/no-explicit-any */
import {HTTPError, isMicraError, WrappedError} from '@micra/error';

export interface TypedResponse<T = unknown> extends Response {
  json(): Promise<T>;
}

export interface ErrorResponseOptions extends ResponseInit {
  message?: string | Error;
}

export function error(
  status: number,
  {
    message = new HTTPError(status as any),
    ...responseInit
  }: ErrorResponseOptions = {},
): TypedResponse<Micra.ErrorMessage> {
  const headers = new Headers(responseInit.headers);

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json; charset=utf-8');
  }

  const err = isMicraError(message)
    ? message
    : message instanceof Error
    ? new WrappedError(message, {
        status,
        title: responseInit.statusText,
      })
    : new HTTPError(status as any, String(message));

  return new Response(JSON.stringify(err.serialize()), {
    ...responseInit,
    status,
    headers,
  });
}
