import { Container } from 'inversify';
import { IAncientMazeState, CommandType } from 'lib/game/ancient-maze/ancient-maze';
import Board from 'lib/game/board/board';
import { IGameObjectState, IMovableGameObjectState } from 'lib/game/board/interface';
import GameBoardObject from 'lib/game/board/object';
import CollisionSystem from 'lib/game/system/collision.system';

import { ARROW_TYPE, BOX_TYPE, ObjectFactory, PLAYER_TYPE, ROCK_TYPE } from '../object-factory';
import MovementSystem from './movement.system';

type GO = (IGameObjectState | IMovableGameObjectState);

const resolveState = (di: Container, state: IAncientMazeState<GO>) => {
	const movementSystem: MovementSystem<GO, IAncientMazeState<GO>> = di.get('movement-system');
	movementSystem.commandAction(state);
	do {
		state.objects.filter((obj) => obj.state.alive).forEach((obj) => {
			state.board.remove(obj.state.position.x, obj.state.position.y, obj);
			state.board.add(obj.state.position.x, obj.state.position.y, obj);
		});
		movementSystem.update(state);
	} while (!movementSystem.resolved(state));
};

describe('commands', () => {
	let di: Container;

	beforeEach(() => {
		di = new Container();
		di.bind<CollisionSystem<GO, IAncientMazeState<GO>>>('collision-system').to(CollisionSystem).inSingletonScope();
		di.bind<MovementSystem<GO, IAncientMazeState<GO>>>('movement-system').to(MovementSystem).inSingletonScope();
		di.bind<IAncientMazeState<GO>>('state').toConstantValue({
			objects: [],
			inputBuffer: [],
			finished: false,
			command: undefined, // tested command
			executedCommands: [],
			collected: { },
			initialCollectableCount: { },
			steps: 0,
			board: new Board(5, 5),
		} as IAncientMazeState<GO>);
	});

	describe('should move (box, arrow) if they are entering the same cell', () => {
		[
			{ command: 'down', pos: { x: 2, y: 2 }, direction: { x: 0, y: -1 } },
			{ command: 'up', pos: { x: 2, y: 2 }, direction: { x: 0, y: 1 } },
			{ command: 'left', pos: { x: 2, y: 2 }, direction: { x: 1, y: 0 } },
			{ command: 'right', pos: { x: 2, y: 2 }, direction: { x: -1, y: 0 } },
		].forEach(({ command, pos, direction }) => {
			it(`move box: ${command}, arrow (${pos.x + direction.y}, ${pos.y + direction.x}) -> (${pos.x}, ${pos.y})`, () => {
				const objectFactory = new ObjectFactory();
				const state: IAncientMazeState<GO> = di.get('state');
				state.command = command as CommandType;

				// setup board
				const box: GameBoardObject<GO> = objectFactory.create(
					BOX_TYPE, {
						x: pos.x + direction.x,
						y: pos.y + direction.y,
					});
				const arrow: GameBoardObject<GO> = objectFactory.create(
					ARROW_TYPE, {
						x: pos.x + direction.y,
						y: pos.y + direction.x,
					}, {
						x: -direction.y,
						y: -direction.x,
					});

				state.objects.push(box);
				state.objects.push(arrow);

				// start execution
				resolveState(di, state);

				expect(box.state.position).toEqual({ x: pos.x, y: pos.y }, 'should move box');
				expect(arrow.state.position).toEqual({ x: pos.x + direction.y, y: pos.y + direction.x }, 'should move arrow');
				expect(arrow.state.collided).toEqual(true, 'arrow should stop');
			});

			it(`move box: ${command}, arrow (${pos.x - direction.y}, ${pos.y - direction.x}) -> (${pos.x}, ${pos.y}) ${direction.x},${direction.y}`, () => {
				const objectFactory = new ObjectFactory();
				const state: IAncientMazeState<GO> = di.get('state');
				state.command = command as CommandType;

				// setup board
				const box: GameBoardObject<GO> = objectFactory.create(
					BOX_TYPE, {
						x: pos.x + direction.x,
						y: pos.y + direction.y,
					});
				const arrow: GameBoardObject<GO> = objectFactory.create(
					ARROW_TYPE, {
						x: pos.x - direction.y,
						y: pos.y - direction.x,
					}, {
						x: direction.y,
						y: direction.x,
					});

				state.objects.push(box);
				state.objects.push(arrow);

				// start execution
				resolveState(di, state);

				expect(box.state.position).toEqual({ x: pos.x, y: pos.y }, 'should move box');
				expect(arrow.state.position).toEqual({ x: pos.x - direction.y, y: pos.y - direction.x }, 'should move arrow');
				expect(arrow.state.collided).toEqual(true, 'arrow should stop');
			});
		});
	});

	describe('should move (rock, box, player) if they are adjacent to each other', () => {
		[
			{ command: 'down', pos: { x: 0, y: 2 }, direction: { x: 0, y: 1 }, expected: { player: { x: 0, y: 2 }, box: { x: 0, y: 3 }, rock: { x: 0, y: 4 } } },
			{ command: 'down', pos: { x: 0, y: 1 }, direction: { x: 0, y: 1 }, expected: { player: { x: 0, y: 2 }, box: { x: 0, y: 3 }, rock: { x: 0, y: 4 } } },
			{ command: 'down', pos: { x: 1, y: 0 }, direction: { x: 0, y: 1 }, expected: { player: { x: 1, y: 1 }, box: { x: 1, y: 2 }, rock: { x: 1, y: 4 } } },
			{ command: 'up', pos: { x: 0, y: 2 }, direction: { x: 0, y: -1 }, expected: { player: { x: 0, y: 2 }, box: { x: 0, y: 1 }, rock: { x: 0, y: 0 } } },
			{ command: 'up', pos: { x: 0, y: 3 }, direction: { x: 0, y: -1 }, expected: { player: { x: 0, y: 2 }, box: { x: 0, y: 1 }, rock: { x: 0, y: 0 } } },
			{ command: 'up', pos: { x: 1, y: 4 }, direction: { x: 0, y: -1 }, expected: { player: { x: 1, y: 3 }, box: { x: 1, y: 2 }, rock: { x: 1, y: 0 } } },
			{ command: 'right', pos: { x: 0, y: 1 }, direction: { x: 1, y: 0 }, expected: { player: { x: 1, y: 1 }, box: { x: 2, y: 1 }, rock: { x: 4, y: 1 } } },
			{ command: 'right', pos: { x: 1, y: 0 }, direction: { x: 1, y: 0 }, expected: { player: { x: 2, y: 0 }, box: { x: 3, y: 0 }, rock: { x: 4, y: 0 } } },
			{ command: 'right', pos: { x: 2, y: 0 }, direction: { x: 1, y: 0 }, expected: { player: { x: 2, y: 0 }, box: { x: 3, y: 0 }, rock: { x: 4, y: 0 } } },
			{ command: 'left', pos: { x: 2, y: 1 }, direction: { x: -1, y: 0 }, expected: { player: { x: 2, y: 1 }, box: { x: 1, y: 1 }, rock: { x: 0, y: 1 } } },
			{ command: 'left', pos: { x: 3, y: 1 }, direction: { x: -1, y: 0 }, expected: { player: { x: 2, y: 1 }, box: { x: 1, y: 1 }, rock: { x: 0, y: 1 } } },
			{ command: 'left', pos: { x: 4, y: 0 }, direction: { x: -1, y: 0 }, expected: { player: { x: 3, y: 0 }, box: { x: 2, y: 0 }, rock: { x: 0, y: 0 } } },
		].forEach(({ command, pos, direction, expected }) => {
			it(`move: ${command}, from player pos: (${pos.x}, ${pos.y})`, () => {
				const objectFactory = new ObjectFactory();
				const state: IAncientMazeState<GO> = di.get('state');
				state.command = command as CommandType;

				// setup board
				const player: GameBoardObject<GO> = objectFactory.create(PLAYER_TYPE, { x: pos.x, y: pos.y });
				const box: GameBoardObject<GO> = objectFactory.create(BOX_TYPE, { x: pos.x + direction.x, y: pos.y + direction.y });
				const rock: GameBoardObject<GO> = objectFactory.create(ROCK_TYPE, { x: pos.x + 2 * direction.x, y: pos.y + 2 * direction.y });

				state.objects.push(rock);
				state.objects.push(box);
				state.objects.push(player);

				// start execution
				resolveState(di, state);

				expect(player.state.position).toEqual(expected.player, 'should move player');
				expect(box.state.position).toEqual(expected.box, 'should move box');
				expect(rock.state.position).toEqual(expected.rock, 'should move rock');
			});
		});
	});
});
