import { Store } from 'redux';

export type IAudioContextFactory = AudioContext;
export type IAudioFileLoaderProvider = () => Promise<IAudioFileLoader>;

export interface IAudioFile {
	key: string;
	url: string;
	data?: AudioBuffer;
}

export interface IAudioFileLoader {
	add(key: string,  url: string): void;
	loadAll(): Promise<void>;
}

export interface IAudioBufferRepository {
	add(key: string, data: AudioBuffer): void;
	get(key: string): AudioBuffer | null;
}

export interface IAudioConfigurationState {
	mute: boolean;
	musicMuted: boolean;
	effectsMuted: boolean;
	effectsVolume: number;
	musicVolume: number;
	volume: number;
	paused: boolean;
}

export interface IAudioManager {
	loader?: Phaser.Loader.LoaderPlugin;
	preloadAudioAsset(key: string, src: string): void;
	playFxSound(key: string): Promise<AudioBufferSourceNode>;
	playLoop(key: string): Promise<AudioBufferSourceNode>;
	stopSound(key: string): void;
	preload(): Promise<void>;
}

export interface IAudioManagerPlugin<T extends IAudioConfigurationState> extends Phaser.Plugins.BasePlugin {
	store: Store<T>;
}
