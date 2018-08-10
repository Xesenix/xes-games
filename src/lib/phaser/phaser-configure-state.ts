import { interfaces } from 'inversify';

import { IDictionary } from 'lib/dictionary/interfaces';

export type IPhaserSetupProvider = (game: Phaser.Game) => void;

export function ConfigurePhaserState(context: interfaces.Context) {
	return (game: Phaser.Game): void => {
		// provide app environment
		const environment = context.container.get<IDictionary>('environment');
		// provide configuration set by user
		const playerPref = context.container.get<IDictionary>('player-pref');

		game.clearBeforeRender = false; // if your game contains full background and doesn't need stage color
		game.scale.fullScreenScaleMode = Phaser.ScaleManager.NO_SCALE; // SHOW_ALL, NO_SCALE, EXACT_FIT, RESIZE
		game.stage.disableVisibilityChange = playerPref.get('runInBackground', false);
		game.time.advancedTiming = playerPref.get('debug', false); // for fps counter
		game.time.desiredFps = environment.get<number>('desiredFps', 30);
	};
}
