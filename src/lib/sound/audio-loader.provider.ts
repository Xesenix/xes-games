import { interfaces } from 'inversify';

import { IAudioFileLoader } from './interfaces';

export const audioLoaderProvider = (context: interfaces.Context) => () => import('./audio-loader.service')
.then(({ AudioLoaderService }) => {
	if (!context.container.isBound('audio-loader')) {
		context.container.bind<IAudioFileLoader>('audio-loader').to(AudioLoaderService).inSingletonScope();
	}
	return context.container.get<IAudioFileLoader>('audio-loader');
});
