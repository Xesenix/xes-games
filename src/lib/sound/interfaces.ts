import { Store } from 'redux';
import { IStoreStateAware } from '../data-store/interface';

export type IAudioContextFactory = AudioContext;
export type IAudioFileLoaderProvider = () => Promise<IAudioFileLoader>;

export interface IAudioConfigurationState {
	mute: boolean;
	musicMuted: boolean;
	effectsMuted: boolean;
	effectsVolume: number;
	musicVolume: number;
	volume: number;
	paused: boolean;
}

export interface IAudioBufferRepository {
	add(key: string, data: AudioBuffer): void;
	get(key: string): AudioBuffer | null;
}

export interface IAudioFile {
	key: string;
	url: string;
	data?: AudioBuffer;
}

export interface IAudioFileLoader {
	add(key: string,  url: string): void;
	loadAll(): Promise<void>;
}

export interface IAudioManager {
	loader?: Phaser.Loader.LoaderPlugin;
	preloadAudioAsset(key: string, src: string): void;
	playFxSound(key: string): Promise<AudioBufferSourceNode>;
	playLoop(key: string): Promise<AudioBufferSourceNode>;
	stopSound(key: string): void;
	preload(): Promise<void>;
}

/**
 * Defines interface for getting to specific sound track.
 */
export interface IAudioMixer {
	getTrack(key: string): IAudioTrack;
}

export type IStateAwareAudioMixer = IAudioMixer & IStoreStateAware<IAudioConfigurationState>;

/**
 * Defines actions available for single mixing track.
 */
export interface IAudioTrack {
	playLoop(key: string, when?: number, offset?: number, duration?: number | undefined): AudioBufferSourceNode;
	play(key: string, when?: number, offset?: number, duration?: number | undefined): AudioBufferSourceNode;
	stop(when?: number): void;
	connect(node: AudioNode): AudioNode;
	getNode(): AudioNode;
}

export type IStateAwareAudioTrack = IAudioTrack & IStoreStateAware<{ muted: boolean, volume: number }>;

export interface IAudioManagerPlugin<T extends IAudioConfigurationState> extends Phaser.Plugins.BasePlugin {
	store: Store<T>;
}
