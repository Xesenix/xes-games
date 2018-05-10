import { IAncientMazeState } from 'lib/game/ancient-maze/ancient-maze';
import Board from 'lib/game/board/board';
import { IGameObjectState, IMovableGameObjectState } from 'lib/game/board/interface';
import GameBoardObject from 'lib/game/board/object';
import CollisionSystem from 'lib/game/system/collision.system';

import Algorithm from './algorithm';
import { ARROW_TYPE, BOX_TYPE, ObjectFactory, PLAYER_TYPE, ROCK_TYPE } from './object-factory';

type GO = (IGameObjectState | IMovableGameObjectState);

fdescribe('commands', () => {

	describe('up', () => {
		[
			{ posX: 0, posY: 1 },
			{ posX: 2, posY: 3 },
		].forEach(({ posX, posY }) => {
			it('should move (rock, box, player) up if they are adjacent one over each other', () => {
				const collisionSystem = new CollisionSystem<GO, IAncientMazeState<GO>>();
				const algorithm = new Algorithm<GO, IAncientMazeState<GO>>(collisionSystem);
				const objectFactory = new ObjectFactory();
				const state: IAncientMazeState<GO> = {
					objects: [],
					inputBuffer: [],
					finished: false,
					command: 'up', // tested command
					executedCommands: [],
					collected: { },
					initialCollectableCount: { },
					steps: 0,
					board: new Board(5, 5),
				} as IAncientMazeState<GO>;

				// setup board
				let rock: GameBoardObject<GO>;
				let box: GameBoardObject<GO>;
				let player: GameBoardObject<GO>;
				rock = objectFactory.create(ROCK_TYPE, { x: posX, y: posY });
				box = objectFactory.create(BOX_TYPE, { x: posX, y: posY + 1 });
				player = objectFactory.create(PLAYER_TYPE, { x: posX, y: posY + 2 });
				state.objects.push(rock);
				state.objects.push(box);
				state.objects.push(player);

				// start execution
				algorithm.commandAction(state);
				console.log('init', state);
				do {
					state.objects.filter((obj) => obj.state.alive).forEach((obj) => {
						state.board.remove(obj.state.position.x, obj.state.position.y, obj);
						state.board.add(obj.state.position.x, obj.state.position.y, obj);
					});
					algorithm.update(state);
					console.log('update', state);
				} while (!algorithm.resolved(state));

				expect(rock.state.position).toEqual({ x: posX, y: 0 }, 'should move rock');
				expect(box.state.position).toEqual({ x: posX, y: posY }, 'should move box');
				expect(player.state.position).toEqual({ x: posX, y: posY + 1 }, 'should move player');
			});
		});

		[
			{ posX: 1, posY: 1 },
			{ posX: 2, posY: 3 },
		].forEach(({ posX, posY }) => {
			it('should move (box, arrow) if they are entering the same cell', () => {
				const collisionSystem = new CollisionSystem<GO, IAncientMazeState<GO>>();
				const algorithm = new Algorithm<GO, IAncientMazeState<GO>>(collisionSystem);
				const objectFactory = new ObjectFactory();
				const state: IAncientMazeState<GO> = {
					objects: [],
					inputBuffer: [],
					finished: false,
					command: 'up', // tested command
					executedCommands: [],
					collected: { },
					initialCollectableCount: { },
					steps: 0,
					board: new Board(5, 5),
				} as IAncientMazeState<GO>;

				// setup board
				let box: GameBoardObject<GO>;
				let arrow: GameBoardObject<GO>;

				box = objectFactory.create(BOX_TYPE, { x: posX, y: posY + 1 });
				arrow = objectFactory.create(ARROW_TYPE, { x: posX + 1, y: posY }, { x: -1, y: 0 });

				state.objects.push(box);
				state.objects.push(arrow);

				// start execution
				algorithm.commandAction(state);
				console.log('init', state);
				do {
					state.objects.filter((obj) => obj.state.alive).forEach((obj) => {
						state.board.remove(obj.state.position.x, obj.state.position.y, obj);
						state.board.add(obj.state.position.x, obj.state.position.y, obj);
					});
					algorithm.update(state);
					console.log('update', state);
				} while (!algorithm.resolved(state));

				expect(box.state.position).toEqual({ x: posX, y: posY }, 'should move box');
				expect(arrow.state.position).toEqual({ x: posX + 1, y: posY }, 'should move arrow');
				expect(arrow.state.collided).toEqual(true, 'arrow should stop');
			});
		});
	});

	describe('down', () => {
		[
			{ posX: 0, posY: 1 },
			{ posX: 2, posY: 0 },
		].forEach(({ posX, posY }) => {
			it('should move (rock, box, player) up if they are adjacent one over each other', () => {
				const collisionSystem = new CollisionSystem<GO, IAncientMazeState<GO>>();
				const algorithm = new Algorithm<GO, IAncientMazeState<GO>>(collisionSystem);
				const objectFactory = new ObjectFactory();
				const state: IAncientMazeState<GO> = {
					objects: [],
					inputBuffer: [],
					finished: false,
					command: 'down', // tested command
					executedCommands: [],
					collected: { },
					initialCollectableCount: { },
					steps: 0,
					board: new Board(5, 5),
				} as IAncientMazeState<GO>;

				// setup board
				let rock: GameBoardObject<GO>;
				let box: GameBoardObject<GO>;
				let player: GameBoardObject<GO>;
				player = objectFactory.create(PLAYER_TYPE, { x: posX, y: posY });
				box = objectFactory.create(BOX_TYPE, { x: posX, y: posY + 1 });
				rock = objectFactory.create(ROCK_TYPE, { x: posX, y: posY + 2 });
				state.objects.push(rock);
				state.objects.push(box);
				state.objects.push(player);

				// start execution
				algorithm.commandAction(state);
				console.log('init', state);
				do {
					state.objects.filter((obj) => obj.state.alive).forEach((obj) => {
						state.board.remove(obj.state.position.x, obj.state.position.y, obj);
						state.board.add(obj.state.position.x, obj.state.position.y, obj);
					});
					algorithm.update(state);
					console.log('update', state);
				} while (!algorithm.resolved(state));

				expect(rock.state.position).toEqual({ x: posX, y: 4 }, 'should move rock');
				expect(box.state.position).toEqual({ x: posX, y: posY + 2 }, 'should move box');
				expect(player.state.position).toEqual({ x: posX, y: posY + 1 }, 'should move player');
			});
		});

		[
			{ posX: 1, posY: 1 },
			{ posX: 2, posY: 3 },
		].forEach(({ posX, posY }) => {
			it('should move (box, arrow) if they are entering the same cell', () => {
				const collisionSystem = new CollisionSystem<GO, IAncientMazeState<GO>>();
				const algorithm = new Algorithm<GO, IAncientMazeState<GO>>(collisionSystem);
				const objectFactory = new ObjectFactory();
				const state: IAncientMazeState<GO> = {
					objects: [],
					inputBuffer: [],
					finished: false,
					command: 'down', // tested command
					executedCommands: [],
					collected: { },
					initialCollectableCount: { },
					steps: 0,
					board: new Board(5, 5),
				} as IAncientMazeState<GO>;

				// setup board
				let box: GameBoardObject<GO>;
				let arrow: GameBoardObject<GO>;

				box = objectFactory.create(BOX_TYPE, { x: posX, y: posY - 1 });
				arrow = objectFactory.create(ARROW_TYPE, { x: posX + 1, y: posY }, { x: -1, y: 0 });

				state.objects.push(box);
				state.objects.push(arrow);

				// start execution
				algorithm.commandAction(state);
				console.log('init', state);
				do {
					state.objects.filter((obj) => obj.state.alive).forEach((obj) => {
						state.board.remove(obj.state.position.x, obj.state.position.y, obj);
						state.board.add(obj.state.position.x, obj.state.position.y, obj);
					});
					algorithm.update(state);
					console.log('update', state);
				} while (!algorithm.resolved(state));

				expect(box.state.position).toEqual({ x: posX, y: posY }, 'should move box');
				expect(arrow.state.position).toEqual({ x: posX + 1, y: posY }, 'should move arrow');
				expect(arrow.state.collided).toEqual(true, 'arrow should stop');
			});
		});
	});
});
