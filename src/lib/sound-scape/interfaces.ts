export interface ISoundScapeState {

}

export interface ISoundtrackPlayer {
	scheduleNext(soundtrack: ISoundtrack, when: number, duration: number): void;
	getCurrentSoundtrack(layer: number): IScheduledSoundtrack[];
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
}

export interface IScheduledSoundtrack {
	name: string;
	start: number;
	end?: number;
	node: AudioNode;
	loop: boolean;
	loopDuration?: number;
}
