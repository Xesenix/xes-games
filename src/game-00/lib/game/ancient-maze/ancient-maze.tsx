import GameBoardComponent from 'components/game-board/game-board';
import GameStateConsoleComponent from 'components/game-state-console/game-state-console';
import { Container } from 'inversify';
import { inject } from 'lib/di';
import Algorithm from 'lib/game/ancient-maze/algorithm';
import ArrowSystem from 'lib/game/ancient-maze/system/arrow.system';
import CollectableSystem from 'lib/game/ancient-maze/system/collectable.system';
import DeadBodiesSystem from 'lib/game/ancient-maze/system/dead-bodies.system';
import EndPortalSystem from 'lib/game/ancient-maze/system/end-portal.system';
import RockSystem from 'lib/game/ancient-maze/system/rock.system';
import Board from 'lib/game/board/board';
import { IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';
import CollisionSystem from 'lib/game/system/collision';
import LifespanSystem from 'lib/game/system/lifespan';
import MapSystem, { BROKEN_ARROW_FACTORY, BROKEN_ROCK_FACTORY } from 'lib/game/system/map';
import SpawnSystem from 'lib/game/system/spawn';
import { IRenderer, ReactRenderer } from 'lib/renderer/react-renderer';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import OverlapSystem from 'lib/game/system/overlap';
import ArrowSystem from 'lib/game/ancient-maze/system/arrow-system';
import RockSystem from 'lib/game/ancient-maze/system/rock-system';

export type CommandType = 'up' | 'down' | 'left' | 'right' | undefined;
export interface IAncientMazeState<T> {
	objects: IGameBoardObject<T>[];
	inputBuffer: CommandType[];
	finished: boolean;
	command: CommandType;
	executedCommands: CommandType[];
	collected: { [key: number]: number };
	initialCollectableCount: { [key: number]: number };
	steps: number;
	board: Board<T>;
}

@inject([
	'game-engine',
	'game-state',
	'ui:renderer',
	'collision-system',
	'lifespan-system',
	'arrow-system',
	'rock-system',
	'map-system',
	'dead-bodies-system',
	'collectable-system',
	'spawner-system',
	'exit-system',
	'debug:console'
])
export default class AncientMaze<T> {
	constructor(
		private algorithm: Algorithm, // game-engine
		private state: IAncientMazeState<T>, // game-state
		private renderer: ReactRenderer, // ui:renderer
		private collisionSystem: CollisionSystem<IGameObjectState>, // collision-system
		private lifespanSystem: LifespanSystem, // lifespan-system
		private arrowSystem: ArrowSystem, // arrow-system
		private rockSystem: RockSystem, // rock-system
		private mapSystem: MapSystem, // map-system
		private deadBodiesSystem: DeadBodiesSystem, // dead-bodies-system
		private collectableSystem: CollectableSystem, // collectable-system
		private spawnSystem: SpawnSystem, // spawner-system
		private exitSystem: EndPortalSystem, // exit-system
		private console: Console, // debug:console
	) {	}

	public boot() {
		this.mapSystem.load(this.state);

		const gen = this.gameLoop();

		const resolve = () => {
			const step = gen.next();
			if (step.done) {
				clearInterval(intervalHandle);
			}
		};
		resolve();

		const intervalHandle = setInterval(resolve, 20);

		document.addEventListener('keydown', (ev: KeyboardEvent) => {
			this.console.log('ev', ev, this.state.objects);
			switch (ev.code) {
				case 'KeyW':
				case 'ArrowUp':
					this.state.inputBuffer.push('up');
					break;
				case 'KeyS':
				case 'ArrowDown':
					this.state.inputBuffer.push('down');
					break;
				case 'KeyA':
				case 'ArrowLeft':
					this.state.inputBuffer.push('left');
					break;
				case 'KeyD':
				case 'ArrowRight':
					this.state.inputBuffer.push('right');
					break;
			}
		});

		requestAnimationFrame(this.updateView);
	}

	private *gameLoop() {
		this.collectableSystem.onLevelInit(this.state);

		while (!this.state.finished) {
			while (this.state.inputBuffer.length === 0) {
				yield;
			}

			this.state.command = this.state.inputBuffer.shift();
			this.state.executedCommands.push(this.state.command);

			switch (this.state.command) {
				case 'up':
					this.algorithm.commandMoveUp(this.state);
					break;
				case 'down':
					this.algorithm.commandMoveDown(this.state);
					break;
				case 'left':
					this.algorithm.commandMoveLeft(this.state);
					break;
				case 'right':
					this.algorithm.commandMoveRight(this.state);
					break;
			}

			this.spawnSystem.update(this.state);
			this.algorithm.commandAction(this.state);
			this.state.objects.forEach((obj) => {
				obj.state.impact = 0;
			});
			this.lifespanSystem.update(this.state);

			this.state.steps++;

			while (!this.algorithm.resolved(this.state)) {
				this.algorithm.update(this.state);
				this.collisionSystem.update(this.state);
				this.arrowSystem.update(this.state);

				// switch collected to dead
				this.collectableSystem.update(this.state);

				// add bodies
				this.deadBodiesSystem.update(this.state);

				this.exitSystem.update(this.state);

				requestAnimationFrame(this.updateView);
				yield;
			}
		}
		this.renderer.setOutlet(<div>Victory</div>);
		this.renderer.render();
	}

	private updateView = () => {
		this.state.objects.forEach((obj) => {
			this.state.board.remove(obj.state.position.x, obj.state.position.y, obj);
			this.state.board.add(obj.state.position.x, obj.state.position.y, obj);
		});

		this.renderer.setOutlet(<GameBoardComponent board={ this.state.board }/>);
		this.renderer.setOutlet(<GameStateConsoleComponent state={ this.state }/>, 'console');
		this.renderer.render();
	}
}
