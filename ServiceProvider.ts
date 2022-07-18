import type {Static} from '@micra/core/utilities/Static';
import {RequestHandlerManager} from '@micra/request-handler';
import {BaseRouter} from './data/classes/BaseRouter';

export const RouterServiceProvider: Micra.ServiceProvider = {
  register({container}) {
    container.singleton('request-handler', RequestHandlerManager);
    container.singleton(
      'router',
      BaseRouter as unknown as Static<Micra.Router>,
    );
  },
};
