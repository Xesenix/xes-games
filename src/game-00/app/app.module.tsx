import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { EventEmitter } from 'events';
import { Container } from 'inversify';

import GameBoardComponent from 'components/game-board/game-board';
import OutletComponent from 'components/outlet/outlet';
import { DataStoreModule } from 'lib/data-store/data-store.module';
import { FlatDictionary } from 'lib/dictionary/flat-dictionary';
import { IDictionary } from 'lib/dictionary/interfaces';
import { PhaserModule } from 'lib/phaser/phaser.module';
import { IRenderer, ReactRenderer } from 'lib/renderer/react-renderer';
import { ThemeModule } from 'lib/theme/theme.module';
import Board from 'lib/game/board/board';

import { IAppDataState, reducer } from './reducer';
// import { UIStatesModule } from './ui-states.module';

import Sokobana from 'lib/game/sokobana/algorithm';
import { MOVABLE_CONTROLLABLE_OBJECT } from '../lib/game/sokobana/algorithm';
import GameBoardMovableObject from 'game-00/lib/game/board/movable-object';
import GameBoardObject from 'game-00/lib/game/board/object';

/**
 * Main module for application. Defines all dependencies and provides default setup for configuration variables.
 *
 * @export
 * @class AppModule
 * @extends {Container}
 */
export class AppModule extends Container {
	constructor() {
		super();

		// console
		if (process.env.DEBUG) {
			this.bind<Console>('debug:console').toConstantValue(console);
		} else {
			// tslint:disable:no-empty
			const noop = () => {};
			this.bind<Console>('debug:console').toConstantValue({
				assert: noop,
				debug: noop,
				error: noop,
				log: noop,
				trace: noop,
				group: noop,
				groupEnd: noop,
			} as Console);
		}

		// event manager
		this.bind<EventEmitter>('event-manager').toConstantValue(new EventEmitter());

		// phaser
		this.load(ThemeModule());
		this.load(PhaserModule());

		// state management
		// this.load(StateManagerModule());
		// this.load(UIStatesModule());
		// this.load(GameStatesModule());

		// rendering DOM
		this.bind<HTMLElement>('ui:root').toConstantValue(document.getElementById('app') as HTMLElement);
		this.bind<React.Component>('ui:outlet-component').toConstantValue(OutletComponent);
		this.bind<IRenderer>('ui:renderer').to(ReactRenderer).inSingletonScope();

		// setup data store
		this.load(DataStoreModule<IAppDataState>({}, reducer, process.env.DEBUG));

		// environment
		this.bind<IDictionary>('player-pref').toConstantValue(new FlatDictionary({
			debug: process.env.DEBUG,
		}));

		this.bind<IDictionary>('environment').toConstantValue(new FlatDictionary({}));
	}

	public banner() {
		console.log('%c  ★★★ Black Dragon Framework ★★★  ',
			'display: block; line-height: 3rem; border-bottom: 5px double #a02060; font-family: fantasy; font-size: 2rem; color: #f02060; background-color: #000;'
		);
		console.log(`%c  author: ${ process.env.APP.templateData.author.padEnd(37) }\n%c    game: ${ process.env.APP.templateData.title.padEnd(37) }`,
			'line-height: 1.25rem; font-family: Consolas; font-weight: bold; font-size: 1.25rem; color: #a060d0; background-color: #000;',
			'line-height: 1.25rem; font-family: Consolas; font-weight: bold; font-size: 1.25rem; color: #a060d0; background-color: #000; border-bottom: 1px solid #600080;',
		);
	}

	public boot() {
		this.banner();
		// const uiStateManager = this.get<StateManager>('state:state-manager');
		const console = this.get<Console>('debug:console');

		// uiStateManager.boot();

		const renderer: ReactRenderer = this.get<IRenderer>('ui:renderer');
		// console.log(React);

		const PLAYER_APPEARANCE = 2;
		const WALL_APPERANCE = 0;

		let board = new Board(15, 10);
		let gameObjects = [
			new GameBoardMovableObject(1000, PLAYER_APPEARANCE, MOVABLE_CONTROLLABLE_OBJECT, 4, 5),
			new GameBoardMovableObject(1001, PLAYER_APPEARANCE, MOVABLE_CONTROLLABLE_OBJECT, 6, 8),
		];

		board.set(0, 1, [ new GameBoardObject(1, WALL_APPERANCE, 0, 0, 1) ]);
		board.set(0, 2, [ new GameBoardObject(2, WALL_APPERANCE, 0, 0, 2) ]);
		board.set(0, 3, [ new GameBoardObject(3, WALL_APPERANCE, 0, 0, 3) ]);
		board.set(4, 1, [ new GameBoardObject(4, WALL_APPERANCE, 0, 4, 1) ]);
		board.set(4, 2, [ new GameBoardObject(5, WALL_APPERANCE, 0, 4, 2) ]);
		board.set(4, 3, [ new GameBoardObject(6, WALL_APPERANCE, 0, 4, 3) ]);
		board.set(4, 8, [ new GameBoardObject(7, WALL_APPERANCE, 0, 4, 8) ]);
		board.set(5, 8, [ new GameBoardObject(8, WALL_APPERANCE, 0, 5, 8) ]);
		board.set(6, 7, [ new GameBoardObject(9, WALL_APPERANCE, 0, 6, 7) ]);

		let recursion = () => {
			algorithm.move(gameObjects, board);
			// console.log('board', board);
			// console.log('gameObjects', gameObjects);
			// console.time('board')
			// board = board.map((row, y) => row.map(({ v = 0 }, x) => ({ x, y, v: (v + x + y) % 5 })));
			// console.timeEnd('board')
			// console.time('outlet')
			renderer.setOutlet(<GameBoardComponent board={ board }/>);
			// console.timeEnd('outlet')
			// console.time('render');
			renderer.render();
			// console.timeEnd('render');
		};

		requestAnimationFrame(recursion);

		const algorithm = new Sokobana();

		document.addEventListener('keydown', (ev) => {
			console.log('ev', ev, gameObjects);
			switch(ev.code) {
				case 'KeyW':
				case 'ArrowUp':
					gameObjects = algorithm.moveUp(gameObjects, board);
				break;
				case 'KeyS':
				case 'ArrowDown':
					gameObjects = algorithm.moveDown(gameObjects, board);
				break;
				case 'KeyA':
				case 'ArrowLeft':
					gameObjects = algorithm.moveLeft(gameObjects, board);
				break;
				case 'KeyD':
				case 'ArrowRight':
					gameObjects = algorithm.moveRight(gameObjects, board);
				break;
			}
			recursion();
		});
	}
}
