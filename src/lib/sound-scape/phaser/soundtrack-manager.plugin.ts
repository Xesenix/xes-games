import { ISoundtrackPlayer } from '../interfaces';

export const phaserSoundtrackManagerPluginFactory = (
	soundtrackPlayer: ISoundtrackPlayer,
) => class PhaserSoundtrackManagerPlugin extends Phaser.Plugins.BasePlugin {
	public soundtrackPlayer: ISoundtrackPlayer = soundtrackPlayer;

	constructor(
		public pluginManager: Phaser.Plugins.PluginManager,
	) {
		super(pluginManager);
		console.log('PhaserSoundtrackManagerPlugin:constructor');
	}

	public start(): void {
		console.log('PhaserSoundtrackManagerPlugin:start', this);
	}

	public stop() {
		console.log('PhaserSoundtrackManagerPlugin:stop');
	}
};
