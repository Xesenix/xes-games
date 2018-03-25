import { IGameBoard } from 'lib/game/sokobana/algorithm';
import { inject } from 'lib/di';
import { IGameBoardObject } from './interface';

@inject(['board:size-x', 'board:size-y'])
export default class Board implements IGameBoard {
	private data: Array<Array<IGameBoardObject[]>>;

	constructor(
		public sizeX: number,
		public sizeY: number,
	) {
		const board = new Array<Array<number>>(sizeY);
		board.fill([]);
		this.data = board.map(() => (new Array<IGameBoardObject[]>(sizeX)).fill([]).map(() => []));
	}

	get(x: number, y: number, defaultValue: IGameBoardObject[]): IGameBoardObject[] {
		if (0 <= x && x < this.sizeX && 0 <= y && y < this.sizeY) {
			return typeof this.data[y][x] !== 'undefined' ? this.data[y][x] : defaultValue;
		}

		return defaultValue;
	}

	set(x: number, y: number, v: IGameBoardObject[]): void {
		if (0 <= x && x < this.sizeX && 0 <= y && y < this.sizeY) {
			this.data[y][x] = v.map(obj => {
				obj.x = x;
				obj.y = y;

				return obj;
			});
		}
	}

	add(x: number, y: number, v: IGameBoardObject): void {
		if (0 <= x && x < this.sizeX && 0 <= y && y < this.sizeY) {
			v.x = x;
			v.y = y;
			this.data[y][x].push(v);
		}
	}

	remove(x: number, y: number, v: IGameBoardObject): void {
		if (0 <= x && x < this.sizeX && 0 <= y && y < this.sizeY) {
			this.data[v.y][v.x] = this.data[v.y][v.x].filter(item => item.id !== v.id);
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
