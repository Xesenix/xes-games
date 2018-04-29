import GameBoardComponent from 'game-00/components/game-board/game-board';
import GameStateConsoleComponent from 'game-00/components/game-state-console/game-state-console';
import { inject } from 'lib/di';
import Algorithm from 'lib/game/ancient-maze/algorithm';
import ArrowSystem from 'lib/game/ancient-maze/system/arrow.system';
import CollectableSystem from 'lib/game/ancient-maze/system/collectable.system';
import DeadBodiesSystem from 'lib/game/ancient-maze/system/dead-bodies.system';
import EndPortalSystem from 'lib/game/ancient-maze/system/end-portal.system';
import RockSystem from 'lib/game/ancient-maze/system/rock.system';
import Board from 'lib/game/board/board';
import { IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';
import CollisionSystem from 'lib/game/system/collision.system';
import LifespanSystem from 'lib/game/system/lifespan.system';
import MapSystem from 'lib/game/system/map.system';
import SpawnSystem from 'lib/game/system/spawn.system';
import { ReactRenderer } from 'lib/renderer/react-renderer';
import cloneDeep from 'lodash.clonedeep';
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { IGameBoard } from 'lib/game/ancient-maze/aspects';

export type CommandType = 'up' | 'down' | 'left' | 'right' | 'back' | undefined;

export interface IAncientMazeGameObjectState extends IGameObjectState {

}

export interface IAncientMazeState<T extends IGameObjectState> {
	objects: IGameBoardObject<T>[];
	inputBuffer: CommandType[];
	finished: boolean;
	command: CommandType;
	executedCommands: CommandType[];
	collected: { [key: string]: number };
	initialCollectableCount: { [key: string]: number };
	steps: number;
	board: IGameBoard<T>;
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
	'debug:console',
])
export default class AncientMaze<T extends IGameObjectState, S extends IAncientMazeState<T>> {
	constructor(
		private algorithm: Algorithm<T, S>, // game-engine
		private state: S, // game-state
		private renderer: ReactRenderer, // ui:renderer
		private collisionSystem: CollisionSystem<T, S>, // collision-system
		private lifespanSystem: LifespanSystem<T, S>, // lifespan-system
		private arrowSystem: ArrowSystem<T, S>, // arrow-system
		private rockSystem: RockSystem<T>, // rock-system
		private mapSystem: MapSystem<T, S>, // map-system
		private deadBodiesSystem: DeadBodiesSystem<T, S>, // dead-bodies-system
		private collectableSystem: CollectableSystem<T, S>, // collectable-system
		private spawnSystem: SpawnSystem<T, S>, // spawner-system
		private exitSystem: EndPortalSystem<T, S>, // exit-system
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
				case 'KeyB':
				case 'Backspace':
					this.state.inputBuffer.push('back');
					break;
			}
		});

		requestAnimationFrame(this.updateView);
	}

	public move() {

	}

	public step(): boolean {
		this.algorithm.update(this.state);
		this.collisionSystem.update(this.state);
		this.arrowSystem.update(this.state);

		// switch collected to dead
		this.collectableSystem.update(this.state);

		// add bodies
		this.deadBodiesSystem.update(this.state);

		this.exitSystem.update(this.state);

		requestAnimationFrame(this.updateView);

		return this.algorithm.resolved(this.state);
	}

	private *gameLoop() {
		this.collectableSystem.onLevelInit(this.state);

		const history: IAncientMazeState<T>[] = [];

		while (true) {
			while (this.state.inputBuffer.length === 0) {
				yield;
			}

			this.state.command = this.state.inputBuffer.shift();

			console.log('=== handling command ===', this.state.command);
			this.state.executedCommands.push(this.state.command);
			this.state.steps++;

			if (this.state.command === 'back') {
				if (history.length > 0) {
					this.state = {
						...(this.state as object),
						...history.pop(),
						// things immune from reverting
						inputBuffer: this.state.inputBuffer,
						command: this.state.command,
						executedCommands: this.state.executedCommands,
						steps: this.state.steps,
					} as S;

					requestAnimationFrame(this.updateView);
					console.log('history', history);
					console.log('reverted state', this.state);
				}
			} else {
				console.log('=== STEP ===');
				history.push(cloneDeep(this.state));
				console.log('history', history);
				console.log('stored state', this.state);

				this.spawnSystem.update(this.state);
				this.algorithm.commandAction(this.state);
				this.lifespanSystem.update(this.state);

				while (!this.step()) {
					yield;
				}
			}
		}
	}

	private updateView = () => {
		if (this.state.finished) {
			this.renderer.setOutlet(<div>Victory</div>);
			this.renderer.setOutlet(<GameStateConsoleComponent state={ this.state }/>, 'console');
			this.renderer.render();
		} else {
			this.state.objects.filter((obj) => obj.state.alive).forEach((obj) => {
				this.state.board.remove(obj.state.position.x, obj.state.position.y, obj);
				this.state.board.add(obj.state.position.x, obj.state.position.y, obj);
			});

			this.renderer.setOutlet(<GameBoardComponent board={ this.state.board }/>);
			this.renderer.setOutlet(<GameStateConsoleComponent state={ this.state }/>, 'console');
			this.renderer.render();
		}
	}
}
