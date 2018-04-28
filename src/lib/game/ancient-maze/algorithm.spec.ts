import { IAncientMazeState } from 'lib/game/ancient-maze/ancient-maze';
import Board from 'lib/game/board/board';
import { IGameBoard, IGameObjectState, IMovableGameObjectState, IGameBoardObject } from 'lib/game/board/interface';
import GameBoardObject from 'lib/game/board/object';
import CollisionSystem from 'lib/game/system/collision.system';

import Algorithm from './algorithm';
import { BOX_TYPE, ObjectFactory, PLAYER_TYPE, ROCK_TYPE } from './object-factory';

type GO = (IGameObjectState | IMovableGameObjectState);

fdescribe('moves', () => {

	[
		{ posX: 0, posY: 1 },
		// { posX: 2, posY: 3 },
	].forEach(({ posX, posY }) => {
		it('should move rock box player up if they are adjacent one over each other', () => {
			const collisionSystem = new CollisionSystem<GO, IAncientMazeState<GO>>();
			const algorithm = new Algorithm<GO, IAncientMazeState<GO>>(collisionSystem);
			const objectFactory = new ObjectFactory();
			const state: IAncientMazeState<GO> = {
				objects: [],
				inputBuffer: ['up'],
				finished: false,
				command: undefined,
				executedCommands: [],
				collected: { },
				initialCollectableCount: { },
				steps: 0,
				board: new Board(5, 5),
			} as IAncientMazeState<GO>;
			let rock: GameBoardObject<GO>;
			let box: GameBoardObject<GO>;
			let player: GameBoardObject<GO>;
			rock = objectFactory.create(ROCK_TYPE, { x: posX, y: posY });
			box = objectFactory.create(BOX_TYPE, { x: posX, y: posY + 1 });
			player = objectFactory.create(PLAYER_TYPE, { x: posX, y: posY + 2 });
			state.objects.push(rock);
			state.objects.push(box);
			state.objects.push(player);

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
});
