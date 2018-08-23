import { injectable } from 'lib/di';

@injectable()
export class AudioBufferRepository {
	private data: { [key: string]: AudioBuffer } = {};

	public add(data: { [key: string]: AudioBuffer }): void {
		this.data = {
			...this.data,
			...data,
		};
	}

	public get(key: string): AudioBuffer | null {
		return this.data[key] || null;
	}
}
