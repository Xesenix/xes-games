import { interfaces } from 'inversify';
import { reduce } from 'rxjs/operators/reduce';
import { startWith } from 'rxjs/operators/startWith';
import { Subject } from 'rxjs/Subject';

export function StoreProvider<T>(context: interfaces.Context) {
	const initialState = context.container.get<T>('initial-data-state');
	const reducer = context.container.get<(state: T, action: any) => T>('action-reducer');
	const store = context.container.get<Subject<T>>('action-stream').pipe(
		startWith<T>(initialState),
		reduce<T>(reducer),
	);
	return () => Promise.resolve(store);
}
