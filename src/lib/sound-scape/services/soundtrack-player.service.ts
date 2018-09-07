import { inject } from 'lib/di';
import { IAudioTrack } from 'lib/sound';

import { IScheduledSoundtrack, ISoundtrack, } from '../interfaces';

@inject(['audio-mixer:track:music', 'audio-context:factory', 'event-manager'])
export class SoundtrackPlayer {
	private layers: { [key: number]: IScheduledSoundtrack[] } = { 0: [] };

	constructor(
		private music: IAudioTrack,
		private context: Pick<AudioContext, 'currentTime'>,
		private eventsManager: EventEmitter,
	) {
		this.music = music;
		this.context = context;
		this.eventsManager = eventsManager;
	}

	public scheduleIntroAt(soundtrack: ISoundtrack, when: number = 0, layer: number = 0): IScheduledSoundtrack | null {
		const introStart = soundtrack.intro.start;
		const introEnd = soundtrack.intro.end;
		const introDuration = soundtrack.intro.duration;

		if (introDuration > 0) {
			const node: AudioBufferSourceNode = this.music.create(soundtrack.key);
			const descriptor = {
				soundtrack,
				state: 'intro',
				start: when,
				end: when + introDuration,
				loop: false,
				loopDuration: 0,
				interruptionStep: 0,
				node,
			} as IScheduledSoundtrack;

			node.onended = () => this.removeSoundtrackFromScheduleQueue(layer, descriptor);

			node.start(descriptor.start, introStart);
			node.stop(descriptor.end);

			this.layers[layer].push(descriptor);

			this.eventsManager.emit('soundtrack:schedule-changed', this);

			return descriptor;
		}

		return null;
	}

	public scheduleLoopAt(soundtrack: ISoundtrack, when: number = 0, duration: number = 0, layer: number = 0): IScheduledSoundtrack | null {
		const loopStart = soundtrack.loop.start;
		const loopEnd = soundtrack.loop.end;
		const loopDuration = loopEnd - loopStart;
		const interruptionStep = soundtrack.loop.interruptionStep || loopDuration;
		if (interruptionStep > 0) {
			const totalLoopDuration = duration > 0 ? Math.round(duration / loopDuration) * loopDuration : 0;

			if (totalLoopDuration > 0) {
				const node: AudioBufferSourceNode = this.music.create(soundtrack.key);
				const descriptor = {
					soundtrack,
					state: 'loop',
					start: when,
					end: when + totalLoopDuration,
					loop: true,
					loopDuration,
					interruptionStep,
					node,
				} as IScheduledSoundtrack;

				node.loopStart = loopStart;
				node.loopEnd = loopEnd;
				node.loop = true;
				node.onended = () => this.removeSoundtrackFromScheduleQueue(layer, descriptor);

				node.start(descriptor.start, loopStart);
				node.stop(descriptor.end);

				this.layers[layer].push(descriptor);

				this.eventsManager.emit('soundtrack:schedule-changed', this);

				return descriptor;
			} else if (duration === 0) {
				const node: AudioBufferSourceNode = this.music.create(soundtrack.key);
				const descriptor = {
					soundtrack,
					state: 'endless',
					start: when,
					loop: true,
					loopDuration,
					interruptionStep,
					node,
				} as IScheduledSoundtrack;

				node.loopStart = loopStart;
				node.loopEnd = loopEnd;
				node.loop = true;
				node.onended = () => this.removeSoundtrackFromScheduleQueue(layer, descriptor);

				node.start(descriptor.start, loopStart);

				this.layers[layer].push(descriptor);

				this.eventsManager.emit('soundtrack:schedule-changed', this);

				return descriptor;
			}
		}

		return null;
	}

	public scheduleOutroAt(soundtrack: ISoundtrack, when: number = 0, layer: number = 0): IScheduledSoundtrack | null {
		const outroStart = soundtrack.outro.start;
		const outroEnd = soundtrack.outro.end;
		const outroDuration = outroEnd - outroStart;

		if (outroDuration > 0) {
			const node: AudioBufferSourceNode = this.music.create(soundtrack.key);
			const descriptor = {
				soundtrack,
				state: 'outro',
				start: when,
				end: when + outroDuration,
				loop: false,
				loopDuration: 0,
				interruptionStep: 0,
				node,
			} as IScheduledSoundtrack;

			node.onended = () => this.removeSoundtrackFromScheduleQueue(layer, descriptor);

			node.start(descriptor.start, outroStart);
			node.stop(descriptor.end);

			this.layers[layer].push(descriptor);

			this.eventsManager.emit('soundtrack:schedule-changed', this);

			return descriptor;
		}

		return null;
	}

	/**
	 * @inheritdoc
	 * @param soundtrack object describing intro loop outro of soundtrack to play
	 * @param duration amount of time to play scheduled soundtrack
	 * @param [layer=0] soundtrack layer
	 */
	public scheduleAfterLast(soundtrack: ISoundtrack, duration: number = 0, layer: number = 0): void {

		const last = this.getLastScheduledSoundtrack(layer);
		let when = this.getClosestInterruptionTime(last, this.context.currentTime);
		const soundtrackChanged = !last || last.soundtrack.name !== soundtrack.name;

		if (last && !last.end && last.loop) {
			// finish last endless loop
			last.state = 'loop';
			last.end = when;
			last.node.stop(when);

			if (soundtrackChanged) {
				const previousOutroScheduled = this.scheduleOutroAt(last.soundtrack, when);
				when = previousOutroScheduled ? previousOutroScheduled.end || when : when;
			}
		}


		if (soundtrackChanged) {
			const introScheduled = this.scheduleIntroAt(soundtrack, when, layer);
			when = introScheduled && introScheduled.end ? introScheduled.end : when;
		}

		const loopScheduled = this.scheduleLoopAt(soundtrack, when, duration, layer);
		when = loopScheduled && loopScheduled.end ? loopScheduled.end : when;

		if (duration > 0) {
			const scheduledOutro = this.scheduleOutroAt(soundtrack, when, layer);
		}
	}

	/**
	 * @inheritdoc
	 * @param soundtrack object describing intro loop outro of soundtrack to play
	 * @param duration amount of time to play scheduled soundtrack
	 * @param [layer=0] soundtrack layer
	 */
	public scheduleNext(soundtrack: ISoundtrack, duration: number = 0, layer: number = 0): void {
		this.clearSoundtracksAfter(0, layer);

		this.getCurrentScheduledSoundtrack().forEach((descriptor) => {
			if (descriptor.loop && descriptor.interruptionStep > 0) {
				const newEnd = descriptor.start + Math.ceil((this.context.currentTime - descriptor.start) / descriptor.interruptionStep) * descriptor.interruptionStep;

				if (descriptor.end !== newEnd) {
					descriptor.end = newEnd;
					descriptor.node.stop(newEnd);
				}
			}
		});

		this.scheduleAfterLast(soundtrack, duration, layer);
	}

	public getSchedule(layer: number = 0): IScheduledSoundtrack[] {
		return this.layers[layer];
	}

	/**
	 * Remove soundtracks scheduled after time and prevents them from playing in audio context.
	 *
	 * @param [offset=0] offset time to current audio context time
	 * @param [layer=0] soundtrack layer
	 */
	public clearSoundtracksAfter(offset: number = 0, layer: number = 0): void {
		const when = this.context.currentTime + offset;
		this.layers[layer] = this.layers[layer].filter(({ start, node }) => {
			if (start < when) {
				return true;
			}

			// dont start it
			node.stop();

			return false;
		});
		this.eventsManager.emit('soundtrack:schedule-changed', this);
	}

	/**
	 * @inheritdoc
	 * @param [layer=0] soundtrack layer
	 */
	public getLastScheduledSoundtrack(layer: number = 0): IScheduledSoundtrack | null {
		return this.layers[layer].reduce(
			(result: IScheduledSoundtrack | null, current: IScheduledSoundtrack) =>
				result !== null && result.end && current.end && result.end < current.end || current ? current : result,
			null,
		);
	}

	public getCurrentScheduledSoundtrack(layer: number = 0): IScheduledSoundtrack[] {
		const currentAudioTime = this.context.currentTime;
		return this.layers[layer].filter(
			({ start, end }: IScheduledSoundtrack) => start <= currentAudioTime && (!end || end > currentAudioTime),
		);
	}

	private removeSoundtrackFromScheduleQueue(layer, descriptor) {
		this.layers[layer] = this.layers[layer].filter(({ node }) => node !== descriptor.node);
		this.eventsManager.emit('soundtrack:schedule-changed', this);
	}

	/**
	 * Find closes point in audio context time that we can interrupt playing soundtrack.
	 * TODO: add ability to specify set off offsets that can be used for interrupting instead of interruptionStep
	 *
	 * @param scheduled soundtrack descriptor
	 * @returns audio context time at which we can interrupt
	 */
	private getClosestInterruptionTime(descriptor: IScheduledSoundtrack | null, when: number = 0): number {
		if (!descriptor) {
			return this.context.currentTime;
		}
		const { loopDuration } = descriptor;
		const { start, end, loop, interruptionStep = loopDuration } = descriptor;
		const result = end
			? end
			: loop && interruptionStep > 0
				? Math.ceil((when - start) / interruptionStep) * interruptionStep + start
				: when;

		return result;
	}
}
