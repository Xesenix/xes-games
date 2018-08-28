import { interfaces } from 'inversify';

import { IAudioFileLoader } from './interfaces';

export const phaserAudioLoaderProvider = (context: interfaces.Context) => () => import('./phaser-audio-loader.service')
.then(({ PhaserAudioLoaderService }) => {
	if (!context.container.isBound('audio-loader')) {
		context.container.bind<IAudioFileLoader>('audio-loader').to(PhaserAudioLoaderService).inSingletonScope();
	}
	return context.container.get<IAudioFileLoader>('audio-loader');
});
