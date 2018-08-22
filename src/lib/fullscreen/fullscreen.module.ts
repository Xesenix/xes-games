import { Store } from 'redux';

import { createSetFullscreenAction } from 'game-01/src/ui';
import { IDataStoreProvider } from 'lib/data-store';
import { IApplication } from 'lib/interfaces';

import { isFullScreen, onFullScreenChange, setFullscreen } from './fullscreen';

export class FullScreenModule {
	public static register(app: IApplication) {
		app.bind<FullScreenModule>('fullscreen:module').toConstantValue(new FullScreenModule(app));
	}

	constructor(
		private app: IApplication,
	) {
		this.app = app;
	}

	public boot = () => {
		return this.app.get<IDataStoreProvider<any, any>>('data-store:provider')().then((store: Store) => {
			onFullScreenChange(() => {
				const { fullscreen } = store.getState();
				const currentFullScreenState = isFullScreen();
				console.log('FullScreenModule:onFullScreenChange', fullscreen, currentFullScreenState);
				if (fullscreen !== currentFullScreenState) {
					store.dispatch(createSetFullscreenAction(currentFullScreenState));
				}
			});
			store.subscribe(() => {
				const { fullscreen } = store.getState();
				const currentFullScreenState = isFullScreen();
				console.log('FullScreenModule:update:store', fullscreen, currentFullScreenState);
				if (fullscreen !== currentFullScreenState) {
					setFullscreen(fullscreen);
				}
			});
		});
	}
}
