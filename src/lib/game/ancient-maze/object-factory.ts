import { injectable } from 'lib/di';
import { IGameBoard, IGameBoardObject, IGameObjectState, IMovableGameObjectState } from 'lib/game/board/interface';
import { GameBoardObject } from 'lib/game/board/object';

export const ARROW_CANNON_TYPE = Symbol.for('ARROW_CANNON_TYPE');
export const ARROW_TYPE = Symbol.for('ARROW_TYPE');
export const BOX_TYPE = Symbol.for('BOX_TYPE');
export const BROKEN_ARROW_TYPE = Symbol.for('BROKEN_ARROW_TYPE');
export const BROKEN_ROCK_TYPE = Symbol.for('BROKEN_ROCK_TYPE');
export const EXIT_TYPE = Symbol.for('EXIT_TYPE');
export const WALL_TYPE = Symbol.for('WALL_TYPE');
export const KEY_TYPE = Symbol.for('KEY_TYPE');
export const PLAYER_TYPE = Symbol.for('PLAYER_TYPE');
export const ROCK_TYPE = Symbol.for('ROCK_TYPE');

const ACTOR_ASPECT = Symbol.for('ACTOR_ASPECT');
const ARROW_OBJECT_ASPECT = Symbol.for('ARROW_OBJECT_ASPECT');
const ARROW_TARGET_ASPECT = Symbol.for('ARROW_TARGET_ASPECT');
const ARROW_KILLABLE_ASPECT = Symbol.for('ARROW_KILLABLE_ASPECT');
const CONTROLLABLE_ASPECT = Symbol.for('CONTROLLABLE_ASPECT');
const COLLISION_ASPECT = Symbol.for('COLLISION_ASPECT');
const COLLECTABLE_ASPECT = Symbol.for('COLLECTABLE_ASPECT');
const COLLECTOR_ASPECT = Symbol.for('COLLECTOR_ASPECT');
const DESTRUCTIBLE_OBJECT_ASPECT = Symbol.for('DESTRUCTIBLE_OBJECT_ASPECT');
const EXIT_ASPECT = Symbol.for('EXIT_ASPECT');
const ROCK_OBJECT_ASPECT = Symbol.for('ROCK_OBJECT_ASPECT');
const ROCK_TARGET_ASPECT = Symbol.for('ROCK_TARGET_ASPECT');
const SPAWNER_OBJECT_ASPECT = Symbol.for('SPAWNER_OBJECT_ASPECT');
const LIFE_SPAN_ASPECT = Symbol.for('LIFE_SPAN_ASPECT');
const MOVABLE_ASPECT = Symbol.for('MOVABLE_ASPECT');

export const aspects = {
	[ARROW_TYPE]: [
		ARROW_OBJECT_ASPECT,
		COLLISION_ASPECT,
		DESTRUCTIBLE_OBJECT_ASPECT,
		MOVABLE_ASPECT,
		ROCK_TARGET_ASPECT,
	],
	[PLAYER_TYPE]: [
		ACTOR_ASPECT,
		ARROW_TARGET_ASPECT,
		ARROW_KILLABLE_ASPECT,
		COLLECTOR_ASPECT,
		COLLISION_ASPECT,
		CONTROLLABLE_ASPECT,
		DESTRUCTIBLE_OBJECT_ASPECT,
		MOVABLE_ASPECT,
		ROCK_TARGET_ASPECT,
	],
	[ROCK_TYPE]: [
		ARROW_TARGET_ASPECT,
		COLLISION_ASPECT,
		CONTROLLABLE_ASPECT,
		DESTRUCTIBLE_OBJECT_ASPECT,
		MOVABLE_ASPECT,
		ROCK_OBJECT_ASPECT,
		ROCK_TARGET_ASPECT,
	],
	[BOX_TYPE]: [
		ARROW_TARGET_ASPECT,
		COLLISION_ASPECT,
		CONTROLLABLE_ASPECT,
		MOVABLE_ASPECT,
	],
	[WALL_TYPE]: [
		COLLISION_ASPECT,
	],
	[EXIT_TYPE]: [
		EXIT_ASPECT,
	],
	[KEY_TYPE]: [
		COLLECTABLE_ASPECT,
	],
	[ARROW_CANNON_TYPE]: [
		COLLISION_ASPECT,
		SPAWNER_OBJECT_ASPECT,
	],
	[BROKEN_ARROW_TYPE]: [
		LIFE_SPAN_ASPECT,
	],
	[BROKEN_ROCK_TYPE]: [
		COLLISION_ASPECT,
	],
};

export const collisionGroup = {
	[ARROW_TYPE]: 3,
	[PLAYER_TYPE]: 1,
	[ROCK_TYPE]: 2,
	[BOX_TYPE]: 0,
	[WALL_TYPE]: 0,
	[EXIT_TYPE]: 4,
	[KEY_TYPE]: 4,
	[ARROW_CANNON_TYPE]: 0,
	[BROKEN_ARROW_TYPE]: 4,
	[BROKEN_ROCK_TYPE]: 0,
};

export const KEY_ITEM_TYPE = Symbol.for('KEY_ITEM_TYPE');

export const objectStatePrototype = {
	[ARROW_TYPE]: {
		appearance: 1,
		bodyFactoryId: BROKEN_ARROW_TYPE,
		speed: 15,
		priority: 0,
	},
	[PLAYER_TYPE]: {
		appearance: 2,
		speed: 1,
		priority: 1,
	},
	[ROCK_TYPE]: {
		appearance: 3,
		bodyFactoryId: BROKEN_ROCK_TYPE,
		speed: 15,
		priority: 2,
	},
	[BOX_TYPE]: {
		appearance: 4,
		speed: 1,
		priority: 1,
	},
	[WALL_TYPE]: {
		appearance: 0,
	},
	[EXIT_TYPE]: {
		appearance: 5,
		keyItemId: KEY_ITEM_TYPE,
	},
	[KEY_TYPE]: {
		appearance: 6,
		collectableId: KEY_ITEM_TYPE,
	},
	[ARROW_CANNON_TYPE]: {
		appearance: 7,
		spawnFactoryId: ARROW_TYPE,
	},
	[BROKEN_ARROW_TYPE]: {
		appearance: 8,
		lifespan: 1,
	},
	[BROKEN_ROCK_TYPE]: {
		appearance: 9,
	},
};

type GO = (IGameObjectState | IMovableGameObjectState);

@injectable()
export class ObjectFactory<T extends GO, S extends { objects: IGameBoardObject<T>[], board: IGameBoard<T> }> {
	private spawnIndex = 0;

	public build(state: S, type: symbol, position: { x: number, y: number }, direction: { x: number, y: number } = { x: 0, y: 0 }): void {
		state.objects.push(this.create(type, position, direction));
	}

	public create(type: symbol, position: { x: number, y: number }, direction: { x: number, y: number } = { x: 0, y: 0 }): IGameBoardObject<T> {
		return new GameBoardObject<T>(
			this.spawnIndex++,
			type,
			aspects[type],
			collisionGroup[type],
			{
				alive: true,
				n: { x: 0, y: 0 },
				speed: 0,
				steps: 0,
				priority: 0,
				impact: 0,
				...objectStatePrototype[type],
				position: { ...position },
				direction: { ...direction },
			} as T,
		);
	}
}
