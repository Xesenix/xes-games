import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { EventEmitter } from 'events';
import { Container } from 'inversify';

import GameBoardComponent from 'components/game-board/game-board';
import OutletComponent from 'components/outlet/outlet';
import { FlatDictionary } from 'lib/dictionary/flat-dictionary';
import { IDictionary } from 'lib/dictionary/interfaces';
import Board from 'lib/game/board/board';
import { IGameBoardObject, IGameObjectState, IMovableGameObjectState } from 'lib/game/board/interface';
import Sokobana from 'lib/game/sokobana/algorithm';
import {
	ACTOR_ASPECT,
	COLLECTABLE_ASPECT,
	COLLECTOR_ASPECT,
	DESTROY_OBJECT_ON_COLLISION_ASPECT,
	DESTRUCTIBLE_OBJECT_ASPECT,
	EXIT_ASPECT,
	KILL_ON_COLLISION_OBJECT_ASPECT,
} from 'lib/game/sokobana/aspects';
import CollisionSystem from 'lib/game/system/collision';
import LifespanSystem from 'lib/game/system/lifespan';
import MapSystem, { BROKEN_ARROW_FACTORY, BROKEN_ROCK_FACTORY, ROCK_APPEARANCE } from 'lib/game/system/map';
import OverlapSystem from 'lib/game/system/overlap';
import ReplaceDeadWithBodySystem from 'lib/game/system/replace-dead-with-body';
import SpawnSystem from 'lib/game/system/spawn';
import { __ } from 'lib/localize';
import { PhaserModule } from 'lib/phaser/phaser.module';
import { IRenderer, ReactRenderer } from 'lib/renderer/react-renderer';
import { ThemeModule } from 'lib/theme/theme.module';

// import { IAppDataState, reducer } from './reducer';

declare const process: any;

/**
 * Main module for application. Defines all dependencies and provides default setup for configuration variables.
 *
 * @export
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
		// this.load(DataStoreModule<IAppDataState>({}, reducer, process.env.DEBUG));

		// environment
		this.bind<IDictionary>('player-pref').toConstantValue(new FlatDictionary({
			debug: process.env.DEBUG,
		}));

		this.bind<IDictionary>('environment').toConstantValue(new FlatDictionary({}));

		const kill = (target: IGameBoardObject<IGameObjectState>) => {
			target.state = { ...target.state, alive: false };
		};

		this.bind('kill').toConstantValue(kill);

		this.bind('on-collision').toConstantValue(
			(source: IGameBoardObject<IMovableGameObjectState>, target: IGameBoardObject<IGameObjectState>, impact: number) => {
				console.log('== collision', source, target);
				source.state.impact = impact;
				if ((source.type & KILL_ON_COLLISION_OBJECT_ASPECT) === KILL_ON_COLLISION_OBJECT_ASPECT) {
					if (target !== null && (target.type & DESTRUCTIBLE_OBJECT_ASPECT) === DESTRUCTIBLE_OBJECT_ASPECT) {
						// if target is rock only rock can kill it
						if (source.state.appearance === ROCK_APPEARANCE || target.state.appearance !== ROCK_APPEARANCE) {
							kill(target);
						}
					}
				}

				if ((source.type & DESTROY_OBJECT_ON_COLLISION_ASPECT) === DESTROY_OBJECT_ON_COLLISION_ASPECT) {
					kill(source);
				}
			},
		);
		this.bind('on-overlap').toConstantValue(
			(source: IGameBoardObject<IMovableGameObjectState>, target: IGameBoardObject<IGameObjectState>) => {
			},
		);
		this.bind('on-collision-filter').toConstantValue((obj: IGameBoardObject) => true);
		this.bind<CollisionSystem<IGameObjectState>>('collision-system').to(CollisionSystem).inSingletonScope();
		this.bind<LifespanSystem>('lifespan-system').to(LifespanSystem).inSingletonScope();

		this.bind<Sokobana>('game-engine').to(Sokobana).inSingletonScope();
	}

	public banner() {
		// tslint:disable:max-line-length
		console.log('%c  ★★★ Black Dragon Framework ★★★  ',
			'display: block; line-height: 3rem; border-bottom: 5px double #a02060; font-family: fantasy; font-size: 2rem; color: #f02060; background-color: #000;',
		);
		console.log(`%c  author: ${ process.env.APP.templateData.author.padEnd(37) }\n%c    game: ${ process.env.APP.templateData.title.padEnd(37) }`,
			'line-height: 1.25rem; font-family: Consolas; font-weight: bold; font-size: 1.25rem; color: #a060d0; background-color: #000;',
			'line-height: 1.25rem; font-family: Consolas; font-weight: bold; font-size: 1.25rem; color: #a060d0; background-color: #000; border-bottom: 1px solid #600080;',
		);
	}

	public boot() {
		const ARROW_SPAWNER = 0;

		this.banner();

		const console = this.get<Console>('debug:console');
		const algorithm = this.get<Sokobana>('game-engine');
		const renderer: ReactRenderer = this.get<IRenderer>('ui:renderer');

		const board = new Board(12, 9);
		let gameObjects: IGameBoardObject[] = [];
		const map = new MapSystem(gameObjects, board);
		map.load();
		const collisionSystem = this.get<CollisionSystem<IGameObjectState>>('collision-system');
		const lifespanSystem = this.get<LifespanSystem>('lifespan-system');

		const spawnSystem = new SpawnSystem({
			[ARROW_SPAWNER]: (x: number, y: number, dx: number, dy: number) => [ map.buildArrow({ x, y }, { x: dx, y: dy }) ],
		});
		const bodiesSystem = new ReplaceDeadWithBodySystem({
			[BROKEN_ARROW_FACTORY]: (x: number, y: number, dx: number, dy: number) => [ map.buildBrokenArrow({ x, y }, { x: dx, y: dy }) ],
			[BROKEN_ROCK_FACTORY]: (x: number, y: number, dx: number, dy: number) => [ map.buildBrokenRock({ x, y }, { x: dx, y: dy }) ],
		});

		const collectableSystem = new OverlapSystem(COLLECTABLE_ASPECT, COLLECTOR_ASPECT, (visitable: IGameBoardObject, visitor: IGameBoardObject) => {
			if (visitable.state.alive) {
				collected[visitable.state.collectableId] ++;
				visitable.state.alive = false;
			}
		});

		const exitSystem = new OverlapSystem(EXIT_ASPECT, ACTOR_ASPECT, (visitable: IGameBoardObject, visitor: IGameBoardObject) => {
			finished = collected[visitable.state.keyItemId] === initialCollectableCount[visitable.state.keyItemId];
		});

		type CommandType = 'up' | 'down' | 'left' | 'right' | undefined;

		const inputBuffer: CommandType[] = [];
		let finished = false;
		let command: CommandType;
		const collected = { 0: 0 };
		const initialCollectableCount = { 0: 0 };
		let steps = 0;

		function *resolveCommands() {
			gameObjects.forEach((obj) => {
				if ((obj.type & COLLECTABLE_ASPECT) === COLLECTABLE_ASPECT) {
					initialCollectableCount[obj.state.collectableId] ++;
				}
			});

			while (!finished) {
				while (inputBuffer.length === 0) {
					yield;
				}

				command = inputBuffer.shift();

				switch (command) {
					case 'up':
						algorithm.commandMoveUp(gameObjects);
						break;
					case 'down':
						algorithm.commandMoveDown(gameObjects);
						break;
					case 'left':
						algorithm.commandMoveLeft(gameObjects);
						break;
					case 'right':
						algorithm.commandMoveRight(gameObjects);
						break;
				}

				spawnSystem.update(gameObjects, board);
				algorithm.commandAction(gameObjects);
				gameObjects.forEach((obj) => {
					obj.state.impact = 0;
				});
				lifespanSystem.update(gameObjects, board);

				steps++;

				while (!algorithm.resolved(gameObjects)) {
					algorithm.update(gameObjects, board);
					collisionSystem.update(gameObjects, board);

					// add bodies
					bodiesSystem.update(gameObjects, board);

					collectableSystem.update(gameObjects, board);

					// remove dead
					gameObjects = gameObjects.filter((obj) => {
						if (!obj.state.alive) {
							board.remove(obj.state.position.x, obj.state.position.y, obj);
							return false;
						}
						return true;
					});
					map.objects = gameObjects;

					exitSystem.update(gameObjects, board);

					requestAnimationFrame(updateView);
					yield;
				}
			}
			renderer.setOutlet(<div>Victory</div>);
			renderer.render();
		}

		const gen = resolveCommands();

		const resolve = () => {
			const step = gen.next();
			if (step.done) {
				clearInterval(intervalHandle);
			}
		};
		resolve();

		const intervalHandle = setInterval(resolve, 20);

		const updateView = () => {
			gameObjects.forEach((obj) => {
				// console.log('updateView', obj)
				board.remove(obj.state.position.x, obj.state.position.y, obj);
				board.add(obj.state.position.x, obj.state.position.y, obj);
			});

			renderer.setOutlet(<GameBoardComponent board={ board }/>);
			renderer.setOutlet((<div style={ { backgroundColor: '#000', padding: '1rem' } }>
				{ __('Command') }: { command }<br/>
				{ __('Keys') }: { collected[0] } / { initialCollectableCount[0] }<br/>
				{ __('Steps') }: { steps }<br/>
			</div>), 'console');
			renderer.render();
		};

		document.addEventListener('keydown', (ev) => {
			console.log('ev', ev, gameObjects);
			switch (ev.code) {
				case 'KeyW':
				case 'ArrowUp':
					inputBuffer.push('up');
					break;
				case 'KeyS':
				case 'ArrowDown':
					inputBuffer.push('down');
					break;
				case 'KeyA':
				case 'ArrowLeft':
					inputBuffer.push('left');
					break;
				case 'KeyD':
				case 'ArrowRight':
					inputBuffer.push('right');
					break;
			}
		});

		requestAnimationFrame(updateView);
	}
}
