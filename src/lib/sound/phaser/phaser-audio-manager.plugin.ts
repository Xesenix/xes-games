import { Store } from 'redux';

import { AudioMixer } from '../audio-mixer';
import {
	IAudioBufferRepository,
	IAudioConfigurationState,
	IAudioFileLoader,
	IAudioManagerPlugin,
} from '../interfaces';

export const phaserAudioManagerPluginFactory = <T extends IAudioConfigurationState>(
	store: Store,
	context: AudioContext,
	audioMixer: AudioMixer,
	repository: IAudioBufferRepository,
	audioLoader: IAudioFileLoader,
) => class PhaserAudioManagerPlugin extends Phaser.Plugins.BasePlugin implements IAudioManagerPlugin<T> {
	public store: Store<T> = store;
	public loader?: Phaser.Loader.LoaderPlugin;
	public repository: IAudioBufferRepository = repository;
	public audioLoader: IAudioFileLoader = audioLoader;
	public audioMixer: AudioMixer = audioMixer;
	private unsubscribe: any;
	private context = context;

	constructor(
		public pluginManager: Phaser.Plugins.PluginManager,
	) {
		super(pluginManager);
		console.log('AudioManagerPlugin:constructor');
	}

	public setLoader(loader: Phaser.Loader.LoaderPlugin): void {
		if (!!(this.audioLoader as any).setLoader) {
			(this.audioLoader as any).setLoader(loader);
		}
	}

	public start(): void {
		console.log('AudioManagerPlugin:start', this);
		this.unsubscribe = this.store.subscribe(this.syncWithState);
		this.syncWithState();
	}

	public stop() {
		console.log('AudioManagerPlugin:stop');
		this.unsubscribe();
		this.context.close();
	}

	public preload(): Promise<void> {
		return this.audioLoader.loadAll();
	}

	public preloadAudioAsset(key: string, url: string): void {
		this.audioLoader.add(key, url);
	}

	public playFxSound(key: string): Promise<AudioBufferSourceNode> {
		console.log('AudioManagerPlugin:playFxSound', key);
		return Promise.resolve(this.audioMixer.playFxSound(key));
	}

	public stopSound(key: string): void {
		console.log('AudioManagerPlugin:stopSound', key);
		this.audioMixer.stopLoop();
	}

	public playLoop(key: string): Promise<AudioBufferSourceNode> {
		console.log('AudioManagerPlugin:playLoop', key);
		return Promise.resolve(this.audioMixer.playLoop(key));
	}

	private syncWithState = () => {
		const state: T = this.store.getState();
		this.audioMixer.syncWithState(state);
	}
};
