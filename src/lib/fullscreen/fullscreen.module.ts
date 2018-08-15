import { Store } from 'redux';

import { createSetFullscreenAction } from 'game-01/src/ui';
import { IStoreProvider } from 'lib/data-store';
import { IApplication } from 'lib/interfaces';

import { isFullScreen, onFullScreenChange, setFullscreen } from './fullscreen';

export class FullScreenModule {
	constructor(
		private app: IApplication,
	) {
		this.app = app;
	}

	public boot = () => {
		return this.app.get<IStoreProvider<any, any>>('data-store-provider')().then((store: Store) => {
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
