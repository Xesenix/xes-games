import { IGameBoard } from 'lib/game/sokobana/algorithm';
import GameBoardObject from './object';
import { IGameBoardMovableObject } from './interface';

export default class GameBoardMovableObject extends GameBoardObject implements IGameBoardMovableObject {
	public v: { x: number, y: number } = { x: 0, y: 0 };

	public constructor(
		public id: number = 0,
		public appearance: number = 0,
		public type: number = 0,
		public x: number = 0,
		public y: number = 0,
		public direction: { x: number, y: number } = { x: 0, y: 0 },
	) {
		super(id, appearance, type, x, y);
	}

	public commandMoveUp() {
		this.v = {
			x: 0,
			y: -1,
		};
	}

	public commandMoveDown() {
		this.v = {
			x: 0,
			y: 1,
		};
	}

	public commandMoveLeft() {
		this.v = {
			x: -1,
			y: 0,
		};
	}

	public commandMoveRight() {
		this.v = {
			x: 1,
			y: 0,
		};
	}

	public commandMove() {
		this.v = {
			...this.direction
		};
	}

	public update(gameObjects: IGameBoardObject[], board: IGameBoard): void {
		board.remove(this.x, this.y, this);
		board.add(this.x, this.y, this);
	}
}
