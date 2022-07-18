/// <reference types="@micra/core/router" />
/// <reference types="@micra/core/request-handler" />
/// <reference types="@micra/core/service-provider" />

declare global {
  namespace Application {
    interface Services {
      router: Micra.Router;
      'request-handler': Micra.RequestHandlerManager;
    }
  }
}

export {};
