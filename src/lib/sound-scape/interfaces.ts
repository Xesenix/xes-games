export interface ISoundScapeState {

}

export interface ISoundtrackPlayer {
	scheduleAfterLast(soundtrack: ISoundtrack, duration?: number, layer?: number): void;
	scheduleNext(soundtrack: ISoundtrack, duration?: number): void;
	getCurrentScheduledSoundtrack(layer: number): IScheduledSoundtrack[];
	getLastScheduledSoundtrack(layer: number): IScheduledSoundtrack[];
}

export interface ISoundtrack {
	name: string;
	/**
	 * Audio asset name used to find audio buffer in repository.
	 */
	key: string;

	/**
	 * Soundtrack intro.
	 */
	intro: ISoundSprite;

	/**
	 * Soundtrack loop.
	 */
	loop: ISoundSprite;

	/**
	 * Soundtrack outro.
	 */
	outro: ISoundSprite;
}

export interface ISoundtrackManager {
	soundtrackPlayer: ISoundtrackPlayer;
}

export interface ISoundSprite {
	start: number;
	end: number;
	duration: number;
	interruptionStep?: number;
}

export interface IScheduledSoundtrack {
	soundtrack: ISoundtrack;
	state: 'intro' | 'loop' | 'outro' | 'endless';
	start: number;
	end?: number;
	node: AudioBufferSourceNode;
	loop: boolean;
	loopDuration: number;
	interruptionStep: number;
}
