import { injectable } from 'lib/di';

import { IAudioBufferRepository } from './interfaces';

@injectable()
export class AudioBufferRepository implements IAudioBufferRepository {
	private data: { [key: string]: AudioBuffer } = {};

	public add(key: string, data: AudioBuffer): void {
		this.data[key] = data;
	}

	public get(key: string): AudioBuffer | null {
		return this.data[key] || null;
	}
}
