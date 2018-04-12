import GameBoardComponent from 'components/game-board/game-board';
import { Container } from 'inversify';
import Board from 'lib/game/board/board';
import { IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';
import Sokobana from 'lib/game/sokobana/algorithm';
import { COLLECTABLE_ASPECT, COLLECTOR_ASPECT, EXIT_ASPECT, ACTOR_ASPECT } from 'lib/game/sokobana/aspects';
import CollisionSystem from 'lib/game/system/collision';
import LifespanSystem from 'lib/game/system/lifespan';
import MapSystem, { BROKEN_ARROW_FACTORY, BROKEN_ROCK_FACTORY } from 'lib/game/system/map';
import OverlapSystem from 'lib/game/system/overlap';
import ReplaceDeadWithBodySystem from 'lib/game/system/replace-dead-with-body';
import SpawnSystem from 'lib/game/system/spawn';
import { IRenderer, ReactRenderer } from 'lib/renderer/react-renderer';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

export class SokobanaModule {
	constructor(
		private module: Container,
	) {	}

	public boot() {
		const ARROW_SPAWNER = 0;

		const console = this.module.get<Console>('debug:console');
		const algorithm = this.module.get<Sokobana>('game-engine');
		const renderer: ReactRenderer = this.module.get<IRenderer>('ui:renderer');

		const board = new Board(12, 9);
		let gameObjects: IGameBoardObject[] = [];
		const map = new MapSystem(gameObjects, board);
		map.load();
		const collisionSystem = this.module.get<CollisionSystem<IGameObjectState>>('collision-system');
		const lifespanSystem = this.module.get<LifespanSystem>('lifespan-system');

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
