import { interfaces } from 'inversify';
import { Store } from 'redux';

import { IUIStoreProvider } from 'game-01/src/ui/store.provider';

export type IPhaserGameProvider = (forceNew?: boolean) => Promise<Phaser.Game>;

// singleton
let game: Phaser.Game | null = null;

export function PhaserGameProvider(context: interfaces.Context) {
	const console: Console = context.container.get<Console>('debug:console');
	console.debug('PhaserGameProvider');

	return (forceNew: boolean = false): Promise<Phaser.Game> => {
		const parent = context.container.get<HTMLElement>('phaser:container');
		const storeProvider = context.container.get<IUIStoreProvider>('ui:store');
		console.debug('PhaserGameProvider:provide', parent, storeProvider);

		// preload phaser module that is needed by subsequential modules
		return import('phaser').then(() => Promise.all([
			import('lib/phaser/store.plugin'),
			import('lib/phaser/ui-manager.plugin'),
			import('lib/scene/music.scene'),
		]).then(([{ StorePlugin }, { UIManagerPlugin }, { MusicScene }]) => storeProvider().then((store: Store) => {
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
				autoResize: true,
				backgroundColor,
				pixelArt: true, // => antialias: false, roundPixels: true
				roundPixels: true,
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
					preBoot: (x) => {
						console.log('=== PRE BOOT', x);
					},
					postBoot: (x) => {
						console.log('=== POST BOOT', x);
					},
				},
				loader,
				images: {
					// default: '',
					// missing: '',
				},
				plugins: {
					global: [
						{
							key: 'ui:store',
							plugin: (pluginManager: Phaser.Plugins.PluginManager) => new StorePlugin(pluginManager, store),
							start: true,
						},
						{
							key: 'ui:manager',
							plugin: (pluginManager: Phaser.Plugins.PluginManager) => new UIManagerPlugin(pluginManager, store),
							start: true,
						},
					],
				},
				scene: [
					() => new MusicScene(),
				],
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
		})));
	};
}
