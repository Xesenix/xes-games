import { IAudioFileLoader } from './interfaces';
import { Store } from 'redux';

import { AudioBufferRepository } from './audio-buffer-repository';
import { AudioGraph } from './audio-graph';
import { PhaserAudioLoaderService } from './phaser-audio-loader.service';

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
	audioLoader: IAudioFileLoader,
) => class SoundManagerPlugin extends Phaser.Plugins.BasePlugin implements ISoundManagerPlugin<T>, ISoundManager {
	public store: Store<T> = store;
	public loader?: Phaser.Loader.LoaderPlugin;
	public repository: AudioBufferRepository = repository;
	public audioLoader: IAudioFileLoader = audioLoader;
	public audioGraph: AudioGraph = audioGraph;
	private unsubscribe: any;
	private context = context;

	constructor(
		public pluginManager: Phaser.Plugins.PluginManager,
	) {
		super(pluginManager);
		console.log('SoundManagerPlugin:constructor');
	}

	public setLoader(loader: Phaser.Loader.LoaderPlugin): void {
		if (this.audioLoader instanceof PhaserAudioLoaderService) {
			(this.audioLoader as PhaserAudioLoaderService).setLoader(loader);
		}
	}

	public start(): void {
		console.log('SoundManagerPlugin:start', this);
		this.unsubscribe = this.store.subscribe(this.syncWithState);
		this.syncWithState();
	}

	public stop() {
		console.log('SoundManagerPlugin:stop');
		this.unsubscribe();
		this.context.close();
	}

	public loadAll(): Promise<void> {
		return this.audioLoader.loadAll();
	}

	public preloadAudioAsset(key: string, url: string): void {
		this.audioLoader.add(key, url);
	}

	public playFxSound(key: string): Promise<AudioBufferSourceNode> {
		console.log('SoundManagerPlugin:playFxSound', key);
		return Promise.resolve(this.audioGraph.playFxSound(key));
	}

	public stopSound(key: string): void {
		console.log('SoundManagerPlugin:stopSound', key);
		this.audioGraph.stopLoop();
	}

	public playLoop(key: string): Promise<AudioBufferSourceNode> {
		console.log('SoundManagerPlugin:playLoop', key);
		return Promise.resolve(this.audioGraph.playLoop(key));
	}

	private syncWithState = () => {
		const state: T = this.store.getState();
		this.audioGraph.syncWithState(state);
	}
};