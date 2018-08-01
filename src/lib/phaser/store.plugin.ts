import * as Phaser from 'phaser';
import { Store } from 'redux';

export class StorePlugin extends Phaser.Plugins.BasePlugin {
	constructor(
		public pluginManager: Phaser.Plugins.PluginManager,
		public store: Store,
	) {
		super(pluginManager);
		console.log('StorePlugin:constructor');
		this.store = store;
	}
	public start() {
		console.log('StorePlugin:start');
	}

	public stop() {
		console.log('StorePlugin:stop');
	}
}
