export interface ISoundScapeState {

}

export interface ISoundtrackPlayer {
	scheduleNext(soundtrack: ISoundtrack, when: number, duration: number): void;
}

export interface ISoundtrack {
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
