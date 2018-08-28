import { inject } from 'lib/di';

import { AudioBufferRepository } from './audio-buffer-repository';
import { IAudioContextFactory, IAudioFileLoader } from './interfaces';

@inject(['audio-repository', 'audio-context:factory'])
export class PhaserAudioLoaderService implements IAudioFileLoader {
	public loader?: Phaser.Loader.LoaderPlugin;
	private loadQueue: boolean[] = [];

	constructor(
		private repository: AudioBufferRepository,
		private context: IAudioContextFactory,
	) {
		this.repository = repository;
		this.context = context;
	}

	public setLoader(loader: Phaser.Loader.LoaderPlugin): void {
		this.loader = loader;
		// TODO: find better way to connect to phaser loader audio cache
		(this.loader as any).cacheManager.audio.events.on('add', (
			cache: Phaser.Cache.BaseCache,
			key: string,
			data: AudioBuffer,
		) => {
			this.repository.add(key, data);
			this.loadQueue[key] = false;
		});
	}

	public add(key: string, url: string): void {
		console.log('add', key, url);
		if (!this.loadQueue[key]) {
			this.loadQueue[key] = true;
		}
		if (this.loader) {
			// TODO: phaser has mismatched interface for configuring audioContext so we need cast second argument to any
			this.loader.addFile(new Phaser.Loader.FileTypes.AudioFile(this.loader, {
				key,
				context: this.context,
				xhrSettings: {
					responseType: 'arraybuffer',
				},
			} as any, {
				type: 'audio',
				url,
			}));
		}
	}

	public loadAll(): Promise<void> {
		return new Promise((resolve) => {
			if (Object.values(this.loadQueue).some((loading) => loading)) {
				if (this.loader) {
					this.loader.addListener('complete', () => {
						resolve();
					});
				}
			} else {
				resolve();
			}
		});
	}
}
