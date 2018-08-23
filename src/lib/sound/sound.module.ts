import { interfaces } from 'inversify';
import { IApplication } from 'lib/interfaces';
import { Store } from 'redux';

import { AudioBufferRepository } from './audio-buffer-repository';
import { AudioGraph } from './audio-graph';
import { AudioLoaderService } from './audio-loader.service';
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
			if (!context.container.isBound('audio-context')) {
				context.container.bind('audio-context').toConstantValue(new AudioContext());
			}
			return context.container.get('audio-context');
		});

		this.app.bind<AudioLoaderService>('audio-loader').to(AudioLoaderService).inSingletonScope();

		this.app.bind<AudioBufferRepository>('audio-repository').to(AudioBufferRepository).inSingletonScope();

		this.app.bind<AudioGraph>('audio-graph').to(AudioGraph).inSingletonScope();

		// TODO: this factory returns class figure out how to correctly type this binding
		this.app.bind('sound-manager-plugin:factory')
			.toFactory((context: interfaces.Context) => {
				const store = context.container.get<Store<T>>('data-store');
				const audioContext: AudioContext = context.container.get<IAudioContextFactory>('audio-context:factory');
				const audioGraph: AudioGraph = context.container.get<AudioGraph>('audio-graph');
				const audioLoader: AudioLoaderService = context.container.get<AudioLoaderService>('audio-loader');
				const audioRepository: AudioBufferRepository = context.container.get<AudioBufferRepository>('audio-repository');
				return () => soundManagerPluginFactory<T>(store, audioContext, audioGraph, audioRepository, audioLoader);
			});
	}
}
