import { interfaces } from 'inversify';
import { IApplication } from 'lib/interfaces';
import { Store } from 'redux';

import { IAudioContextFactory } from './interfaces';
import { ISoundConfigurationState, soundManagerPluginFactory } from './sound-manager.plugin';

export class SoundModule<T extends ISoundConfigurationState> {
	public static register<T extends ISoundConfigurationState>(app: IApplication) {
		app.bind<SoundModule<T>>('sound:module').toConstantValue(new SoundModule<T>(app));
	}

	constructor(private app: IApplication) {
		this.app = app;

		// we dont want to provide AudioContext just as value because we want to wait for it being needed
		this.app.bind<IAudioContextFactory>('audio-context:factory').toFactory((context: interfaces.Context) => {
			const audioContext = new AudioContext();
			return () => audioContext;
		});

		// TODO: this factory returns class figure out how to correctly type this binding
		this.app.bind('sound-manager-plugin:factory')
			.toFactory((context: interfaces.Context) => {
				const store = context.container.get<Store<T>>('data-store');
				const audioContext: AudioContext = context.container.get<IAudioContextFactory>('audio-context:factory')();
				return () => soundManagerPluginFactory<T>(store, audioContext);
			});
	}
}
