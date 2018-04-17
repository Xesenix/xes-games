import GameBoardComponent from 'components/game-board/game-board';
import GameStateConsoleComponent from 'components/game-state-console/game-state-console';
import { Container } from 'inversify';
import { inject } from 'lib/di';
import Algorithm from 'lib/game/ancient-maze/algorithm';
import CollectableSystem from 'lib/game/ancient-maze/system/collectable';
import DeadBodiesSystem from 'lib/game/ancient-maze/system/dead-bodies';
import EndPortalSystem from 'lib/game/ancient-maze/system/end-portal';
import Board from 'lib/game/board/board';
import { IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';
import CollisionSystem from 'lib/game/system/collision';
import LifespanSystem from 'lib/game/system/lifespan';
import MapSystem, { BROKEN_ARROW_FACTORY, BROKEN_ROCK_FACTORY } from 'lib/game/system/map';
import SpawnSystem from 'lib/game/system/spawn';
import { IRenderer, ReactRenderer } from 'lib/renderer/react-renderer';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { DESTRUCTIBLE_OBJECT_ASPECT,  KILL_ON_OVERLAP_OBJECT_ASPECT } from './aspects';
import OverlapSystem from 'lib/game/system/overlap';
import ArrowSystem from 'lib/game/ancient-maze/system/arrow-system';

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

@inject([
	'game-engine',
	'game-state',
	'ui:renderer',
	'collision-system',
	'lifespan-system',
	'arrow-system',
	'debug:console'
])
export default class AncientMaze {
	constructor(
		private algorithm: Algorithm, // game-engine
		private state: IAncientMazeState, // game-state
		private renderer: ReactRenderer, // ui:renderer
		private collisionSystem: CollisionSystem<IGameObjectState>, // collision-system
		private lifespanSystem: LifespanSystem, // lifespan-system
		private arrowSystem: ArrowSystem, // arrow-system
		private console: Console, // debug:console
	) {	}

	public boot() {
		const state: IAncientMazeState = this.state;
		const renderer: ReactRenderer = this.renderer;
		const algorithm: Algorithm = this.algorithm;
		const collisionSystem: CollisionSystem<IGameObjectState> = this.collisionSystem;
		const lifespanSystem: LifespanSystem = this.lifespanSystem;
		const arrowSystem: ArrowSystem = this.arrowSystem;

		const ARROW_SPAWNER = 0;

		const mapSystem = new MapSystem(state);
		mapSystem.load();

		const spawnSystem: SpawnSystem = new SpawnSystem({
			[ARROW_SPAWNER]: (x: number, y: number, dx: number, dy: number) => [ mapSystem.buildArrow({ x, y }, { x: dx, y: dy }) ],
		});
		const deadBodiesSystem: DeadBodiesSystem = new DeadBodiesSystem(mapSystem);
		const collectableSystem: CollectableSystem = new CollectableSystem();
		const exitSystem: EndPortalSystem = new EndPortalSystem();

		const updateView = () => {
			state.objects.forEach((obj) => {
				state.board.remove(obj.state.position.x, obj.state.position.y, obj);
				state.board.add(obj.state.position.x, obj.state.position.y, obj);
			});

			renderer.setOutlet(<GameBoardComponent board={ state.board }/>);
			renderer.setOutlet(<GameStateConsoleComponent state={ state }/>, 'console');
			renderer.render();
		};

		function *gameLoop() {
			collectableSystem.onLevelInit(state);

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
					arrowSystem.update(state);

					// switch collected to dead
					collectableSystem.update(state);

					// add bodies
					deadBodiesSystem.update(state);

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

		document.addEventListener('keydown', (ev) => {
			this.console.log('ev', ev, state.objects);
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
