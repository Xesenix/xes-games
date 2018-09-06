import { interfaces } from 'inversify';

export type IPhaserSetupProvider = (game: Phaser.Game) => void;

export function ConfigurePhaserState(context: interfaces.Context) {
	return (game: Phaser.Game): void => {
		// provide app environment
		const environment = context.container.get<any>('environment');
		// provide configuration set by user
		const playerPref = context.container.get<any>('player-pref');

		game.clearBeforeRender = false; // if your game contains full background and doesn't need stage color
		game.scale.fullScreenScaleMode = Phaser.ScaleManager.NO_SCALE; // SHOW_ALL, NO_SCALE, EXACT_FIT, RESIZE
		game.stage.disableVisibilityChange = playerPref.runInBackground || false;
		game.time.advancedTiming = playerPref.debug || false; // for fps counter
		game.time.desiredFps = environment.desiredFps || 30;
	};
}
