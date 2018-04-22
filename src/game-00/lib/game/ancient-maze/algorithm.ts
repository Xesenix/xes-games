import { inject } from 'lib/di';
import { IGameBoard, IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';
import { CollisionSystem } from 'lib/game/system/collision.system';

const CONTROLLABLE_ASPECT = Symbol.for('CONTROLLABLE_ASPECT');
const MOVABLE_ASPECT = Symbol.for('MOVABLE_ASPECT');

@inject(['collision-system'])
export default class Algorithm<T extends IGameObjectState, S extends { objects: IGameBoardObject<T>[], board: IGameBoard }> {
	constructor(
		private collisionSystem: CollisionSystem,
	) { }

	public commandMoveUp(state: S): void {
		const { objects } = state;
		objects.filter((obj: IGameBoardObject<T>) => obj.aspects.includes(CONTROLLABLE_ASPECT)).forEach((obj: IGameBoardObject<T>) => {
			obj.state.direction = {
				x: 0,
				y: -1,
			};
			obj.state.steps = obj.state.speed;
		});
	}

	public commandMoveDown(state: S): void {
		const { objects } = state;
		objects.filter((obj: IGameBoardObject<T>) => obj.aspects.includes(CONTROLLABLE_ASPECT)).forEach((obj: IGameBoardObject<T>) => {
			obj.state.direction = {
				x: 0,
				y: 1,
			};
			obj.state.steps = obj.state.speed;
		});
	}

	public commandMoveLeft(state: S): void {
		const { objects } = state;
		objects.filter((obj: IGameBoardObject<T>) => obj.aspects.includes(CONTROLLABLE_ASPECT)).forEach((obj: IGameBoardObject<T>) => {
			obj.state.direction = {
				x: -1,
				y: 0,
			};
			obj.state.steps = obj.state.speed;
		});
	}

	public commandMoveRight(state: S): void {
		const { objects } = state;
		objects.filter((obj: IGameBoardObject<T>) => obj.aspects.includes(CONTROLLABLE_ASPECT)).forEach((obj: IGameBoardObject<T>) => {
			obj.state.direction = {
				x: 1,
				y: 0,
			};
			obj.state.steps = obj.state.speed;
		});
	}

	public commandAction(state: S): void {
		const { objects } = state;
		objects.filter((obj: IGameBoardObject<T>) => obj.aspects.includes(MOVABLE_ASPECT)).forEach((obj: IGameBoardObject<T>) => {
			obj.state.n = {
				...obj.state.direction,
			};
			obj.state.steps = obj.state.speed;
		});
	}

	public update(state: S): void {
		const { objects, board } = state;
		// we need to resolve positions of movable objects
		const movable = objects.filter((obj: IGameBoardObject<T>) => obj.aspects.includes(MOVABLE_ASPECT));

		// first move faster objects then determine order by position on board
		let ordered = movable.sort((a: IGameBoardObject<T>, b: IGameBoardObject<T>) => a.state.steps < b.state.steps
			? -1
			: a.state.steps > b.state.steps
			? 1
			: a.state.position.x < b.state.position.x || a.state.position.y < b.state.position.y
			? -1
			: a.state.position.x === b.state.position.x && a.state.position.y === b.state.position.y
			? 0
			: 1,
		);
		ordered = ordered.filter((obj: IGameBoardObject<T>) => this.resolveCell(obj, board));
		// for all unresolved reverse board order
		console.log('=== resolve reverse order');
		ordered
			.sort(
				(a: IGameBoardObject<T>, b: IGameBoardObject<T>) => a.state.steps < b.state.steps
					? -1
					: a.state.steps > b.state.steps
					? 1
					: a.state.position.x < b.state.position.x || a.state.position.y < b.state.position.y
					? 1 : a.state.position.x === b.state.position.x && a.state.position.y === b.state.position.y
					? 0 : -1,
			)
			.filter((obj: IGameBoardObject<T>) => this.resolveCell(obj, board))
			.forEach((obj: IGameBoardObject<T>) => {
				const { alive = false, steps = 0, collided = false } = obj.state as any;
				if (collided || (alive && steps > 0)) {
					console.log('collided', obj);
					// everything that didn't move can't move
					obj.state.steps = 0;
					obj.state.collided = true;
					// this.collisionSystem.addCollision(obj, targetCellObjects);
				} else {
					console.log('moved', obj);
				}
			});
	}

	public resolved(state: S): boolean {
		const { objects } = state;
		return objects.reduce((acc: boolean, obj: IGameBoardObject<T>) => {
			const { alive = false, steps = 0 } = obj.state || {};
			console.log('is resolved ', acc, obj.id, steps);
			if (alive) {
				return acc && steps === 0;
			}
			return acc;
		}, true);
	}

	private resolveCell(obj: IGameBoardObject<T>, board: IGameBoard<T>): boolean {
		// console.log('resolveCell', obj);
		const { alive = false, steps = 0, n = { x: 0, y: 0 }, position = { x: 0, y: 0 } } = obj.state as any;

		if (alive && steps > 0 && (n.x !== 0 || n.y !== 0)) {
			const targetCellObjects = board.get(position.x + n.x, position.y + n.y, null);

			if (!this.collisionSystem.checkCollision(obj, targetCellObjects)) {
				// reduce velocity after each step till it reaches 0
				// actor.v.x -= n.x;
				// actor.v.y -= n.y;
				(obj.state as any).steps --;
				obj.state.collided = false;
				// move
				board.remove(position.x, position.y, obj);
				obj.state.position.x += n.x;
				obj.state.position.y += n.y;
				board.add(obj.state.position.x, obj.state.position.y, obj);
				console.log('moved', obj);

				return false; // moved
			}
		}

		return true;
	}
}
