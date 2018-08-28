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
	get(key: string): AudioBuffer;
}
