import { Container } from 'inversify';
import { Reducer } from 'redux';

import { DataStore } from 'lib/data-store/data-store';

import { DataStoreModule } from './data-store.module';

interface IMockAppDataState {
	[key: string]: any;
}

describe('DataStore', () => {
	const container = new Container();
	const reducer = (state = {}, action) => {
		switch (action.type) {
			case 'SET':
				const { key, value } = action.payload;
				state = { ...state, [key]: value };
				break;
		}
		return state;
	};
	container.load(DataStoreModule<IMockAppDataState>({}, reducer));

	// tslint:disable:no-empty
	const noop = () => {};
	container.bind<Console>('debug:console').toConstantValue({
		assert: noop,
		debug: noop,
		error: noop,
		log: noop,
		trace: noop,
		group: noop,
		groupEnd: noop,
	} as Console);

	beforeEach(() => {
		container.snapshot();
	});

	afterEach(() => {
		container.restore();
	});

	describe('dispatch', () => {
		it('should run reducer on dispatch', () => {
			const initialState = { };
			const reducerSpy = jasmine.createSpy('reducer', reducer);
			container.rebind<Reducer<IMockAppDataState>>('data-store:action-reducer').toConstantValue(reducerSpy);
			container.rebind<IMockAppDataState>('data-store:initial-state').toConstantValue(initialState);
			const dataStore = container.get<DataStore<IMockAppDataState>>('data-store');
			const action = {
				type: 'SET',
				payload: { key: 'test', value: '' },
			};

			dataStore.dispatch(action);

			expect(reducerSpy.calls.mostRecent().args).toEqual([initialState, action]);
		});
	});

	describe('subscribe', () => {
		it('should emit last value on subscribtion', () => {
			const initialState = { };
			const reducerSpy = jasmine.createSpy('reducer', reducer);
			container.rebind<Reducer<IMockAppDataState>>('data-store:action-reducer').toConstantValue(reducerSpy);
			container.rebind<IMockAppDataState>('data-store:initial-state').toConstantValue(initialState);
			const dataStore = container.get<DataStore<IMockAppDataState>>('data-store');
			const action = {
				type: 'SET',
				payload: { key: 'test', value: '' },
			};

			dataStore.dispatch(action);

			expect(reducerSpy.calls.mostRecent().args).toEqual([initialState, action]);
		});
	});
});
