import { IGameBoard } from 'lib/game/interface';
import { IGameBoardObject, IGameBoardMovableObject } from '../board/interface';

export const MOVABLE_OBJECT = 0b0001;
export const CONTROLLABLE_OBJECT = 0b0010;

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

	public update(objects: IGameBoardObject[], board: IGameBoard): void {
		objects.forEach((obj) => {
			obj.update(objects, board);
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
