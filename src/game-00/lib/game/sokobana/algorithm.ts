import { IGameBoard } from 'lib/game/interface';
import { IGameBoardObject, IGameBoardMovableObject } from '../board/interface';

export const MOVABLE_OBJECT = 0b0001;
export const CONTROLLABLE_OBJECT = 0b0010;
export const DESTROY_ON_COLLISION_OBJECT = 0b10100;
export const KILL_ON_COLLISION_OBJECT = 0b1000;
export const DESTRUCTIBLE_OBJECT = 0b10000;
export const SPAWNER_OBJECT = 0b100000;

export const MOVABLE_CONTROLLABLE_OBJECT = MOVABLE_OBJECT | CONTROLLABLE_OBJECT;

export default class SokobanaAlgorithm {
	public commandMoveUp(objects: IGameBoardObject[]): void {
		objects.forEach((obj) => {
			if (obj.type & CONTROLLABLE_OBJECT) {
				if (typeof obj.commandMoveUp !== 'undefined') {
					obj.commandMoveUp();
				}
			} else {
				if (typeof obj.commandMove !== 'undefined') {
					obj.commandMove();
				}
			}
		});
	}

	public commandMoveDown(objects: IGameBoardObject[]): void {
		objects.forEach((obj) => {
			if (obj.type & CONTROLLABLE_OBJECT) {
				if (typeof obj.commandMoveDown !== 'undefined') {
					obj.commandMoveDown();
				}
			} else {
				if (typeof obj.commandMove !== 'undefined') {
					obj.commandMove();
				}
			}
		});
	}

	public commandMoveLeft(objects: IGameBoardObject[]): void {
		objects.forEach((obj) => {
			if (obj.type & CONTROLLABLE_OBJECT) {
				if (typeof obj.commandMoveLeft !== 'undefined') {
					obj.commandMoveLeft();
				}
			} else {
				if (typeof obj.commandMove !== 'undefined') {
					obj.commandMove();
				}
			}
		});
	}

	public commandMoveRight(objects: IGameBoardObject[]): void {
		objects.forEach((obj) => {
			if (obj.type & CONTROLLABLE_OBJECT) {
				if (typeof obj.commandMoveRight !== 'undefined') {
					obj.commandMoveRight();
				}
			} else {
				if (typeof obj.commandMove !== 'undefined') {
					obj.commandMove();
				}
			}
		});
	}

	public commandAction(objects: IGameBoardObject[]): void {
		objects.forEach((obj) => {
			if (typeof obj.commandAction !== 'undefined') {
				obj.commandAction();
			}
		});
	}

	private resolveCell(obj: IGameBoardMovableObject, board: IGameBoard): boolean {
		console.log('resolve', obj);
		if (typeof (obj as any).v !== 'undefined') {
			const actor = obj as IGameBoardMovableObject;
			const { v = null } = actor;

			if (v !== null) {
				const n = {
					x: v.x !== 0 ? v.x / Math.abs(v.x) : 0,
					y: v.y !== 0 ? v.y / Math.abs(v.y) : 0,
				};

				if (n.x != 0 || n.y != 0) {
					const targetCellObjects = board.get(obj.x + n.x, obj.y + n.y, null);
					// is it out of bound?
					if (targetCellObjects !== null) {
						// is it empty?
						// TODO: check collision group
						if (targetCellObjects.length === 0) {
							// reduce velocity after each step till it reaches 0
							actor.v.x -= n.x;
							actor.v.y -= n.y;
							// move
							board.remove(actor.x, actor.y, actor);
							actor.x = obj.x + n.x;
							actor.y = obj.y + n.y;
							board.add(actor.x, actor.y, actor);
							// console.log('moved', obj);

							return false;
						}
					}
				}
			}
		}

		return true;
	}

	public update(objects: IGameBoardObject[], board: IGameBoard): void {
		// we need to resolve positions of movable objects
		const movable = objects.filter(obj => typeof (obj as any).v !== 'undefined');

		movable.forEach((obj) => {
			obj.update(objects, board);
		});

		// first move faster objects then determine order by position on board
		let ordered = movable.sort((a, b) => a.steps < b.steps ? 1 : a.steps > b.steps ? -1 : a.x < b.x || a.y < b.y ? -1 : a.x === b.x && a.y === b.y ? 0 : 1);
		ordered = ordered.filter(obj => this.resolveCell(obj, board));
		// for all unresolved reverse board order
		console.log('=== resolve reverse order');
		ordered
			.sort((a, b) => a.steps < b.steps ? 1 : a.steps > b.steps ? -1 : a.x < b.x || a.y < b.y ? 1 : a.x === b.x && a.y === b.y ? 0 : -1)
			.forEach(obj => this.resolveCell(obj, board));
	}

	public resolved(objects: IGameBoardObject[], board: IGameBoard): boolean {
		return objects.reduce((acc, obj) => {
			// console.log('is resolved ', acc, obj.state, obj.id, obj.steps);
			if (obj.state > 0 && typeof (obj as any).steps !== 'undefined') {
				const { steps = 0 } = obj as IGameBoardMovableObject;

				return acc && steps === 0;
			}
			return acc;
		}, true);
	}
}
