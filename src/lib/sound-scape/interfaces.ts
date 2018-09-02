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
	 * Soundtrack intro start time.
	 */
	introStartMs: number;
	/**
	 * Soundtrack intro end time.
	 */
	introEndMs: number;
	/**
	 * Soundtrack loop start time.
	 */
	loopStartMs: number;
	/**
	 * Soundtrack loop end time.
	 */
	loopEndMs: number;
	/**
	 * Soundtrack outro start time.
	 */
	outroStartMs: number;
	/**
	 * Soundtrack outro end time.
	 */
	outroEndMs: number;
}

export interface ISoundtrackManager {
	soundtrackPlayer: ISoundtrackPlayer;
}
