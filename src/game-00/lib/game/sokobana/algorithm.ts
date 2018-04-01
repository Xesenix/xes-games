import { inject } from 'lib/di';
import { CollisionSystem } from 'lib/game/system/collision';
import { IGameBoard, IGameBoardObject, IGameBoardMovableObject, IGameObjectState } from 'lib/game/board/interface';

export const MOVABLE_OBJECT = 0b0001;
export const CONTROLLABLE_OBJECT = 0b0010;
export const DESTROY_ON_COLLISION_OBJECT = 0b10100;
export const KILL_ON_COLLISION_OBJECT = 0b1000;
export const DESTRUCTIBLE_OBJECT = 0b10000;
export const SPAWNER_OBJECT = 0b100000;
export const STOP_ON_COLLISION_OBJECT = 0b1000000;

export const MOVABLE_CONTROLLABLE_OBJECT = MOVABLE_OBJECT | CONTROLLABLE_OBJECT;

@inject(['collision-system'])
export default class SokobanaAlgorithm<T extends IGameObjectState> {
	constructor(
		private colisionSystem: CollisionSystem,
	) { }

	public commandMoveUp(objects: IGameBoardObject<T>[]): void {
		objects.forEach((obj) => {
			if (obj.type & CONTROLLABLE_OBJECT) {
				if (typeof obj.commandMoveUp === 'function') {
					obj.commandMoveUp();
				}
			} else {
				if (typeof obj.commandMove === 'function') {
					obj.commandMove();
				}
			}
		});
	}

	public commandMoveDown(objects: IGameBoardObject<T>[]): void {
		objects.forEach((obj) => {
			if (obj.type & CONTROLLABLE_OBJECT) {
				if (typeof obj.commandMoveDown === 'function') {
					obj.commandMoveDown();
				}
			} else {
				if (typeof obj.commandMove === 'function') {
					obj.commandMove();
				}
			}
		});
	}

	public commandMoveLeft(objects: IGameBoardObject<T>[]): void {
		objects.forEach((obj) => {
			if (obj.type & CONTROLLABLE_OBJECT) {
				if (typeof obj.commandMoveLeft === 'function') {
					obj.commandMoveLeft();
				}
			} else {
				if (typeof obj.commandMove === 'function') {
					obj.commandMove();
				}
			}
		});
	}

	public commandMoveRight(objects: IGameBoardObject<T>[]): void {
		objects.forEach((obj) => {
			if (obj.type & CONTROLLABLE_OBJECT) {
				if (typeof obj.commandMoveRight === 'function') {
					obj.commandMoveRight();
				}
			} else {
				if (typeof obj.commandMove === 'function') {
					obj.commandMove();
				}
			}
		});
	}

	public commandAction(objects: IGameBoardObject<T>[]): void {
		objects.forEach((obj) => {
			if (typeof obj.commandAction === 'function') {
				obj.commandAction();
			}
		});
	}

	private resolveCell(obj: IGameBoardMovableObject<T>, board: IGameBoard<T>): boolean {
		console.log('resolveCell', obj);
		const { alive = false, steps = 0, n = { x: 0, y: 0 }, position = { x: 0, y: 0 } } = obj.state as any;

		if (alive && steps > 0 && (n.x != 0 || n.y != 0)) {
			const targetCellObjects = board.get(position.x + n.x, position.y + n.y, null);

			if (!this.colisionSystem.checkCollision(obj, targetCellObjects)) {
				// reduce velocity after each step till it reaches 0
				// actor.v.x -= n.x;
				// actor.v.y -= n.y;
				(obj.state as any).steps --;
				// move
				board.remove(position.x, position.y, obj);
				obj.state.position.x += n.x;
				obj.state.position.y += n.y;
				board.add(obj.state.position.x, obj.state.position.y, obj);
				console.log('moved', obj);

				return false;
			}
			console.log('not moved', obj);
		}

		return true;
	}

	public update(objects: IGameBoardObject<T>[], board: IGameBoard<T>): void {
		// we need to resolve positions of movable objects
		const movable = objects.filter(obj => (obj.type & MOVABLE_OBJECT) === MOVABLE_OBJECT);

		movable.forEach((obj) => {
			obj.update(objects, board);
		});

		// first move faster objects then determine order by position on board
		let ordered = movable.sort((a, b) => a.state.steps < b.state.steps ? -1 : a.state.steps > b.state.steps ? 1 : a.state.position.x < b.state.position.x || a.state.position.y < b.state.position.y ? -1 : a.state.position.x === b.state.position.x && a.state.position.y === b.state.position.y ? 0 : 1);
		ordered = ordered.filter(obj => this.resolveCell(obj, board));
		// for all unresolved reverse board order
		console.log('=== resolve reverse order');
		ordered
			.sort((a, b) => a.state.steps < b.state.steps ? -1 : a.state.steps > b.state.steps ? 1 : a.state.position.x < b.state.position.x || a.state.position.y < b.state.position.y ? 1 : a.state.position.x === b.state.position.x && a.state.position.y === b.state.position.y ? 0 : -1)
			.forEach(obj => this.resolveCell(obj, board));
	}

	public resolved(objects: IGameBoardObject<T>[], board: IGameBoard<T>): boolean {
		return objects.reduce((acc, obj) => {
			const { alive = false, steps = 0 } = obj.state || {};
			console.log('is resolved ', acc, obj.id, steps);
			if (alive) {
				return acc && steps === 0;
			}
			return acc;
		}, true);
	}
}
