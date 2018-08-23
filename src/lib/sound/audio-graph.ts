import { inject } from 'lib/di';

import { IAudioBufferRepository, IAudioContextFactory } from './interfaces';
import { ISoundConfigurationState } from './sound-manager.plugin';

@inject(['audio-context:factory', 'audio-repository'])
export class AudioGraph {
	private musicLoop: AudioBufferSourceNode | null = null;

	private masterGain?: GainNode;
	private musicGain?: GainNode;
	private soundtrackAutomationGain?: GainNode;
	private soundtrackGain?: GainNode;
	private effectsGain?: GainNode;

	constructor(
		private context: AudioContext,
		private sounds: IAudioBufferRepository,
	) {
		this.sounds = sounds;
		this.context = context;

		this.masterGain = this.context.createGain();
		this.masterGain.connect(this.context.destination);

		// music branch
		this.musicGain = this.context.createGain();
		this.musicGain.connect(this.masterGain);

		this.soundtrackAutomationGain = this.context.createGain();
		this.soundtrackAutomationGain.connect(this.musicGain);

		this.soundtrackGain = this.context.createGain();
		this.soundtrackGain.connect(this.soundtrackAutomationGain);

		// effects branch
		this.effectsGain = this.context.createGain();
		this.effectsGain.connect(this.masterGain);
	}

	public playFxSound(key: string): AudioBufferSourceNode {
		const source = this.context.createBufferSource();

		source.buffer = this.sounds.get(key);

		if (!!this.effectsGain) {
			source.connect(this.effectsGain);
		}

		source.loop = false;
		source.start(0, 0);

		return source;
	}

	public stopLoop(): void {
		if (!!this.musicLoop) {
			this.musicLoop.stop();
			this.musicLoop = null;
		}
	}

	public playLoop(key: string): AudioBufferSourceNode {
		const source = this.context.createBufferSource();

		source.buffer = this.sounds.get(key);

		if (!!this.soundtrackGain) {
			source.connect(this.soundtrackGain);
		}

		source.loop = true;
		source.start(0, 0);

		if (!!this.musicLoop) {
			this.musicLoop.stop();
		}

		this.musicLoop = source;

		return source;
	}

	public syncWithState(state: ISoundConfigurationState): void {
		const mute = state.paused || state.mute;

		if (!!this.context) {
			if (mute) {
				this.context.suspend();
			} else {
				this.context.resume();
			}
		}

		if (!!this.masterGain) {
			this.masterGain.gain.value = state.volume;
		}

		if (!!this.musicGain) {
			this.musicGain.gain.value = state.musicMuted ? 0 : state.musicVolume;
		}

		if (!!this.effectsGain) {
			this.effectsGain.gain.value = state.effectsMuted ? 0 : state.effectsVolume;
		}
	}
}
