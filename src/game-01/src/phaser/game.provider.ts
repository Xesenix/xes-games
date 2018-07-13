import { interfaces } from 'inversify';

import MusicScene from 'lib/scene/music.scene';

export type IPhaserGameProvider = (forceNew?: boolean) => Promise<Phaser.Game>;

// singleton
let game: Phaser.Game | null = null;

export function PhaserGameProvider(context: interfaces.Context) {
	const console: Console = context.container.get<Console>('debug:console');
	console.debug('PhaserGameProvider');

	return (forceNew: boolean = false): Promise<Phaser.Game> => {
		const parent = context.container.get<HTMLElement>('phaser:container');
		console.debug('PhaserGameProvider:provide', parent);

		if (!forceNew && game !== null) {
			console.debug('PhaserGameProvider:swap parent', game);
			parent.appendChild(game.canvas);

			return Promise.resolve(game);
		}

		const backgroundColor = 0x000000;

		/** @see https://github.com/photonstorm/phaser/blob/master/src/boot/Config.js */
		const fps: FPSConfig = {
			min: 10,
			target: 30,
			forceSetTimeOut: false,
			deltaHistory: 10,
			panicMax: 120,
		};

		const loader: LoaderConfig = {
		};

		const render: RendererConfig = {
			resolution: 1,
			antialias: false,
			pixelArt: true,
			autoResize: false,
			roundPixels: false,
			transparent: false,
			clearBeforeRender: false,
			premultipliedAlpha: true,
			preserveDrawingBuffer: false,
			failIfMajorPerformanceCaveat: false,
			powerPreference: 'default', // 'high-performance', 'low-power' or 'default'
		};

		const config: GameConfig = {
			width: 800,
			height: 600,
			type: Phaser.CANVAS, // AUTO, CANVAS, WEBGL, HEADLESS
			parent,
			disableContextMenu: true,
			fps,
			render,
			backgroundColor,
			callbacks: {
				preBoot: () => console.log('=== PRE BOOT'),
				postBoot: () => console.log('=== POST BOOT'),
			},
			loader,
			images: {
				// default: '',
				// missing: '',
			},
			scene: [ MusicScene ],
		};

		game = new Phaser.Game(config);

		try {
			console.debug('PhaserGameProvider:game', game);
			/*const states = context.container.get<string[]>('phaser:states');

			for (const key of states) {
				game.scene.add(key, context.container.getTagged<IPhaserState>(key, 'engine', 'phaser'));
			}*/

			return Promise.resolve(game);
		} catch (error) {
			console.debug('PhaserGameProvider:error', parent, error);
			return Promise.reject(error);
		}
	};
}
