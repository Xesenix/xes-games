import { IGameBoard } from 'lib/game/sokobana/algorithm';
import { inject } from 'lib/di';

@inject(['board:size-x', 'board:size-y'])
export default class Board implements IGameBoard {
	private data: Array<Array<number>>;

	constructor(
		public sizeX: number,
		public sizeY: number,
	) {
		const board = new Array<Array<number>>(sizeY);
		board.fill(0);
		this.data = board.map(() => (new Array<number>(sizeX)).fill(0));
	}

	get(x: number, y: number, defaultValue: number): number {
		if (0 <= x && x < this.sizeX && 0 <= y && y < this.sizeY) {
			return typeof this.data[y][x] !== 'undefined' ? this.data[y][x] : defaultValue;
		}

		return defaultValue;
	}

	set(x: number, y: number, v: number): void {
		if (0 <= x && x < this.sizeX && 0 <= y && y < this.sizeY) {
			this.data[y][x] = v;
		}
	}

	tiles() {
		return [].concat.apply([], this.data.map((row, y) => row.map((v, x) => ({ x, y, v }))));
	}

	clone(): IGameBoard {
		const board = new Board(this.sizeX, this.sizeY);
		board.data = board.data.map((row, y) => row.map((v, x) => this.data[y][x]));
		return board;
	}
}
