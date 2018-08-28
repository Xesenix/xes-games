import { interfaces } from 'inversify';
import { Store } from 'redux';

import { AudioMixer } from './audio-mixer';
import { IAudioBufferRepository, IAudioContextFactory, IAudioFileLoaderProvider, } from './interfaces';
import { ISoundConfigurationState, soundManagerPluginFactory } from './sound-manager.plugin';

export const audioManagerPluginProvider = <T extends ISoundConfigurationState>(context: interfaces.Context) => () => Promise.all([
	context.container.get<IAudioFileLoaderProvider>('audio-loader:provider')(),
]).then(([ audioLoader ]) => soundManagerPluginFactory<T>(
	context.container.get<Store<T>>('data-store'),
	context.container.get<IAudioContextFactory>('audio-context:factory'),
	context.container.get<AudioMixer>('audio-mixer'),
	context.container.get<IAudioBufferRepository>('audio-repository'),
	audioLoader,
));
