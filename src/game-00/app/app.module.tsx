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
import { MOVABLE_CONTROLLABLE_OBJECT, MOVABLE_OBJECT, DESTROY_ON_COLLISION_OBJECT, DESTRUCTIBLE_OBJECT, KILL_ON_COLLISION_OBJECT, SPAWNER_OBJECT } from '../lib/game/sokobana/algorithm';
import GameBoardMovableObject from 'game-00/lib/game/board/movable-object';
import GameBoardObject from 'game-00/lib/game/board/object';
import GameBoardObjectSpawner from 'game-00/lib/game/board/object-spawner';
import { IGameBoardMovableObject, IGameBoardObject } from '../lib/game/board/interface';
import KillOnCollisionSystem from 'game-00/lib/game/system/kill-on-collision';
import DieOnCollisionSystem from 'game-00/lib/game/system/die-on-collision';

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

		const algorithm = new Sokobana();
		const renderer: ReactRenderer = this.get<IRenderer>('ui:renderer');
		// console.log(React);

		const WALL_APPEARANCE = 0;
		const PLAYER_APPEARANCE = 1;
		const ARROW_APPEARANCE = 2;
		const ARROW_CANNON_APPEARANCE = 3;

		const ARROW_TYPE = MOVABLE_OBJECT | DESTROY_ON_COLLISION_OBJECT | KILL_ON_COLLISION_OBJECT;
		const PLAYER_TYPE = MOVABLE_CONTROLLABLE_OBJECT | DESTRUCTIBLE_OBJECT | DESTRUCTIBLE_OBJECT;

		const STATE_ALIVE = 0b01;
		const STATE_DEAD = 0b00;

		const kill = (target: IGameBoardObject) => { target.state = STATE_DEAD };
		const killOnCollisionSystem = new KillOnCollisionSystem(kill);
		const dieOnCollisionSystem = new DieOnCollisionSystem(kill);

		// collision groups

		// TODO: create systems <=======
		let spawnIndex = 1000;

		let board = new Board(15, 10);
		let gameObjects = [
			new GameBoardObjectSpawner((x, y) => new GameBoardMovableObject(spawnIndex++, ARROW_APPEARANCE, ARROW_TYPE, x, y, STATE_ALIVE, { x: 0, y: -3 }), 8, 8),
			new GameBoardObjectSpawner((x, y) => new GameBoardMovableObject(spawnIndex++, ARROW_APPEARANCE, ARROW_TYPE, x, y, STATE_ALIVE, { x: -5, y: 0 }), 13, 4),
			new GameBoardMovableObject(200, PLAYER_APPEARANCE, PLAYER_TYPE, STATE_ALIVE, 4, 5),
			new GameBoardMovableObject(201, PLAYER_APPEARANCE, PLAYER_TYPE, STATE_ALIVE, 6, 8),
			new GameBoardMovableObject(202, PLAYER_APPEARANCE, PLAYER_TYPE, STATE_ALIVE, 1, 1),
			new GameBoardMovableObject(203, PLAYER_APPEARANCE, PLAYER_TYPE, STATE_ALIVE, 9, 8),
			new GameBoardMovableObject(100, ARROW_APPEARANCE, ARROW_TYPE, STATE_ALIVE, 0, 0, { x: 5, y: 0 }),
			new GameBoardMovableObject(101, ARROW_APPEARANCE, ARROW_TYPE, STATE_ALIVE, 8, 3, { x: 0, y: -3 }),
		];

		board.set(0, 1, [ new GameBoardObject(1, WALL_APPEARANCE, 0, 0, 0, 1) ]);
		board.set(0, 2, [ new GameBoardObject(2, WALL_APPEARANCE, 0, 0, 0, 2) ]);
		board.set(0, 3, [ new GameBoardObject(3, WALL_APPEARANCE, 0, 0, 0, 3) ]);
		board.set(4, 1, [ new GameBoardObject(4, WALL_APPEARANCE, 0, 0, 4, 1) ]);
		board.set(4, 2, [ new GameBoardObject(5, WALL_APPEARANCE, 0, 0, 4, 2) ]);
		board.set(4, 3, [ new GameBoardObject(6, WALL_APPEARANCE, 0, 0, 4, 3) ]);
		board.set(4, 8, [ new GameBoardObject(7, WALL_APPEARANCE, 0, 0, 4, 8) ]);
		board.set(5, 8, [ new GameBoardObject(8, WALL_APPEARANCE, 0, 0, 5, 8) ]);
		board.set(6, 7, [ new GameBoardObject(9, WALL_APPEARANCE, 0, 0, 6, 7) ]);
		board.set(8, 8, [ new GameBoardObject(10, ARROW_CANNON_APPEARANCE, SPAWNER_OBJECT, 0, 8, 8) ]);
		board.set(13, 4, [ new GameBoardObject(10, ARROW_CANNON_APPEARANCE, SPAWNER_OBJECT, 0, 13, 4) ]);

		const inputBuffer = [];

		function *resolveCommands() {
			while (true) {
				while (inputBuffer.length === 0) {
					yield;
				}
				console.log('========= CHECK NEXT INPUT', inputBuffer);
				const command = inputBuffer.pop();
				console.log('========= TAKE INPUT', command);

				switch(command) {
					case 'KeyW':
					case 'ArrowUp':
						algorithm.commandMoveUp(gameObjects);
					break;
					case 'KeyS':
					case 'ArrowDown':
						algorithm.commandMoveDown(gameObjects);
					break;
					case 'KeyA':
					case 'ArrowLeft':
						algorithm.commandMoveLeft(gameObjects);
					break;
					case 'KeyD':
					case 'ArrowRight':
						algorithm.commandMoveRight(gameObjects);
					break;
				}
				algorithm.commandAction(gameObjects);

				gameObjects.filter(obj => (obj.type & SPAWNER_OBJECT) === SPAWNER_OBJECT).forEach(obj => obj.update(gameObjects, board));

				while (!algorithm.resolved(gameObjects)) {
					console.log('========= UPDATE');
					algorithm.update(gameObjects, board);
					killOnCollisionSystem.update(gameObjects, board);
					dieOnCollisionSystem.update(gameObjects, board);

					gameObjects = gameObjects.filter((obj) => {
						if (obj.state === STATE_DEAD) {
							board.remove(obj.x, obj.y, obj);
							return false;
						}
						return true;
					});

					updateView();
					yield;
				}
				yield;
			}
		}

		const gen = resolveCommands();

		const resolve = () => {
			const step = gen.next();
			if (!step.done) {
				setTimeout(() => resolve(), 20);
			}
		};

		resolve();

		const updateView = () => {

			gameObjects.forEach((obj) => {
				board.remove(obj.x, obj.y, obj);
				board.add(obj.x, obj.y, obj);
			});
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

		document.addEventListener('keydown', (ev) => {
			console.log('ev', ev, gameObjects);
			inputBuffer.push(ev.code);
		});

		requestAnimationFrame(updateView);
	}
}
