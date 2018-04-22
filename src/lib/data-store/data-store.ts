import { inject, injectable, optional } from 'inversify';
import { AnyAction, createStore, Reducer } from 'redux';
import { Observable } from 'rxjs/Observable';

@injectable()
export class DataStore<T> {
	private store = createStore(
		this.reducer,
		this.state,
		this.enhancer,
	);

	private store$ = new Observable<T>((observer) => {
		this.store.subscribe(() => {
			const state: any = this.store.getState();
			observer.next({ ...state });
		});
	});

	public constructor(
		@inject('data-store:initial-state') private state: T,
		@inject('data-store:action-reducer') public reducer: Reducer<T>,
		@inject('data-store:store-enhancer') @optional() private enhancer: any, // fixme: optional doesn't work
	) { }

	public dispatch(action: AnyAction): AnyAction {
		return this.store.dispatch(action);
	}

	public subscribe(listener: any): () => void {
		return this.store.subscribe(listener);
	}

	public getState(): T {
		return this.store.getState();
	}

	public replaceReducer(reducer: Reducer<T>): void {
		this.store.replaceReducer(reducer);
	}

	public asObservable(): Observable<T> {
		return this.store$;
	}
}
