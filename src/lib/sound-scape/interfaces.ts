export interface ISoundScapeState {

}

export interface ISoundtrackPlayer {
	/**
	 * Schedule soundtrack after all already in queue.
	 *
	 * @param soundtrack object describing intro loop outro of soundtrack to play
	 * @param duration amount of time to play scheduled soundtrack
	 * @param layer soundtrack layer
	 */
	scheduleAfterLast(soundtrack: ISoundtrack, duration?: number, layer?: number): void;

	/**
	 * Clean schedule queue and add transition to new soundtrack.
	 *
	 * @param soundtrack object describing intro loop outro of soundtrack to play
	 * @param duration amount of time to play scheduled soundtrack
	 * @param layer soundtrack layer
	 */
	scheduleNext(soundtrack: ISoundtrack, duration?: number): void;
	getCurrentScheduledSoundtrack(layer?: number): IScheduledSoundtrack[];

	/**
	 * Get soundtracks that will be played as last.
	 *
	 * @param layer soundtrack layer
	 */
	getLastScheduledSoundtrack(layer?: number): IScheduledSoundtrack | null;

	/**
	 * Return list of scheduled soundtracks.
	 */
	getSchedule(layer?: number): IScheduledSoundtrack[];
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
