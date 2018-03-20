import { injectable } from 'inversify';

import { IDictionary } from './dictionary';

@injectable()
export class FlatDictionary implements IDictionary {
	public constructor(
		public data: { [key: string]: any } = {},
	) { }

	public get<T>(key: string, defaultValue: T): T {
		return (this.data[key] || defaultValue) as T;
	}

	public set<T>(key: string, value: T): IDictionary {
		this.data[key] = value;

		return this;
	}
}
