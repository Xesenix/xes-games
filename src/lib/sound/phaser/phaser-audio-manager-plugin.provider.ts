import { interfaces } from 'inversify';
import { Store } from 'redux';

import { AudioMixer } from '../audio-mixer';
import {
	IAudioBufferRepository,
	IAudioConfigurationState,
	IAudioContextFactory,
	IAudioFileLoaderProvider,
} from '../interfaces';

import { phaserAudioManagerPluginFactory } from './phaser-audio-manager.plugin';

export const phaserAudioManagerPluginProvider = <T extends IAudioConfigurationState>(context: interfaces.Context) => () => Promise.all([
	context.container.get<IAudioFileLoaderProvider>('audio-loader:provider')(),
]).then(([ audioLoader ]) => phaserAudioManagerPluginFactory<T>(
	context.container.get<Store<T>>('data-store'),
	context.container.get<IAudioContextFactory>('audio-context:factory'),
	context.container.get<AudioMixer>('audio-mixer'),
	context.container.get<IAudioBufferRepository>('audio-repository'),
	audioLoader,
));
