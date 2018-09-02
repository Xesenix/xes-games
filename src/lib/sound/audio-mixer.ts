import { inject } from 'lib/di';

import {
	IAudioConfigurationState,
	IAudioTrack,
	IStateAwareAudioMixer,
	IStateAwareAudioTrack,
} from './interfaces';

@inject(['audio-context:factory', 'audio-mixer:track:music', 'audio-mixer:track:effects', 'audio-mixer:track:master'])
export class AudioMixer implements IStateAwareAudioMixer {
	private tracks: { [key: string]: IStateAwareAudioTrack } = {};

	constructor(
		private context: AudioContext,
		music: IStateAwareAudioTrack,
		effects: IStateAwareAudioTrack,
		master: IStateAwareAudioTrack,
	) {
		this.context = context;
		this.tracks = {
			music,
			effects,
			master,
		};

		// master branch
		master.connect(this.context.destination);

		// music branch
		music.connect(master.getNode());

		// effects branch
		effects.connect(master.getNode());
	}

	public getTrack(key: string): IAudioTrack {
		return this.tracks[key] ? this.tracks[key] : this.tracks.master;
	}

	public syncWithState(state: IAudioConfigurationState): void {
		const muted = state.paused || state.mute;

		if (muted) {
			this.context.suspend();
		} else {
			this.context.resume();
		}

		if (!!this.tracks.master) {
			this.tracks.master.syncWithState({ muted, volume: state.volume });
		}

		if (!!this.tracks.music) {
			this.tracks.music.syncWithState({ muted: state.musicMuted, volume: state.musicVolume });
		}

		if (!!this.tracks.effects) {
			this.tracks.effects.syncWithState({ muted: state.effectsMuted, volume: state.effectsVolume });
		}
	}
}
