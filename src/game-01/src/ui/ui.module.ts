import { ContainerModule, interfaces } from 'inversify';
import { IUIStoreProvider, UIStoreProvider } from './store.provider';

export const UIModule = () => new ContainerModule((bind: interfaces.Bind, unbind: interfaces.Unbind) => {
	bind<IUIStoreProvider>('ui:store').toProvider(UIStoreProvider);
});
