import { inject } from 'lib/di';

import { IAudioContextFactory, IAudioFile } from './interfaces';

@inject(['audio-context:factory'])
export class AudioLoaderService {
	private loadQueue: { [key: string]: IAudioFile } = {};

	constructor(
		private context: IAudioContextFactory,
	) {
		this.context = context;
	}

	public add(key: string, url: string, type: 'fx' | 'music'): void {
		console.log('add', key, url);
		if (!this.loadQueue[key]) {
			this.loadQueue[key] = { key, url, type: 'fx' };
		}
	}

	public addFxSound(key: string, url: string): void {
		this.add(key, url, 'fx');
	}

	public addMusic(key: string, url: string): void {
		this.add(key, url, 'music');
	}

	public loadAll(): Promise<{ [key: string]: AudioBuffer }> {
		return Promise.all(
			Object.values(this.loadQueue).map(this.loadSound),
		)
		.then((buffers: IAudioFile[]) => {
			const result: { [key: string]: AudioBuffer } = {};
			buffers.forEach((file: IAudioFile) => {
				if (!!file.data) {
					result[file.key] = file.data;
				}
			});
			return result;
		});
	}

	private loadSound = (file: IAudioFile): Promise<IAudioFile> => new Promise((resolve) => {
		const request = new XMLHttpRequest();
		request.open('GET', file.url, true);
		request.responseType = 'arraybuffer';
		request.onload = () => {
			this.context.decodeAudioData(request.response, (data: AudioBuffer) => {
				resolve({
					...file,
					data,
				});
			});
		};
		request.send();
	})
}
