import { inject } from 'lib/di';
import { IAudioTrack } from 'lib/sound';

import { IScheduledSoundtrack, ISoundtrack, } from '../interfaces';

@inject(['audio-mixer:track:music', 'audio-context:factory'])
export class SoundtrackPlayer {
	private layers: { [key: number]: IScheduledSoundtrack[] } = { 0: [] };

	constructor(
		private music: IAudioTrack,
		private context: AudioContext,
	) {
		this.music = music;
		this.context = context;
	}

	/**
	 * Return point at time when we can attach another transition.
	 */
	public getLastScheduled(layer: number = 0): IScheduledSoundtrack | null {
		return this.layers[layer].reduce(
			(result: IScheduledSoundtrack | null, current: IScheduledSoundtrack) =>
				result !== null && result.end && current.end && result.end < current.end || current.end ? current : result,
			null,
		);
	}

	public scheduleIntroAt(soundtrack: ISoundtrack, when: number, layer: number = 0): IScheduledSoundtrack | null {
		const introStart = soundtrack.intro.start;
		const introEnd = soundtrack.intro.end;
		const introDuration = introEnd - introStart;

		if (introDuration > 0) {
			const node: AudioBufferSourceNode = this.music.create(soundtrack.key);
			const descriptor = {
				soundtrack: soundtrack.name,
				state: 'intro',
				start: when,
				end: when + introDuration,
				loop: false,
				loopDuration: 0,
				node,
			} as IScheduledSoundtrack;

			node.onended = () => this.removeSoundtrackFromSchedule(layer, descriptor);

			node.start(descriptor.start, introStart);
			node.stop(descriptor.end);

			this.layers[layer].push(descriptor);

			return descriptor;
		}

		return null;
	}

	public scheduleLoopAt(soundtrack: ISoundtrack, when: number, duration: number, layer: number = 0): IScheduledSoundtrack | null {
		const loopStart = soundtrack.loop.start;
		const loopEnd = soundtrack.loop.end;
		const singleLoopDuration = loopEnd - loopStart;
		const totalLoopDuration = duration > 0 ? Math.round(duration / singleLoopDuration) * singleLoopDuration : 0;

		if (totalLoopDuration > 0) {
			const node: AudioBufferSourceNode = this.music.create(soundtrack.key);
			const descriptor = {
				soundtrack: soundtrack.name,
				state: 'loop',
				start: when,
				end: when + totalLoopDuration,
				loop: true,
				loopDuration: singleLoopDuration,
				node,
			} as IScheduledSoundtrack;

			node.loopStart = loopStart;
			node.loopEnd = loopEnd;
			node.loop = true;
			node.onended = () => this.removeSoundtrackFromSchedule(layer, descriptor);

			node.start(descriptor.start, loopStart);
			node.stop(descriptor.end);

			this.layers[layer].push(descriptor);

			return descriptor;
		} else {
			const node: AudioBufferSourceNode = this.music.create(soundtrack.key);
			const descriptor = {
				soundtrack: soundtrack.name,
				state: 'endless',
				start: when,
				loop: true,
				loopDuration: singleLoopDuration,
				node,
			} as IScheduledSoundtrack;

			node.loopStart = loopStart;
			node.loopEnd = loopEnd;
			node.loop = true;
			node.onended = () => this.removeSoundtrackFromSchedule(layer, descriptor);

			node.start(descriptor.start, loopStart);

			this.layers[layer].push(descriptor);

			return descriptor;
		}
	}

	public scheduleOutroAt(soundtrack: ISoundtrack, when: number, layer: number = 0): IScheduledSoundtrack | null {
		const outroStart = soundtrack.outro.start;
		const outroEnd = soundtrack.outro.end;
		const outroDuration = outroEnd - outroStart;

		if (outroDuration > 0) {
			const node: AudioBufferSourceNode = this.music.create(soundtrack.key);
			const descriptor = {
				soundtrack: soundtrack.name,
				state: 'outro',
				start: when,
				end: when + outroDuration,
				loop: false,
				loopDuration: 0,
				node,
			} as IScheduledSoundtrack;

			node.onended = () => this.removeSoundtrackFromSchedule(layer, descriptor);

			node.start(descriptor.start, outroStart);
			node.stop(descriptor.end);

			this.layers[layer].push(descriptor);

			return descriptor;
		}

		return null;
	}

	public scheduleNext(soundtrack: ISoundtrack, duration: number, layer: number = 0): void {
		const last = this.getLastScheduled(layer);
		const when = last && last.end ? last.end : this.context.currentTime;

		const introScheduled = this.scheduleIntroAt(soundtrack, when, layer);

		const loopScheduled = this.scheduleLoopAt(soundtrack, introScheduled && introScheduled.end ? introScheduled.end : when, duration, layer);

		if (duration > 0) {
			const scheduledOutro = this.scheduleOutroAt(soundtrack, loopScheduled && loopScheduled.end ? loopScheduled.end : when, layer);
		}
	}

	public getCurrentSoundtrack(layer: number = 0): IScheduledSoundtrack[] {
		const currentAudioTime = this.context.currentTime;
		const currentSoundTracks = this.layers[layer].filter(
			({ start, end }: IScheduledSoundtrack) => start <= currentAudioTime && (!end || end > currentAudioTime),
		);
		return currentSoundTracks;
	}

	private removeSoundtrackFromSchedule(layer, descriptor) {
		this.layers[layer] = this.layers[layer].filter(({ node }) => node !== descriptor.node);
	}
}
