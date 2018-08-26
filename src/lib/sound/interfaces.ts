export type IAudioContextFactory = AudioContext;

export interface IAudioFile {
	key: string;
	url: string;
	data?: AudioBuffer;
}

export interface IAudioFileLoader {
	add(key: string,  url: string): void;
}

export interface IAudioBufferRepository {
	get(key: string): AudioBuffer;
}
