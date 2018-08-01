import { interfaces } from 'inversify';
import { applyMiddleware, createStore, Store } from 'redux';
import thunk from 'redux-thunk';

import { UIAction } from './actions/index';
import { defaultUIState, IUIState, ui } from './reducers/index';

export type IUIStoreProvider = (forceNew?: boolean) => Promise<Store>;

let store: Store<IUIState>;

export function UIStoreProvider(context: interfaces.Context) {
	const console: Console = context.container.get<Console>('debug:console');
	console.debug('UIStoreProvider');

	return (): Promise<Store> => {
		console.debug('UIStoreProvider:provide', store);
		if (!!store) {
			return Promise.resolve(store);
		}

		try {
			const initialState: IUIState = defaultUIState;

			store = createStore<IUIState, UIAction, any, any>(ui, initialState, applyMiddleware(thunk));

			console.debug('UIStoreProvider:store', store);
			return Promise.resolve(store);
		} catch (error) {
			console.debug('UIStoreProvider:error', parent, error);
			return Promise.reject(error);
		}
	};
}
