import { interfaces } from 'inversify';
import { IApplication } from 'lib/interfaces';
import { Store } from 'redux';

import { AudioBufferRepository } from './audio-buffer-repository';
import { AudioGraph } from './audio-graph';
import { IAudioContextFactory, IAudioFileLoader } from './interfaces';
import { ISoundConfigurationState, soundManagerPluginFactory } from './sound-manager.plugin';

type IAudioFileLoaderProvider = () => Promise<IAudioFileLoader>;

export class SoundModule<T extends ISoundConfigurationState> {
	public static register<T extends ISoundConfigurationState>(app: IApplication) {
		app.bind<SoundModule<T>>('sound:module').toConstantValue(new SoundModule<T>(app));
	}

	constructor(private app: IApplication, phaser: boolean = true) {
		this.app = app;

		// we dont want to provide AudioContext just as value because we want to wait for it being needed
		this.app.bind<IAudioContextFactory>('audio-context:factory').toFactory((context: interfaces.Context) => {
			if (!context.container.isBound('audio-context')) {
				context.container.bind('audio-context').toConstantValue(new AudioContext());
			}
			return context.container.get('audio-context');
		});

		if (phaser) {
			this.app.bind<IAudioFileLoaderProvider>('audio-loader:provider')
				.toProvider((context: interfaces.Context) => () => import('./phaser-audio-loader.service')
					.then(({ PhaserAudioLoaderService }) => {
						if (!context.container.isBound('audio-loader')) {
							context.container.bind<IAudioFileLoader>('audio-loader').to(PhaserAudioLoaderService).inSingletonScope();
						}
						return context.container.get<IAudioFileLoader>('audio-loader');
					}));
		} else {
			this.app.bind<IAudioFileLoaderProvider>('audio-loader:provider')
				.toProvider((context: interfaces.Context) => () => import('./audio-loader.service')
					.then(({ AudioLoaderService }) => {
						if (!context.container.isBound('audio-loader')) {
							context.container.bind<IAudioFileLoader>('audio-loader').to(AudioLoaderService).inSingletonScope();
						}
						return context.container.get<IAudioFileLoader>('audio-loader');
					}));
		}

		this.app.bind<AudioBufferRepository>('audio-repository').to(AudioBufferRepository).inSingletonScope();
		this.app.bind<AudioGraph>('audio-graph').to(AudioGraph).inSingletonScope();

		// TODO: this factory returns class figure out how to correctly type this binding
		this.app.bind('sound-manager-plugin:provider')
			.toProvider((context: interfaces.Context) => () => Promise.all([
				context.container.get<IAudioFileLoaderProvider>('audio-loader:provider')(),
			]).then(([ audioLoader ]) => soundManagerPluginFactory<T>(
				context.container.get<Store<T>>('data-store'),
				context.container.get<IAudioContextFactory>('audio-context:factory'),
				context.container.get<AudioGraph>('audio-graph'),
				context.container.get<AudioBufferRepository>('audio-repository'),
				audioLoader,
			)));
	}
}
