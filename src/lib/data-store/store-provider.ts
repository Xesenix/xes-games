import { interfaces } from 'inversify';
import { Action, applyMiddleware, compose, createStore, DeepPartial, Store } from 'redux';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk';

export type IStoreProvider<T, A extends Action> = () => Promise<Store<T, A>>;

export function StoreProvider<T, A extends Action>(context: interfaces.Context) {
	const debug: boolean = !!process.env.DEBUG;
	const console: Console = context.container.get<Console>('debug:console');
	let store: Store<T, A>;

	return (): Promise<Store<T, A>> => {
		if (context.container.isBound('data-store')) {
			return Promise.resolve(context.container.get<Store<T, A>>('data-store'));
		}

		try {
			const initialState = context.container.get<DeepPartial<T> | undefined>('data-store:initial-data-state');
			const reducer = context.container.get<(state: T | undefined, action: any) => T>('data-store:action-reducer');
			const logger = createLogger({
				duration: true,
				timestamp: true,
			});
			const composeEnhancers = debug && typeof window === 'object'
				&& typeof window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ !== 'undefined'
				? (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
					// Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
				})
				: compose;

			store = createStore<T | undefined, A, any, any>(reducer, initialState, composeEnhancers(applyMiddleware(logger, thunk)));

			context.container.bind<Store<T, A>>('data-store').toConstantValue(store);

			return Promise.resolve(store);
		} catch (error) {
			return Promise.reject(error);
		}
	};
}
