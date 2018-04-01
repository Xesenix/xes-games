import { IGameBoard } from 'lib/game/sokobana/algorithm';
import { inject } from 'lib/di';
import { IGameBoardObject, IGameObjectState } from './interface';

@inject(['board:size-x', 'board:size-y'])
export default class Board<T extends IGameObjectState> implements IGameBoard<T> {
	private data: Array<Array<IGameBoardObject<T>[]>>;

	constructor(
		public sizeX: number,
		public sizeY: number,
	) {
		const board = new Array<Array<number>>(sizeY);
		board.fill([]);
		this.data = board.map(() => (new Array<IGameBoardObject<T>[]>(sizeX)).fill([]).map(() => []));
	}

	get(x: number, y: number, defaultValue: IGameBoardObject<T>[]): IGameBoardObject<T>[] {
		if (0 <= x && x < this.sizeX && 0 <= y && y < this.sizeY) {
			return typeof this.data[y][x] !== 'undefined' ? this.data[y][x] : defaultValue;
		}

		return defaultValue;
	}

	set(x: number, y: number, v: IGameBoardObject<T>[]): void {
		if (0 <= x && x < this.sizeX && 0 <= y && y < this.sizeY) {
			this.data[y][x] = v.map(obj => {
				obj.state.position.x = x;
				obj.state.position.y = y;

				return obj;
			});
		}
	}

	add(x: number, y: number, v: IGameBoardObject<T>): void {
		if (0 <= x && x < this.sizeX && 0 <= y && y < this.sizeY) {
			v.state.position.x = x;
			v.state.position.y = y;
			this.data[y][x].push(v);
		}
	}

	remove(x: number, y: number, v: IGameBoardObject<T>): void {
		if (0 <= x && x < this.sizeX && 0 <= y && y < this.sizeY) {
			this.data[y][x] = this.data[y][x].filter(item => item.id !== v.id);
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
