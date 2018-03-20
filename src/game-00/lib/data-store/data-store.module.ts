import { ContainerModule, interfaces } from 'inversify';
import { applyMiddleware, compose, Reducer } from 'redux';
import { createLogger } from 'redux-logger';

import { DataStore } from './data-store';

export const DataStoreModule = <T>(
	initialValue: T,
	reducer: Reducer<T>,
	debug: boolean = false,
) => new ContainerModule((bind: interfaces.Bind) => {
	bind<T>('data-store:initial-state').toConstantValue(initialValue);
	bind<Reducer<T>>('data-store:action-reducer').toConstantValue(reducer);
	if (debug) {
		const logger = createLogger({
			duration: true,
			timestamp: true,
		});

		const composeEnhancers = typeof window === 'object'
			&& typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ !== 'undefined'
			? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
				// Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
			})
			: compose;

		bind<Reducer<T>>('data-store:store-enhancer')
			.toConstantValue(composeEnhancers(applyMiddleware(logger)));
	}
	bind<DataStore<T>>('data-store').to(DataStore).inSingletonScope();
});
