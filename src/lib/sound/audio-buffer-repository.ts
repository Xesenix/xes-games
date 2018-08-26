import { injectable } from 'lib/di';

@injectable()
export class AudioBufferRepository {
	private data: { [key: string]: AudioBuffer } = {};

	public add(key: string, data: AudioBuffer): void {
		console.log('AudioBufferRepository:add', key, data);
		this.data[key] = data;
	}

	public get(key: string): AudioBuffer | null {
		return this.data[key] || null;
	}
}
