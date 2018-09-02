import { inject } from 'lib/di';

import { IAudioBufferRepository, IStateAwareAudioTrack } from './interfaces';

@inject(['audio-context:factory', 'audio-repository'])
export class AudioMixerTrack implements IStateAwareAudioTrack {
	private soundLoop: AudioBufferSourceNode | null = null;

	private trackGain: GainNode;
	private trackAutomationGain: GainNode;

	constructor(
		private context: AudioContext,
		private sounds: IAudioBufferRepository,
	) {
		this.sounds = sounds;
		this.context = context;
		this.trackGain = this.context.createGain();
		this.trackAutomationGain = this.context.createGain();
		this.trackAutomationGain.connect(this.trackGain);
	}

	public connect(node: AudioNode): AudioNode {
		return this.trackGain.connect(node);
	}

	public getNode(): AudioNode {
		return this.trackAutomationGain;
	}

	public create(key: string): AudioBufferSourceNode {
		const source = this.context.createBufferSource();

		source.buffer = this.sounds.get(key);
		source.connect(this.trackAutomationGain);

		return source;
	}

	public play(key: string, when?: number, offset?: number, duration?: number): AudioBufferSourceNode {
		const source = this.create(key);

		source.loop = false;
		source.start(when, offset, duration);

		return source;
	}

	public stop(when?: number): void {
		if (!!this.soundLoop) {
			this.soundLoop.stop(when);
			this.soundLoop = null;
		}
	}

	public playLoop(key: string, when?: number, offset?: number, duration?: number): AudioBufferSourceNode {
		const source = this.create(key);

		source.loop = true;
		source.start(when, offset, duration);

		if (!!this.soundLoop) {
			this.soundLoop.stop(when);
		}

		this.soundLoop = source;

		return source;
	}

	public syncWithState({ muted, volume }): void {
		this.trackGain.gain.value = muted ? 0 : volume;
	}
}
