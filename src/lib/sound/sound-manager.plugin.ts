import { Store } from 'redux';

import { AudioBufferRepository } from './audio-buffer-repository';
import { AudioLoaderService } from './audio-loader.service';
import { AudioGraph } from './audio-graph';

// tslint:disable:max-classes-per-file
export interface ISoundConfigurationState {
	mute: boolean;
	musicMuted: boolean;
	effectsMuted: boolean;
	effectsVolume: number;
	musicVolume: number;
	volume: number;
	paused: boolean;
}

export interface ISoundManager {
	loader?: Phaser.Loader.LoaderPlugin;
	preloadAudioAsset(key: string, src: string): void;
	playFxSound(key: string): Promise<AudioBufferSourceNode>;
	playLoop(key: string): Promise<AudioBufferSourceNode>;
	stopSound(key: string): void;
}

export interface ISoundManagerPlugin<T extends ISoundConfigurationState> extends Phaser.Plugins.BasePlugin {
	store: Store<T>;
}

export const soundManagerPluginFactory = <T extends ISoundConfigurationState>(
	store: Store,
	context: AudioContext,
	audioGraph: AudioGraph,
	repository: AudioBufferRepository,
	audioLoader: AudioLoaderService,
) => class SoundManagerPlugin extends Phaser.Plugins.BasePlugin implements ISoundManagerPlugin<T>, ISoundManager {
	public store: Store<T> = store;
	public loader?: Phaser.Loader.LoaderPlugin;
	public repository: AudioBufferRepository = repository;
	public audioLoader: AudioLoaderService = audioLoader;
	public audioGraph: AudioGraph = audioGraph;
	private unsubscribe: any;
	private context = context;
	private ready?: () => void;

	constructor(
		public pluginManager: Phaser.Plugins.PluginManager,
	) {
		super(pluginManager);
		console.log('SoundManagerPlugin:constructor');
	}

	public start(): void {
		console.log('SoundManagerPlugin:start', this);
		this.unsubscribe = this.store.subscribe(this.syncWithState);

		this.syncWithState();
	}

	public preloadAudioAsset(key: string, url: string): void {
		this.audioLoader.add(key, url, 'fx');
	}

	public playFxSound(key: string): Promise<AudioBufferSourceNode> {
		return Promise.resolve(this.audioGraph.playFxSound(key));
	}

	public stopSound(key: string): void {
		this.audioGraph.stopLoop();
	}

	public playLoop(key: string): Promise<AudioBufferSourceNode> {
		return Promise.resolve(this.audioGraph.playLoop(key));
	}

	/**
	 * Load sound using phaser loader.
	 */
	public loadSoundViaLoader(key: string, url: string): Promise<AudioBuffer> {
		return new Promise((resolve) => {
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
				this.loader.addListener('complete', () => {
					resolve(this.game.cache.audio.get(key));
				});
			}
		});
	}

	public stop() {
		console.log('SoundManagerPlugin:stop');
		this.unsubscribe();
		this.context.close();
	}

	private syncWithState = () => {
		const state: T = this.store.getState();
		this.audioGraph.syncWithState(state);
	}
};
