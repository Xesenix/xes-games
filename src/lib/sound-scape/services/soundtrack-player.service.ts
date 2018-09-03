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

	public scheduleNext(soundtrack: ISoundtrack, when: number, duration: number, layer: number = 0): void {
		console.log('SoundtrackPlayer:scheduleNext', when, soundtrack);
		const currentAudioTime = this.context.currentTime;
		when += currentAudioTime; // fix for sync errors
		duration = Math.floor(duration * 1000 ) * 0.001;
		const introStart = Math.floor(soundtrack.intro.start) * 0.001;
		const introEnd = Math.floor(soundtrack.intro.end) * 0.001;
		const loopStart = Math.floor(soundtrack.loop.start) * 0.001;
		const loopEnd = Math.floor(soundtrack.loop.end) * 0.001;
		const outroStart = Math.floor(soundtrack.outro.start) * 0.001;
		const outroEnd = Math.floor(soundtrack.outro.end) * 0.001;
		const introDuration = Math.min(introEnd - introStart, duration);
		const singleLoopDuration = loopEnd - loopStart;
		const totalLoopDuration = duration > introDuration ? Math.round((duration - introDuration) / singleLoopDuration) * singleLoopDuration : 0;
		const outroDuration = outroEnd - outroStart;
		console.log('START SOUNDTRACK', {
			currentAudioTime,
			introStart,
			introEnd,
			introDuration,
			loopStart,
			loopEnd,
			singleLoopDuration,
			totalLoopDuration,
			outroStart,
			outroEnd,
			outroDuration,
		});

		if (introDuration > 0) {
			const intro: AudioBufferSourceNode = this.music.create(soundtrack.key);
			const descriptor = {
				name: soundtrack.name + '-intro',
				start: when,
				end: when + introDuration,
				loop: false,
				loopDuration: 0,
				node: intro,
			};

			intro.start(when, introStart);
			intro.stop(when + introDuration);
			intro.onended = () => this.removeSoundtrackFromSchedule(layer, descriptor);

			this.layers[layer].push(descriptor);
		}

		if (duration > 0) {
			if (totalLoopDuration > 0) {
				const loop: AudioBufferSourceNode = this.music.create(soundtrack.key);
				const descriptor = {
					name: soundtrack.name + '-loop',
					start: when + introDuration,
					end: when + introDuration + totalLoopDuration,
					loop: true,
					loopDuration: singleLoopDuration,
					node: loop,
				};

				loop.loopStart = loopStart;
				loop.loopEnd = loopEnd;
				loop.loop = true;
				loop.onended = () => this.removeSoundtrackFromSchedule(layer, descriptor);

				loop.start(when + introDuration, loopStart);
				loop.stop(when + introDuration + totalLoopDuration);

				this.layers[layer].push(descriptor);
			}

			if (outroDuration > 0) {
				const outro: AudioBufferSourceNode = this.music.create(soundtrack.key);
				const descriptor = {
					name: soundtrack.name + '-outro',
					start: when + introDuration + totalLoopDuration,
					end: when + introDuration + totalLoopDuration + outroDuration,
					loop: false,
					loopDuration: 0,
					node: outro,
				};

				outro.start(when + introDuration + totalLoopDuration, outroStart);
				outro.stop(when + introDuration + totalLoopDuration + outroDuration);
				outro.onended = () => this.removeSoundtrackFromSchedule(layer, descriptor);

				this.layers[layer].push(descriptor);
			}
		} else {

			const loop: AudioBufferSourceNode = this.music.create(soundtrack.key);
			const descriptor = {
				name: soundtrack.name + '-endless',
				start: when + introDuration,
				loop: true,
				loopDuration: singleLoopDuration,
				node: loop,
			};
			loop.loopStart = loopStart;
			loop.loopEnd = loopEnd;
			loop.loop = true;
			loop.onended = () => this.removeSoundtrackFromSchedule(layer, descriptor);

			loop.start(when + introDuration, loopStart);

			this.layers[layer].push(descriptor);
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
