export interface IStoreStateAware<T> {
	syncWithState(state: T): void;
}
