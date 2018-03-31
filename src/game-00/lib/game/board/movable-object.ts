import { IGameBoard } from 'lib/game/sokobana/algorithm';
import GameBoardObject from './object';
import { IGameBoardMovableObject } from './interface';

export default class GameBoardMovableObject extends GameBoardObject implements IGameBoardMovableObject {
	public v: { x: number, y: number } = { x: 0, y: 0 };
	public steps: number = 0;

	public constructor(
		public id: number = 0,
		public appearance: number = 0,
		public type: number = 0,
		public state: number = 0,
		public x: number = 0,
		public y: number = 0,
		public direction: { x: number, y: number } = { x: 0, y: 0 },
	) {
		super(id, appearance, type, state, x, y);
	}

	public commandMoveUp() {
		this.v = {
			x: 0,
			y: -1,
		};
		this.steps = 1;
	}

	public commandMoveDown() {
		this.v = {
			x: 0,
			y: 1,
		};
		this.steps = 1;
	}

	public commandMoveLeft() {
		this.v = {
			x: -1,
			y: 0,
		};
		this.steps = 1;
	}

	public commandMoveRight() {
		this.v = {
			x: 1,
			y: 0,
		};
		this.steps = 1;
	}

	public commandMove() {
		this.v = {
			...this.direction
		};
		this.steps = Math.max(Math.abs(this.direction.x), Math.abs(this.direction.y));
	}

	public update(gameObjects: IGameBoardObject[], board: IGameBoard): void {
		this.steps = Math.max(0, this.steps - 1);
	}
}
