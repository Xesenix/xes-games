import { inject } from 'lib/di';

import { AudioBufferRepository } from './audio-buffer-repository';
import { IAudioContextFactory, IAudioFile, IAudioFileLoader } from './interfaces';

@inject(['audio-repository', 'audio-context:factory'])
export class AudioLoaderService implements IAudioFileLoader {
	private loadQueue: { [key: string]: IAudioFile } = {};

	constructor(
		private repository: AudioBufferRepository,
		private context: IAudioContextFactory,
	) {
		this.repository = repository;
		this.context = context;
	}

	public add(key: string, url: string): void {
		if (!this.loadQueue[key]) {
			this.loadQueue[key] = { key, url };
		}
	}

	public loadAll(): Promise<void> {
		return Promise.all(Object.values(this.loadQueue).map(this.loadSound)).then(() => {});
	}

	private loadSound = ({ key, url }): Promise<void> => new Promise((resolve) => {
		const request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';
		request.onload = () => {
			this.context.decodeAudioData(request.response, (data: AudioBuffer) => {
				this.repository.add(key, data);
				resolve();
			});
		};
		request.send();
	})
}
