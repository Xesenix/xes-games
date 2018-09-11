import { Store } from 'redux';

import { IStateAwareAudioMixer } from '../interfaces';
import {
	IAudioBufferRepository,
	IAudioConfigurationState,
	IAudioFileLoader,
	IAudioManagerPlugin,
} from '../interfaces';

export const phaserAudioManagerPluginFactory = <T extends IAudioConfigurationState>(
	store: Store,
	context: AudioContext,
	audioMixer: IStateAwareAudioMixer,
	repository: IAudioBufferRepository,
	audioLoader: IAudioFileLoader,
) => class PhaserAudioManagerPlugin extends Phaser.Plugins.BasePlugin implements IAudioManagerPlugin<T> {
	public store: Store<T> = store;
	public loader?: Phaser.Loader.LoaderPlugin;
	public repository: IAudioBufferRepository = repository;
	public audioLoader: IAudioFileLoader = audioLoader;
	public audioMixer: IStateAwareAudioMixer = audioMixer;
	public context = context;
	private unsubscribe: any;

	constructor(
		public pluginManager: Phaser.Plugins.PluginManager,
	) {
		super(pluginManager);
		console.log('PhaserAudioManagerPlugin:constructor');
	}

	/**
	 * Phaser 3 loaders are scene specific so we need to set them in scene preloading method.
	 * TODO: ensure that this works with multiple scenes.
	 *
	 * @param loader phaser asset loader
	 */
	public setLoader(loader: Phaser.Loader.LoaderPlugin): void {
		if (!!(this.audioLoader as any).setLoader) {
			(this.audioLoader as any).setLoader(loader);
		}
	}

	public start(): void {
		console.log('PhaserAudioManagerPlugin:start', this);
		this.unsubscribe = this.store.subscribe(this.syncWithState);
		this.syncWithState();
	}

	public stop() {
		console.log('PhaserAudioManagerPlugin:stop');
		this.unsubscribe();
	}

	public preload(): Promise<void> {
		return this.audioLoader.loadAll();
	}

	public preloadAudioAsset(key: string, url: string): void {
		this.audioLoader.add(key, url);
	}

	public playFxSound(key: string): Promise<AudioBufferSourceNode> {
		console.log('PhaserAudioManagerPlugin:playFxSound', key);
		return Promise.resolve(this.audioMixer.getTrack('effects').play(key));
	}

	public stopSound(key: string): void {
		console.log('PhaserAudioManagerPlugin:stopSound', key);
		this.audioMixer.getTrack('music').stop();
	}

	public playLoop(key: string): Promise<AudioBufferSourceNode> {
		console.log('PhaserAudioManagerPlugin:playLoop', key);
		return Promise.resolve(this.audioMixer.getTrack('effects').playLoop(key));
	}

	private syncWithState = () => {
		const state: T = this.store.getState();
		this.audioMixer.syncWithState(state);
	}
};
