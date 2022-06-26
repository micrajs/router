import {BaseRouter} from '../BaseRouter';

declare global {
  namespace Application {
    interface Services {
      routeHandler: Micra.RouteHandler<'/', Micra.RoutePathOptions>;
      middleware: Micra.Middleware;
      nested: {
        middleware: Micra.Middleware;
        routeHandler: Micra.RouteHandler<'/', Micra.RoutePathOptions>;
      };
    }

    /** It registers a router triggered on GET requests */
    type GetRouteDefinition = Micra.RouteCreator;
    interface Routers {
      get: GetRouteDefinition;
    }
  }
}

describe('BaseRouter tests', async () => {
  it('should work', async () => {
    // const container = new MockServiceContainer();
    const router = new BaseRouter() as unknown as Micra.Router;
    router.extend({
      get: (base) => (path, handlerOrService) =>
        base.register(['GET'], path, handlerOrService),
    });

    router
      .get('/', async () => {
        return new Response(JSON.stringify({hello: 'world'}));
      })
      .nested((slots) => {
        slots.get('/', async () => {
          return new Response(JSON.stringify({child: 'response'}));
        });
      });
  });
});
