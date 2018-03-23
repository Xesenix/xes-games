import { IGameBoard } from 'lib/game/interface';

export const MOVING_UP_CELL = 0b0001;
export const MOVING_DOWN_CELL = 0b0010;
export const MOVING_LEFT_CELL = 0b0100;
export const MOVING_RIGHT_CELL = 0b1000;

export const EMPTY_CELL = 0b00000000;
export const WALL_CELL = 0b00010000;
export const PLAYER_CELL = 0b00100000;
export const ARROW_CELL = 0b01000000;

export default class SokobanaAlgorithm {
	public moveUp(board: IGameBoard): IGameBoard {
		const newBoard = board.clone();
		for (let x = 0; x < newBoard.sizeX; x++) {
			for (let y = 0; y < newBoard.sizeY; y++) {
				const v = board.get(x, y);
				if (v & PLAYER_CELL) {
					newBoard.set(x, y, PLAYER_CELL | MOVING_UP_CELL);
				}
			}
		}

		return newBoard;
	}

	public moveDown(board: IGameBoard): IGameBoard {
		const newBoard = board.clone();
		for (let x = 0; x < newBoard.sizeX; x++) {
			for (let y = 0; y < newBoard.sizeY; y++) {
				const v = board.get(x, y);
				if (v & PLAYER_CELL) {
					newBoard.set(x, y, PLAYER_CELL | MOVING_DOWN_CELL);
				}
			}
		}

		return newBoard;
	}

	public moveLeft(board: IGameBoard): IGameBoard {
		const newBoard = board.clone();
		for (let x = 0; x < newBoard.sizeX; x++) {
			for (let y = 0; y < newBoard.sizeY; y++) {
				const v = board.get(x, y);
				if (v & PLAYER_CELL) {
					newBoard.set(x, y, PLAYER_CELL | MOVING_LEFT_CELL);
				}
			}
		}

		return newBoard;
	}

	public moveRight(board: IGameBoard): IGameBoard {
		const newBoard = board.clone();
		for (let x = 0; x < newBoard.sizeX; x++) {
			for (let y = 0; y < newBoard.sizeY; y++) {
				const v = board.get(x, y);
				if (v & PLAYER_CELL) {
					newBoard.set(x, y, PLAYER_CELL | MOVING_RIGHT_CELL);
				}
			}
		}

		return newBoard;
	}

	private resolveCell(newBoard, x, y, cell) {
		let v = { x: 0, y: 0 };
		if ((cell & MOVING_UP_CELL) > 0) {
			v.x = 0;
			v.y = -1;
		} else if ((cell & MOVING_DOWN_CELL) > 0) {
			v.x = 0;
			v.y = 1;
		} else if ((cell & MOVING_RIGHT_CELL) > 0) {
			v.x = 1;
			v.y = 0;
		} else if ((cell & MOVING_LEFT_CELL) > 0) {
			v.x = -1;
			v.y = 0;
		}

		if ((cell & PLAYER_CELL) > 0) {
			if (newBoard.get(x + v.x, y + v.y, WALL_CELL) === EMPTY_CELL) {
				newBoard.set(x + v.x, y + v.y, PLAYER_CELL);
				newBoard.set(x, y, EMPTY_CELL);
			}
		}

		if ((cell & ARROW_CELL) > 0) {
			if (newBoard.get(x + v.x, y + v.y, WALL_CELL) === EMPTY_CELL) {
				newBoard.set(x + v.x, y + v.y, cell);
				newBoard.set(x, y, EMPTY_CELL);
			}
		}
	}

	public move(board: IGameBoard): IGameBoard {
		const newBoard = board.clone();
		for (let x = 0; x < newBoard.sizeX; x++) {
			for (let y = 0; y < newBoard.sizeY; y++) {
				const cell = board.get(x, y);
				this.resolveCell(newBoard, x, y, cell);
			}
		}

		for (let x = newBoard.sizeX - 1; x >= 0; x--) {
			for (let y = newBoard.sizeY - 1; y >= 0; y--) {
				const cell = board.get(x, y);
				this.resolveCell(newBoard, x, y, cell);
			}
		}

		// stop players cells
		for (let x = 0; x < newBoard.sizeX; x++) {
			for (let y = 0; y < newBoard.sizeY; y++) {
				const v = newBoard.get(x, y);
				if ((v & PLAYER_CELL) > 0) {
					newBoard.set(x, y, PLAYER_CELL);
				}
			}
		}

		return newBoard;
	}
}
