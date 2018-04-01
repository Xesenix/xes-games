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
import { MOVABLE_CONTROLLABLE_OBJECT, MOVABLE_OBJECT, DESTROY_ON_COLLISION_OBJECT, DESTRUCTIBLE_OBJECT, KILL_ON_COLLISION_OBJECT, SPAWNER_OBJECT, STOP_ON_COLLISION_OBJECT } from '../lib/game/sokobana/algorithm';
import GameBoardMovableObject from 'game-00/lib/game/board/movable-object';
import GameBoardObject from 'game-00/lib/game/board/object';
import GameBoardObjectSpawner from 'game-00/lib/game/board/object-spawner';
import { IGameBoardMovableObject, IGameBoardObject, IGameObjectState, IMovableGameObjectState } from '../lib/game/board/interface';
import CollisionSystem from 'game-00/lib/game/system/collision';
import { i18n } from 'xes-webpack-core';
import MapSystem from 'lib/game/system/map';
import { ARROW_APPEARANCE } from 'game-00/lib/game/system/map';
import { ROCK_APPEARANCE } from '../lib/game/system/map';

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

		const kill = (target: IGameBoardObject<IGameObjectState>) => {
			target.state = { ...target.state, alive: false };
		};

		this.bind('on-collision').toConstantValue(
			(source: IGameBoardMovableObject<IMovableGameObjectState>, target: IGameBoardObject<IGameObjectState>, impact: number) => {
				source.state.impact = impact;
				if ((source.type & KILL_ON_COLLISION_OBJECT) == KILL_ON_COLLISION_OBJECT) {
					if (target !== null && (target.type & DESTRUCTIBLE_OBJECT) == DESTRUCTIBLE_OBJECT) {
						// if target is rock only rock can kill it
						if (source.state.appearance === ROCK_APPEARANCE || target.state.appearance !== ROCK_APPEARANCE) {
							kill(target);
						}
					}
				}

				if ((source.type & DESTROY_ON_COLLISION_OBJECT) == DESTROY_ON_COLLISION_OBJECT) {
					kill(source);
				}

				if ((source.type & STOP_ON_COLLISION_OBJECT) == STOP_ON_COLLISION_OBJECT) {
					return true;
				}

				if ((target.type & STOP_ON_COLLISION_OBJECT) == STOP_ON_COLLISION_OBJECT) {
					return true;
				}

				return false;
			}
		);
		this.bind('on-collision-filter').toConstantValue((obj: IGameBoardObject) => true)
		this.bind<CollisionSystem<IGameObjectState>>('collision-system').to(CollisionSystem).inSingletonScope();

		this.bind<Sokobana>('game-engine').to(Sokobana).inSingletonScope();
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

		const algorithm = this.get('game-engine');
		const renderer: ReactRenderer = this.get<IRenderer>('ui:renderer');
		// console.log(React);

		// const killOnCollisionSystem = new KillOnCollisionSystem(kill);
		// const dieOnCollisionSystem = new DieOnCollisionSystem(kill);
		const impactOnCollision = this.get('collision-system')

		// collision groups
		let spawnIndex = 0;

		let board = new Board(12, 9);
		let gameObjects = [];

		const map = new MapSystem(gameObjects, board);
		map.load();

		const inputBuffer = [];

		function *resolveCommands() {
			while (true) {
				while (inputBuffer.length === 0) {
					yield;
				}
				console.group('input')
				console.log('========= CHECK NEXT INPUT', inputBuffer);
				const command = inputBuffer.shift();
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

				console.log('========= SPAWN');
				gameObjects.filter(obj => (obj.type & SPAWNER_OBJECT) === SPAWNER_OBJECT).forEach(obj => obj.update(gameObjects, board));
				gameObjects.forEach((obj) => {
					obj.state.impact = 0;
				})

				while (!algorithm.resolved(gameObjects)) {
					console.group('step')
					console.log('========= UPDATE');
					algorithm.update(gameObjects, board);
					impactOnCollision.update(gameObjects, board);

					// add bodies
					gameObjects.forEach((obj) => {
						if (!obj.state.alive) {
							switch (obj.state.appearance) {
								case ARROW_APPEARANCE:
									map.buildBrokenArrow(obj.state.position.x, obj.state.position.y);
									break;
								case ROCK_APPEARANCE:
									map.buildBrokenRock(obj.state.position.x, obj.state.position.y);
									break;
							}
							return false;
						}
						return true;
					});

					// remove dead
					gameObjects = gameObjects.filter((obj) => {
						if (!obj.state.alive) {
							board.remove(obj.state.position.x, obj.state.position.y, obj);
							return false;
						}
						return true;
					});

					updateView();
					console.groupEnd();
					yield;
				}
				console.groupEnd();
				console.log('========= FINISH');
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
				board.remove(obj.state.position.x, obj.state.position.y, obj);
				board.add(obj.state.position.x, obj.state.position.y, obj);
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
