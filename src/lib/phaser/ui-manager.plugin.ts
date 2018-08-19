import { Store } from 'redux';

export interface IUIState {
	mute: boolean;
	musicMuted: boolean;
	effectsMuted: boolean;
	paused: boolean;
	effectsVolume: number;
	musicVolume: number;
	volume: number;
}

export const createUIManagerPlugin = <T extends IUIState>(store: Store) =>
class UIManagerPlugin extends Phaser.Plugins.BasePlugin {
	public store: Store<T> = store;
	private unsubscribe: any;

	constructor(
		public pluginManager: Phaser.Plugins.PluginManager,
	) {
		super(pluginManager);
		console.log('UIManagerPlugin:constructor');
	}

	public start() {
		console.log('UIManagerPlugin:start', this);
		this.unsubscribe = this.store.subscribe(this.syncGameWithUIState);
		this.syncGameWithUIState();
	}

	public stop() {
		console.log('UIManagerPlugin:stop');
		this.unsubscribe();
	}

	private syncGameWithUIState = () => {
		const state: T = this.store.getState();
		console.log('UIManagerPlugin:syncGameWithUIState', state);
		this.game.sound.mute = state.mute;
		this.game.sound.volume = state.volume;

		if (state.paused) {
			/** that probably should be pause @see https://github.com/photonstorm/phaser3-docs/issues/40 */
			this.game.loop.sleep();
			this.game.sound.mute = true;
		} else {
			this.game.loop.wake();
		}
	}
};
