import { inject } from 'lib/di';
import { IGameBoard } from 'lib/game/sokobana/aspects';

import { IGameBoardObject, IGameObjectState } from './interface';

@inject(['board:size-x', 'board:size-y'])
export default class Board<T extends IGameObjectState> implements IGameBoard<T> {
	private data: IGameBoardObject<T>[][];

	constructor(
		public sizeX: number,
		public sizeY: number,
	) {
		const board = new Array<number[]>(sizeY);
		board.fill([]);
		this.data = board.map(() => (new Array<IGameBoardObject<T>[]>(sizeX)).fill([]).map(() => []));
	}

	public get(x: number, y: number, defaultValue: IGameBoardObject<T>[]): IGameBoardObject<T>[] {
		if (0 <= x && x < this.sizeX && 0 <= y && y < this.sizeY) {
			return typeof this.data[y][x] !== 'undefined' ? this.data[y][x] : defaultValue;
		}

		return defaultValue;
	}

	public set(x: number, y: number, v: IGameBoardObject<T>[]): void {
		if (0 <= x && x < this.sizeX && 0 <= y && y < this.sizeY) {
			this.data[y][x] = v.map((obj: IGameBoardObject<T>) => {
				obj.state.position.x = x;
				obj.state.position.y = y;

				return obj;
			});
		}
	}

	public add(x: number, y: number, v: IGameBoardObject<T>): void {
		if (0 <= x && x < this.sizeX && 0 <= y && y < this.sizeY) {
			v.state.position.x = x;
			v.state.position.y = y;
			this.data[y][x].push(v);
		}
	}

	public addUnique(x: number, y: number, v: IGameBoardObject<T>): boolean {
		if (0 <= x && x < this.sizeX && 0 <= y && y < this.sizeY) {
			if (this.data[y][x].findIndex((el: IGameBoardObject<T>) => el.type === v.type) === -1) {
				v.state.position = {
					x,
					y,
				};
				this.data[y][x].push(v);

				return true;
			}
		}

		return false;
	}

	public remove(x: number, y: number, v: IGameBoardObject<T>): void {
		if (0 <= x && x < this.sizeX && 0 <= y && y < this.sizeY) {
			this.data[y][x] = this.data[y][x].filter((item: IGameBoardObject<T>) => item.id !== v.id);
		}
	}

	public tiles() {
		return [].concat.apply([], this.data.map((row, y) => row.map((v, x) => ({ x, y, v }))));
	}
}
