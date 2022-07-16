import {HTTPError} from '@micra/error';

export class RequestHandlerManager implements Micra.RequestHandlerManager {
  private _handlers!: Micra.RequestHandler[];

  constructor() {
    Object.defineProperty(this, '_handlers', {
      configurable: false,
      enumerable: false,
      value: [],
    });
  }

  use(...handlers: Micra.RequestHandler[]): this {
    this._handlers.push(...handlers);

    return this;
  }

  async handle(context: Micra.RequestHandlerContext): Promise<Response> {
    for (const handler of this._handlers) {
      const response = await handler(context);
      if (response) {
        return response;
      }
    }

    const error = new HTTPError(404);
    return new Response(JSON.stringify(error.serialize()), {
      status: error.statusCode,
    });
  }
}
