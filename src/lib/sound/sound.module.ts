import { interfaces } from 'inversify';
import { IApplication } from 'lib/interfaces';

import { AudioBufferRepository } from './audio-buffer-repository';
import { audioLoaderProvider } from './audio-loader.provider';
import { AudioMixer } from './audio-mixer';
import { AudioMixerTrack } from './audio-mixer-track';
import {
	IAudioConfigurationState,
	IAudioContextFactory,
	IAudioFileLoaderProvider,
	IAudioMixer,
	IAudioTrack,
} from './interfaces';
import { phaserAudioLoaderProvider } from './phaser/phaser-audio-loader.provider';
import { phaserAudioManagerPluginProvider } from './phaser/phaser-audio-manager-plugin.provider';

export class SoundModule<T extends IAudioConfigurationState> {
	public static register<T extends IAudioConfigurationState>(app: IApplication) {
		app.bind<SoundModule<T>>('sound:module').toConstantValue(new SoundModule<T>(app));
	}

	constructor(
		private app: IApplication,
		phaser: boolean = true,
	) {
		this.app = app;

		// we dont want to provide AudioContext just as value because we want to wait for it being needed
		this.app.bind<IAudioContextFactory>('audio-context:factory').toFactory((context: interfaces.Context) => {
			if (!context.container.isBound('audio-context')) {
				context.container.bind('audio-context').toConstantValue(new AudioContext());
			}
			return context.container.get('audio-context');
		});

		if (phaser) {
			this.app.bind<IAudioFileLoaderProvider>('audio-loader:provider').toProvider(phaserAudioLoaderProvider);
		} else {
			this.app.bind<IAudioFileLoaderProvider>('audio-loader:provider').toProvider(audioLoaderProvider);
		}

		this.app.bind<AudioBufferRepository>('audio-repository').to(AudioBufferRepository).inSingletonScope();
		this.app.bind<IAudioTrack>('audio-mixer:track:master').to(AudioMixerTrack).inSingletonScope();
		this.app.bind<IAudioTrack>('audio-mixer:track:effects').to(AudioMixerTrack).inSingletonScope();
		this.app.bind<IAudioTrack>('audio-mixer:track:music').to(AudioMixerTrack).inSingletonScope();
		this.app.bind<IAudioTrack>('audio-mixer:track:dialog').to(AudioMixerTrack).inSingletonScope();
		this.app.bind<IAudioMixer>('audio-mixer').to(AudioMixer).inSingletonScope();

		// TODO: this factory returns class figure out how to correctly type this binding
		this.app.bind('audio-manager-plugin:provider').toProvider(phaserAudioManagerPluginProvider);
	}
}
