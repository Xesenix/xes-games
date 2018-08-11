import { Store } from 'redux';

export const createStorePlugin = (store: Store) =>
class StorePlugin extends Phaser.Plugins.BasePlugin {
	public store: Store = store;
	constructor(
		public pluginManager: Phaser.Plugins.PluginManager,
	) {
		super(pluginManager);
		console.log('StorePlugin:constructor');
	}
	public start() {
		console.log('StorePlugin:start');
	}

	public stop() {
		console.log('StorePlugin:stop');
	}
}
