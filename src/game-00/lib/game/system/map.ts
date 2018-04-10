import { IGameBoard, IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';
import GameBoardObject from 'lib/game/board/object';
import {
	ACTOR_ASPECT,
	COLLECTABLE_ASPECT,
	COLLECTOR_ASPECT,
	COLLISION_ASPECT,
	DESTROY_OBJECT_ON_COLLISION_ASPECT,
	DESTRUCTIBLE_OBJECT_ASPECT,
	EXIT_ASPECT,
	KILL_ON_COLLISION_OBJECT_ASPECT,
	LIFE_SPAN_ASPECT,
	MOVABLE_ASPECT,
	MOVABLE_CONTROLLABLE_ASPECT,
	SPAWNER_OBJECT_ASPECT,
} from 'lib/game/sokobana/aspects';

export const WALL_APPEARANCE = 0;
export const PLAYER_APPEARANCE = 1;
export const BOX_APPEARANCE = 2;
export const ARROW_CANNON_APPEARANCE = 3;
export const ROCK_APPEARANCE = 4;
export const BROKEN_ROCK_APPEARANCE = 5;
export const ARROW_APPEARANCE = 6;
export const BROKEN_ARROW_APPEARANCE = 7;
export const EXIT_APPEARANCE = 8;
export const KEY_APPEARANCE = 9;

export const ARROW_TYPE = MOVABLE_ASPECT | DESTROY_OBJECT_ON_COLLISION_ASPECT | KILL_ON_COLLISION_OBJECT_ASPECT | COLLISION_ASPECT;
export const PLAYER_TYPE = MOVABLE_CONTROLLABLE_ASPECT | DESTRUCTIBLE_OBJECT_ASPECT | COLLISION_ASPECT | ACTOR_ASPECT | COLLECTOR_ASPECT;
export const ROCK_TYPE = MOVABLE_CONTROLLABLE_ASPECT | KILL_ON_COLLISION_OBJECT_ASPECT | DESTRUCTIBLE_OBJECT_ASPECT | COLLISION_ASPECT;
export const BOX_TYPE = MOVABLE_CONTROLLABLE_ASPECT | COLLISION_ASPECT;
export const WALL_TYPE = COLLISION_ASPECT;
export const EXIT_TYPE = EXIT_ASPECT;
export const KEY_TYPE = COLLECTABLE_ASPECT | DESTRUCTIBLE_OBJECT_ASPECT;

export const BROKEN_ARROW_FACTORY = 0;
export const BROKEN_ROCK_FACTORY = 1;

export default class MapSystem {
	private spawnIndex = 0;

	constructor(
		private objects: Array<IGameBoardObject>,
		private board: IGameBoard,
	) { }

	public buildArrowCannon(x: number, y: number, dx: number, dy: number): void {
		this.objects.push(new GameBoardObject(
			this.spawnIndex++,
			SPAWNER_OBJECT_ASPECT | COLLISION_ASPECT,
			0,
			{
				appearance: ARROW_CANNON_APPEARANCE,
				alive: true,
				position: { x, y },
				spawnFactoryId: 0,
				direction: { x: dx, y: dy },
			} as IGameObjectState,
		));
	}

	public buildArrow(position: { x: number, y: number }, direction: { x: number, y: number }): IGameBoardObject {
		return new GameBoardObject(this.spawnIndex++, ARROW_TYPE, 3, {
			appearance: ARROW_APPEARANCE,
			alive: true,
			bodyFactoryId: BROKEN_ARROW_FACTORY,
			position,
			direction,
			n: { x: 1, y: 0 },
			speed: 15,
			steps: 0,
			impact: 0,
		});
	}

	public buildBrokenArrow(position: { x: number, y: number }, direction: { x: number, y: number }): IGameBoardObject {
		return new GameBoardObject(this.spawnIndex++, LIFE_SPAN_ASPECT, 4, {
			appearance: BROKEN_ARROW_APPEARANCE,
			alive: true,
			lifespan: 1,
			position,
			direction,
		});
	}

	public buildBrokenRock(position: { x: number, y: number }, direction: { x: number, y: number }): IGameBoardObject {
		return new GameBoardObject(this.spawnIndex++, COLLISION_ASPECT, 0, {
			appearance: BROKEN_ROCK_APPEARANCE,
			alive: true,
			position,
			direction,
		});
	}

	public buildBox(x: number, y: number): void {
		this.objects.push(new GameBoardObject(this.spawnIndex++, BOX_TYPE, 0, {
			appearance: BOX_APPEARANCE,
			alive: true,
			position: { x, y },
			direction: { x: 0, y: 0 },
			n: { x: 0, y: 0 },
			speed: 1,
			steps: 0,
			impact: 0,
		}));
	}

	public buildPlayer(x: number, y: number): void {
		this.objects.push(new GameBoardObject(this.spawnIndex++, PLAYER_TYPE, 1, {
			appearance: PLAYER_APPEARANCE,
			alive: true,
			position: { x, y },
			direction: { x: 0, y: 0 },
			n: { x: 0, y: 0 },
			speed: 1,
			steps: 0,
			impact: 0,
		}));
	}

	public buildRock(x: number, y: number): void {
		this.objects.push(new GameBoardObject(this.spawnIndex++, ROCK_TYPE, 2, {
			appearance: ROCK_APPEARANCE,
			alive: true,
			bodyFactoryId: BROKEN_ROCK_FACTORY,
			position: { x, y },
			direction: { x: 0, y: 0 },
			n: { x: 0, y: 0 },
			speed: 15,
			steps: 0,
			impact: 0,
		}));
	}

	public buildWall(x: number, y: number): void {
		return this.board.set(x, y, [ new GameBoardObject(this.spawnIndex++, WALL_TYPE, 0, { appearance: WALL_APPEARANCE, alive: false, position: { x, y } }) ]);
	}

	public buildExit(x: number, y: number, keyItemId: number): void {
		this.objects.push(new GameBoardObject(this.spawnIndex++, EXIT_TYPE, 4, { appearance: EXIT_APPEARANCE, alive: true, position: { x, y }, keyItemId } ));
	}

	public buildKey(x: number, y: number, collectableId: number): void {
		this.objects.push(new GameBoardObject(this.spawnIndex++, KEY_TYPE, 4, { appearance: KEY_APPEARANCE, alive: true, position: { x, y }, collectableId } ));
	}

	public load() {
		for (let i = 0; i < this.board.sizeX; i ++) {
			this.buildWall(i, 0);
			this.buildWall(i, this.board.sizeY - 1);
		}

		for (let i = 2; i < this.board.sizeY - 1; i ++) {
			this.buildWall(0, i);
			this.buildWall(this.board.sizeX - 1, i);
		}

		this.buildWall(0, 1);

		this.buildWall(1, 2);
		this.buildWall(1, 4);
		this.buildWall(1, 6);

		// this.buildWall(3, 1);
		this.buildWall(3, 2);
		this.buildWall(3, 4);
		this.buildWall(3, 6);
		this.buildWall(3, 7);

		this.buildWall(5, 2);
		this.buildWall(5, 3);
		this.buildWall(5, 4);
		this.buildWall(5, 5);
		this.buildWall(5, 6);

		this.buildWall(6, 2);
		this.buildWall(6, 6);

		this.buildWall(7, 2);
		this.buildWall(7, 4);
		this.buildWall(7, 5);
		this.buildWall(7, 6);

		this.buildWall(8, 2);

		this.buildWall(9, 2);
		this.buildWall(9, 4);
		this.buildWall(9, 5);
		this.buildWall(9, 6);
		this.buildWall(9, 7);

		this.buildWall(10, 7);

		this.buildPlayer(1, 3);
		this.buildRock(1, 1);
		this.buildRock(1, 7);
		this.buildRock(8, 7);
		this.buildBox(3, 3);
		this.buildBox(8, 5);
		this.buildBox(8, 6);

		this.buildArrowCannon(11, 1, -1, 0);
		this.buildArrowCannon(3, 1, 1, 0);

		this.buildExit(10, 6, 0);
		this.buildKey(6, 5, 0);
		this.buildKey(1, 5, 0);
	}
}
