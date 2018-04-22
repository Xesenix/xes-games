export interface IDictionary {
	get<P>(key: string, defaultValue: P): P;
	set<P>(key: string, value: P): IDictionary;
}
