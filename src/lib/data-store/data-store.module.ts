import { ContainerModule, interfaces } from 'inversify';
import { Action, DeepPartial, Reducer } from 'redux';

import { DataStoreProvider, IDataStoreProvider } from './data-store.provider';

export const DataStoreModule = <T, A extends Action>(
	initialValue: DeepPartial<T>,
	reducer: Reducer<T, A>,
) => new ContainerModule((bind: interfaces.Bind) => {
	console.debug('DataStoreModule:init');
	bind<DeepPartial<T> | undefined>('data-store:initial-data-state').toConstantValue(initialValue);
	bind<Reducer<T, A>>('data-store:action-reducer').toConstantValue(reducer);
	bind<IDataStoreProvider<T, A>>('data-store:provider').toProvider(DataStoreProvider);
});
