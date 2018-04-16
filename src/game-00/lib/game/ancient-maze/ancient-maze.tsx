import GameBoardComponent from 'components/game-board/game-board';
import GameStateConsoleComponent from 'components/game-state-console/game-state-console';
import { Container } from 'inversify';
import Algorithm from 'lib/game/ancient-maze/algorithm';
import Board from 'lib/game/board/board';
import { IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';
import CollisionSystem from 'lib/game/system/collision';
import LifespanSystem from 'lib/game/system/lifespan';
import MapSystem, { BROKEN_ARROW_FACTORY, BROKEN_ROCK_FACTORY } from 'lib/game/system/map';
import OverlapSystem from 'lib/game/system/overlap';
import ReplaceDeadWithBodySystem from 'lib/game/system/replace-dead-with-body';
import SpawnSystem from 'lib/game/system/spawn';
import { IRenderer, ReactRenderer } from 'lib/renderer/react-renderer';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { ACTOR_ASPECT, COLLECTABLE_ASPECT, COLLECTOR_ASPECT, EXIT_ASPECT } from './aspects';

export type CommandType = 'up' | 'down' | 'left' | 'right' | undefined;
export interface IAncientMazeState {
	objects: IGameBoardObject[];
	inputBuffer: CommandType[];
	finished: boolean;
	command: CommandType;
	executedCommands: CommandType[];
	collected: { [key: number]: number };
	initialCollectableCount: { [key: number]: number };
	steps: number;
	board: Board;
}

export default class AncientMaze {
	constructor(
		private app: Container,
	) {	}

	public boot() {
		const state: IAncientMazeState = {
			objects: [],
			inputBuffer: [],
			finished: false,
			command: undefined,
			executedCommands: [],
			collected: { 0: 0 },
			initialCollectableCount: { 0: 0 },
			steps: 0,
			board: new Board(12, 9),
		};

		const ARROW_SPAWNER = 0;

		const console: Console = this.app.get<Console>('debug:console');
		const algorithm: Algorithm = this.app.get<Algorithm>('game-engine');
		const renderer: ReactRenderer = this.app.get<IRenderer>('ui:renderer');

		const mapSystem = new MapSystem(state);
		mapSystem.load();
		const collisionSystem: CollisionSystem<IGameObjectState> = this.app.get<CollisionSystem<IGameObjectState>>('collision-system');
		const lifespanSystem: LifespanSystem = this.app.get<LifespanSystem>('lifespan-system');

		const spawnSystem: SpawnSystem = new SpawnSystem({
			[ARROW_SPAWNER]: (x: number, y: number, dx: number, dy: number) => [ mapSystem.buildArrow({ x, y }, { x: dx, y: dy }) ],
		});
		const bodiesSystem: ReplaceDeadWithBodySystem = new ReplaceDeadWithBodySystem({
			[BROKEN_ARROW_FACTORY]: (x: number, y: number, dx: number, dy: number) => [ mapSystem.buildBrokenArrow({ x, y }, { x: dx, y: dy }) ],
			[BROKEN_ROCK_FACTORY]: (x: number, y: number, dx: number, dy: number) => [ mapSystem.buildBrokenRock({ x, y }, { x: dx, y: dy }) ],
		});

		const collectableSystem: OverlapSystem = new OverlapSystem(COLLECTABLE_ASPECT, COLLECTOR_ASPECT, (visitable: IGameBoardObject, visitor: IGameBoardObject) => {
			if (visitable.state.alive) {
				state.collected[visitable.state.collectableId] ++;
				visitable.state.alive = false;
			}
		});

		const exitSystem: OverlapSystem = new OverlapSystem(EXIT_ASPECT, ACTOR_ASPECT, (visitable: IGameBoardObject, visitor: IGameBoardObject) => {
			state.finished = state.collected[visitable.state.keyItemId] === state.initialCollectableCount[visitable.state.keyItemId];
		});

		function *gameLoop() {
			state.objects.forEach((obj) => {
				if ((obj.type & COLLECTABLE_ASPECT) === COLLECTABLE_ASPECT) {
					state.initialCollectableCount[obj.state.collectableId] ++;
				}
			});

			while (!state.finished) {
				while (state.inputBuffer.length === 0) {
					yield;
				}

				state.command = state.inputBuffer.shift();
				state.executedCommands.push(state.command);

				switch (state.command) {
					case 'up':
						algorithm.commandMoveUp(state);
						break;
					case 'down':
						algorithm.commandMoveDown(state);
						break;
					case 'left':
						algorithm.commandMoveLeft(state);
						break;
					case 'right':
						algorithm.commandMoveRight(state);
						break;
				}

				spawnSystem.update(state);
				algorithm.commandAction(state);
				state.objects.forEach((obj) => {
					obj.state.impact = 0;
				});
				lifespanSystem.update(state);

				state.steps++;

				while (!algorithm.resolved(state)) {
					algorithm.update(state);
					collisionSystem.update(state);

					// add bodies
					bodiesSystem.update(state);

					collectableSystem.update(state);

					// remove dead
					state.objects = state.objects.filter((obj) => {
						if (!obj.state.alive) {
							state.board.remove(obj.state.position.x, obj.state.position.y, obj);
							return false;
						}
						return true;
					});

					exitSystem.update(state);

					requestAnimationFrame(updateView);
					yield;
				}
			}
			renderer.setOutlet(<div>Victory</div>);
			renderer.render();
		}

		const gen = gameLoop();

		const resolve = () => {
			const step = gen.next();
			if (step.done) {
				clearInterval(intervalHandle);
			}
		};
		resolve();

		const intervalHandle = setInterval(resolve, 20);

		const updateView = () => {
			state.objects.forEach((obj) => {
				state.board.remove(obj.state.position.x, obj.state.position.y, obj);
				state.board.add(obj.state.position.x, obj.state.position.y, obj);
			});

			renderer.setOutlet(<GameBoardComponent board={ state.board }/>);
			renderer.setOutlet(<GameStateConsoleComponent state={ state }/>, 'console');
			renderer.render();
		};

		document.addEventListener('keydown', (ev) => {
			console.log('ev', ev, state.objects);
			switch (ev.code) {
				case 'KeyW':
				case 'ArrowUp':
					state.inputBuffer.push('up');
					break;
				case 'KeyS':
				case 'ArrowDown':
					state.inputBuffer.push('down');
					break;
				case 'KeyA':
				case 'ArrowLeft':
					state.inputBuffer.push('left');
					break;
				case 'KeyD':
				case 'ArrowRight':
					state.inputBuffer.push('right');
					break;
			}
		});

		requestAnimationFrame(updateView);
	}
}
