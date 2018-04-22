import { interfaces } from 'inversify';

import { IDictionary } from 'lib/dictionary/interfaces';

import { Game } from './game';
import { IPhaserState } from './state';

let game: Game | null = null;

export type IPhaserProvider = (parent: any) => Promise<Game>;

export function PhaserProvider(context: interfaces.Context) {
	const console: Console = context.container.get<Console>('debug:console');
	console.debug('PhaserProvider');
	return (parent: any, forceNew: boolean = false): Promise<Game> => {
		console.debug('PhaserProvider:provide', parent);

		if (!forceNew && game !== null) {
			console.debug('PhaserProvider:swap parent', game);
			parent.appendChild(game.canvas);
			game.parent = parent;

			return Promise.resolve(game);
		}

		// provide configuration set by user
		const playerPref = context.container.get<IDictionary>('player-pref');

		const antialias = false;
		const disableWebAudio = true;
		const width = 600;
		const height = 480;
		const renderer = playerPref.get('phaser:renderer', Phaser.CANVAS);
		const multiTexture = true;
		const enableDebug = playerPref.get('debug', false);

		window.PhaserGlobal = {
			disableWebAudio, // that bit is important for ram consumption (true == less ram consumption)
		};

		game = new Game({
			antialias,
			width,
			height,
			renderer,// Phaser. AUTO, WEBGL, CANVAS, HEADLESS, WEBGL_MULTI
			parent,
			multiTexture,
			enableDebug,
		});

		try {
			console.debug('PhaserProvider:game', game);
			const states = context.container.get<string[]>('phaser:states');

			for (const key of states) {
				game.state.add(key, context.container.getTagged<IPhaserState>(key, 'engine', 'phaser'));
			}

			return Promise.resolve(game);
		} catch (error) {
			console.debug('PhaserProvider:error', parent, error);
			return Promise.reject(error);
		}
	};
}
