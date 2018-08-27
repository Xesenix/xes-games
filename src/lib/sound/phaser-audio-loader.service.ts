import { inject } from 'lib/di';

import { AudioBufferRepository } from './audio-buffer-repository';
import { IAudioContextFactory, IAudioFile, IAudioFileLoader } from './interfaces';

@inject(['audio-repository', 'audio-context:factory'])
export class PhaserAudioLoaderService implements IAudioFileLoader {
	public loader?: Phaser.Loader.LoaderPlugin;
	private loadQueue: { [key: string]: IAudioFile } = {};

	constructor(
		private repository: AudioBufferRepository,
		private context: IAudioContextFactory,
	) {
		this.repository = repository;
		this.context = context;
	}

	public setLoader(loader: Phaser.Loader.LoaderPlugin) {
		this.loader = loader;
		this.loader.cacheManager.audio.events.on('add', (cache: Phaser.Cache.BaseCache, key: string, data: AudioBuffer) => {
			this.repository.add(key, data);
		});
	}

	public add(key: string, url: string): void {
		console.log('add', key, url);
		if (!this.loadQueue[key]) {
			this.loadQueue[key] = { key, url };
		}
		if (this.loader) {
			this.loader.addFile(new Phaser.Loader.FileTypes.AudioFile(this.loader, {
				key,
				context: this.context,
				xhrSettings: {
					responseType: 'arraybuffer',
				},
			}, {
				type: 'audio',
				url,
			}));
		}
	}

	public loadAll(): Promise<void> {
		return new Promise((resolve) => {
			if (this.loader) {
				this.loader.addListener('complete', () => {
					resolve();
				});
			}
		});
	}
}
