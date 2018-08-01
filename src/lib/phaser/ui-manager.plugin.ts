import * as Phaser from 'phaser';
import { Store } from 'redux';

import { IUIState } from 'game-01/src/ui/reducers/index';

export class UIManagerPlugin<T extends IUIState> extends Phaser.Plugins.BasePlugin {
	private unsubscribe: any;

	constructor(
		public pluginManager: Phaser.Plugins.PluginManager,
		public store: Store<T>,
	) {
		super(pluginManager);
		console.log('UIManagerPlugin:constructor');
		this.store = store;
	}

	public start() {
		console.log('UIManagerPlugin:start', this);
		this.unsubscribe = this.store.subscribe(() => {
			const state: T = this.store.getState();
			console.log('>>> UIManagerPlugin:state update', state);
			this.game.sound.mute = state.mute;
			this.game.sound.volume = state.volume;

			if (state.paused) {
				/** that probably should be pause @see https://github.com/photonstorm/phaser3-docs/issues/40 */
				this.game.loop.sleep();
				this.game.sound.mute = true;
			} else {
				this.game.loop.wake();
			}
		});
	}

	public stop() {
		console.log('UIManagerPlugin:stop');
		this.unsubscribe();
	}
}
