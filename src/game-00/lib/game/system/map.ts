import GameBoardObjectSpawner from 'lib/game/board/object-spawner';
import GameBoardMovableObject from 'lib/game/board/movable-object';
import { IGameBoard, IGameObjectState, IGameBoardObject } from 'lib/game/board/interface';
import GameBoardObject from 'lib/game/board/object';
import { SPAWNER_OBJECT, STOP_ON_COLLISION_OBJECT , MOVABLE_OBJECT, MOVABLE_CONTROLLABLE_OBJECT, DESTROY_ON_COLLISION_OBJECT, KILL_ON_COLLISION_OBJECT, DESTRUCTIBLE_OBJECT } from 'lib/game/sokobana/algorithm';

export const WALL_APPEARANCE = 0;
export const PLAYER_APPEARANCE = 1;
export const BOX_APPEARANCE = 2;
export const ARROW_CANNON_APPEARANCE = 3;
export const ROCK_APPEARANCE = 4;
export const BROKEN_ROCK_APPEARANCE = 5;
export const ARROW_APPEARANCE = 6;
export const BROKEN_ARROW_APPEARANCE = 7;

const ARROW_TYPE = MOVABLE_OBJECT | DESTROY_ON_COLLISION_OBJECT | KILL_ON_COLLISION_OBJECT;
const PLAYER_TYPE = MOVABLE_CONTROLLABLE_OBJECT | DESTRUCTIBLE_OBJECT;
const ROCK_TYPE = MOVABLE_CONTROLLABLE_OBJECT | KILL_ON_COLLISION_OBJECT | DESTRUCTIBLE_OBJECT | STOP_ON_COLLISION_OBJECT;
const BOX_TYPE = MOVABLE_CONTROLLABLE_OBJECT | STOP_ON_COLLISION_OBJECT;
const WALL_TYPE = STOP_ON_COLLISION_OBJECT;

const collisionGroup = 0b01;

export default class MapSystem {
	private spawnIndex = 0;

	constructor(
		private objects: IGameBoardObject[],
		private board: IGameBoard,
	) { }

	public buildArrowCannon(x, y, dx, dy) {
		this.objects.push(new GameBoardObjectSpawner(
			this.spawnIndex++,
			SPAWNER_OBJECT | STOP_ON_COLLISION_OBJECT,
			collisionGroup,
			{
				appearance: ARROW_CANNON_APPEARANCE,
				alive: true,
				position: { x, y }
			} as IGameObjectState,
			(x, y) => new GameBoardMovableObject(
				this.spawnIndex++,
				ARROW_TYPE,
				collisionGroup,
				{
					appearance: ARROW_APPEARANCE,
					alive: true,
					direction: { x: dx, y: dy },
					n: { x: 0, y: -1 },
					speed: 15,
					steps: 0,
					impact: 0,
					position: {
						x,
						y,
					},
				}
			),
		));
	}

	public buildArrow(x, y, dx, dy) {
		this.objects.push(new GameBoardMovableObject(this.spawnIndex++, ARROW_TYPE, collisionGroup, { appearance: ARROW_APPEARANCE, alive: true, position: { x, y }, direction: { x: dx, y: dy }, n: { x: 1, y: 0 }, speed: 15, steps: 0, impact: 0 } ));
	}

	public buildBrokenArrow(x, y) {
		this.board.addUnique(x, y, new GameBoardObject(this.spawnIndex++, 0, 0, { appearance: BROKEN_ARROW_APPEARANCE, alive: false, position: { x, y } }));
	}

	public buildBrokenRock(x, y) {
		this.board.addUnique(x, y, new GameBoardObject(this.spawnIndex++, STOP_ON_COLLISION_OBJECT, collisionGroup, { appearance: BROKEN_ROCK_APPEARANCE, alive: false, position: { x, y } }));
	}

	public buildBox(x, y) {
		this.objects.push(new GameBoardMovableObject(this.spawnIndex++, BOX_TYPE, collisionGroup, { appearance: BOX_APPEARANCE, alive: true, position: { x, y }, direction: { x: 0, y: 0 }, n: { x: 0, y: 0 }, speed: 1, steps: 0, impact: 0 } ));
	}

	public buildPlayer(x, y) {
		this.objects.push(new GameBoardMovableObject(this.spawnIndex++, PLAYER_TYPE, collisionGroup, { appearance: PLAYER_APPEARANCE, alive: true, position: { x, y }, direction: { x: 0, y: 0 }, n: { x: 0, y: 0 }, speed: 1, steps: 0, impact: 0 } ));
	}

	public buildRock(x, y) {
		this.objects.push(new GameBoardMovableObject(this.spawnIndex++, ROCK_TYPE, collisionGroup, { appearance: ROCK_APPEARANCE, alive: true, position: { x, y }, direction: { x: 0, y: 0 }, n: { x: 0, y: 0 }, speed: 15, steps: 0, impact: 0 } ));
	}

	public buildWall(x, y) {
		return this.board.set(x, y, [ new GameBoardObject(this.spawnIndex++, WALL_TYPE, collisionGroup, { appearance: WALL_APPEARANCE, alive: false, position: { x, y } }) ]);
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

		this.buildWall(3, 1);
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
	}
}
