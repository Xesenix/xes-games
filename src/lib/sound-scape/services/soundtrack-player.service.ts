import { inject } from 'lib/di';
import { IAudioTrack } from 'lib/sound';

import { ISoundtrack } from '../interfaces';

@inject(['audio-mixer:track:music'])
export class SoundtrackPlayer {
	constructor(
		private music: IAudioTrack,
	) {
		this.music = music;
	}

	public scheduleNext(soundtrack: ISoundtrack, when: number, duration: number): void {
		console.log('SoundtrackPlayer:scheduleNext', when, soundtrack);
		if (when === 0) {
			when = 0.125; // fix for sync errors
		}
		const durationMs = Math.floor(duration * 1000);
		const introStartMs = Math.floor(soundtrack.intro.start);
		const introEndMs = Math.floor(soundtrack.intro.end);
		const loopStartMs = Math.floor(soundtrack.loop.start);
		const loopEndMs = Math.floor(soundtrack.loop.end);
		const outroStartMs = Math.floor(soundtrack.outro.start);
		const outroEndMs = Math.floor(soundtrack.outro.end);
		const introDurationMs = Math.min(introEndMs - introStartMs, durationMs);
		const singleLoopDurationMs = loopEndMs - loopStartMs;
		const totalLoopDurationMs = durationMs > introDurationMs ? Math.round((durationMs - introDurationMs) / singleLoopDurationMs) * singleLoopDurationMs : 0;
		const outroDurationMs = outroEndMs - outroStartMs;
		console.log('', {
			introStartMs,
			introEndMs,
			introDurationMs,
			loopStartMs,
			loopEndMs,
			singleLoopDurationMs,
			totalLoopDurationMs,
			outroStartMs,
			outroEndMs,
			outroDurationMs,
		});

		if (introDurationMs > 0) {
			const intro: AudioBufferSourceNode = this.music.create(soundtrack.key);
			intro.start(when, introStartMs * 0.001, introDurationMs * 0.001);
			intro.stop(when + introDurationMs * 0.001);
		}

		if (durationMs > 0) {
			if (totalLoopDurationMs > 0) {
				const loop: AudioBufferSourceNode = this.music.create(soundtrack.key);
				loop.loopStart = loopStartMs * 0.001;
				loop.loopEnd = loopEndMs * 0.001;
				loop.loop = true;

				loop.start(when + introDurationMs * 0.001, loopStartMs * 0.001, totalLoopDurationMs * 0.001);
				loop.stop(when + (introDurationMs + totalLoopDurationMs) * 0.001);
			}

			if (outroDurationMs > 0) {
				const outro: AudioBufferSourceNode = this.music.create(soundtrack.key);
				outro.start(when + (introDurationMs + totalLoopDurationMs) * 0.001, outroStartMs * 0.001, outroDurationMs * 0.001);
				outro.stop(when + (introDurationMs + totalLoopDurationMs + outroDurationMs) * 0.001);
			}
		} else {
			const loop: AudioBufferSourceNode = this.music.create(soundtrack.key);
			loop.loopStart = loopStartMs * 0.001;
			loop.loopEnd = loopEndMs * 0.001;
			loop.loop = true;

			loop.start(when + introDurationMs * 0.001, loopStartMs * 0.001);
		}
	}
}
