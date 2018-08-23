export type IAudioContextFactory = AudioContext;

export interface IAudioFile {
	key: string;
	url: string;
	type: 'fx' | 'music';
	data?: AudioBuffer;
}

export interface IAudioBufferRepository {
	get(key: string): AudioBuffer;
}
