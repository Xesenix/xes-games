import { IGameBoard } from 'lib/game/interface';
import { IGameBoardObject, IGameBoardMovableObject } from '../board/interface';

export const MOVABLE_OBJECT = 0b0001;
export const CONTROLLABLE_OBJECT = 0b0010;

export const MOVABLE_CONTROLLABLE_OBJECT = MOVABLE_OBJECT | CONTROLLABLE_OBJECT;

export default class SokobanaAlgorithm {
	public moveUp(objects: IGameBoardObject[], board: IGameBoard): IGameBoardObject[] {
		return objects.map((obj) => {
			if (obj.type & MOVABLE_CONTROLLABLE_OBJECT) {
				return {
					...obj,
					v: {
						x: 0,
						y: -1,
					},
				}
			} else {
				return obj;
			}
		});
	}

	public moveDown(objects: IGameBoardObject[], board: IGameBoard): IGameBoardObject[] {
		return objects.map((obj) => {
			if (obj.type & MOVABLE_CONTROLLABLE_OBJECT) {
				return {
					...obj,
					v: {
						x: 0,
						y: 1,
					},
				}
			} else {
				return obj;
			}
		});
	}

	public moveLeft(objects: IGameBoardObject[], board: IGameBoard): IGameBoardObject[] {
		return objects.map((obj) => {
			if (obj.type & MOVABLE_CONTROLLABLE_OBJECT) {
				return {
					...obj,
					v: {
						x: -1,
						y: 0,
					},
				}
			} else {
				return obj;
			}
		});
	}

	public moveRight(objects: IGameBoardObject[], board: IGameBoard): IGameBoardObject[] {
		return objects.map((obj) => {
			if (obj.type & MOVABLE_CONTROLLABLE_OBJECT) {
				return {
					...obj,
					v: {
						x: 1,
						y: 0,
					},
				}
			} else {
				return obj;
			}
		});
	}

	private resolveCell(objects: IGameBoardObject[], board: IGameBoard, x: number, y: number) {
		objects.forEach((obj) => {
			if (typeof (obj as any).v !== 'undefined') {
				const actor = obj as IGameBoardMovableObject;
				const { v = null } = actor;

				if (v !== null) {
					const n = {
						x: v.x !== 0 ? v.x / Math.abs(v.x) : 0,
						y: v.y !== 0 ? v.y / Math.abs(v.y) : 0,
					};

					if (n.x != 0 || n.y != 0) {
						const targetCellObjects = board.get(x + n.x, y + n.y, null);
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
								actor.x = x + n.x;
								actor.y = y + n.y;
								board.add(actor.x, actor.y, actor);
							}
						}
					}
				}
			}
		});
	}

	public move(objects: IGameBoardObject[], board: IGameBoard): void {
		objects.forEach((obj) => {
			board.remove(obj.x, obj.y, obj);
			board.add(obj.x, obj.y, obj);
		});

		for (let x = 0; x < board.sizeX; x++) {
			for (let y = 0; y < board.sizeY; y++) {
				const objects = board.get(x, y);
				this.resolveCell(objects, board, x, y);
			}
		}

		for (let x = board.sizeX - 1; x >= 0; x--) {
			for (let y = board.sizeY - 1; y >= 0; y--) {
				const objects = board.get(x, y);
				this.resolveCell(objects, board, x, y);
			}
		}
	}
}
