import { Container } from 'inversify';
import { IAncientMazeState } from 'lib/game/ancient-maze/ancient-maze';
import Board from 'lib/game/board/board';
import { IGameObjectState, IMovableGameObjectState } from 'lib/game/board/interface';
import GameBoardObject from 'lib/game/board/object';
import CollisionSystem from 'lib/game/system/collision.system';

import MovementSystem from './movement.system';
import { ARROW_TYPE, BOX_TYPE, ObjectFactory, PLAYER_TYPE, ROCK_TYPE } from './object-factory';

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

	describe('up', () => {
		beforeEach(() => {
			const state: IAncientMazeState<GO> = di.get('state');
			state.command = 'up';
		});

		[
			{ posX: 0, posY: 1 },
			{ posX: 2, posY: 3 },
		].forEach(({ posX, posY }) => {
			it('should move (rock, box, player) up if they are adjacent one over each other', () => {
				const objectFactory = new ObjectFactory();
				const state: IAncientMazeState<GO> = di.get('state');

				// setup board
				const rock: GameBoardObject<GO> = objectFactory.create(ROCK_TYPE, { x: posX, y: posY });
				const box: GameBoardObject<GO> = objectFactory.create(BOX_TYPE, { x: posX, y: posY + 1 });
				const player: GameBoardObject<GO> = objectFactory.create(PLAYER_TYPE, { x: posX, y: posY + 2 });

				state.objects.push(rock);
				state.objects.push(box);
				state.objects.push(player);

				// start execution
				resolveState(di, state);

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
				const objectFactory = new ObjectFactory();
				const state: IAncientMazeState<GO> = di.get('state');

				// setup board
				const box: GameBoardObject<GO> = objectFactory.create(BOX_TYPE, { x: posX, y: posY + 1 });
				const arrow: GameBoardObject<GO> = objectFactory.create(ARROW_TYPE, { x: posX + 1, y: posY }, { x: -1, y: 0 });

				state.objects.push(box);
				state.objects.push(arrow);

				// start execution
				resolveState(di, state);

				expect(box.state.position).toEqual({ x: posX, y: posY }, 'should move box');
				expect(arrow.state.position).toEqual({ x: posX + 1, y: posY }, 'should move arrow');
				expect(arrow.state.collided).toEqual(true, 'arrow should stop');
			});
		});
	});

	describe('down', () => {
		beforeEach(() => {
			const state: IAncientMazeState<GO> = di.get('state');
			state.command = 'down';
		});

		[
			{ posX: 0, posY: 1 },
			{ posX: 2, posY: 0 },
		].forEach(({ posX, posY }) => {
			it('should move (rock, box, player) up if they are adjacent one over each other', () => {
				const objectFactory = new ObjectFactory();
				const state: IAncientMazeState<GO> = di.get('state');

				// setup board
				const player: GameBoardObject<GO> = objectFactory.create(PLAYER_TYPE, { x: posX, y: posY  });
				const box: GameBoardObject<GO> = objectFactory.create(BOX_TYPE, { x: posX, y: posY + 1 });
				const rock: GameBoardObject<GO> = objectFactory.create(ROCK_TYPE, { x: posX, y: posY + 2 });

				state.objects.push(rock);
				state.objects.push(box);
				state.objects.push(player);

				// start execution
				resolveState(di, state);

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
				const objectFactory = new ObjectFactory();
				const state: IAncientMazeState<GO> = di.get('state');

				// setup board
				const box: GameBoardObject<GO> = objectFactory.create(BOX_TYPE, { x: posX, y: posY - 1 });
				const arrow: GameBoardObject<GO> = objectFactory.create(ARROW_TYPE, { x: posX + 1, y: posY }, { x: -1, y: 0 });

				state.objects.push(box);
				state.objects.push(arrow);

				// start execution
				resolveState(di, state);

				expect(box.state.position).toEqual({ x: posX, y: posY }, 'should move box');
				expect(arrow.state.position).toEqual({ x: posX + 1, y: posY }, 'should move arrow');
				expect(arrow.state.collided).toEqual(true, 'arrow should stop');
			});
		});
	});
});
