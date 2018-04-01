import GameBoardObject from './object';
import { IGameBoard, IGameBoardMovableObject, IMovableGameObjectState, IGameBoardObject } from './interface';

export default class GameBoardMovableObject<T extends IMovableGameObjectState> extends GameBoardObject<T> implements IGameBoardMovableObject<T> {
	public constructor(
		public id: number = 0,
		public type: number = 0,
		public collisionGroups = 0b1,
		public state: T = {
			alive: true,
			appearance: 0,
			position: {
				x: 0,
				y: 0,
			},
			direction: { x: 0, y: 0 },
			steps: 0,
			speed: 0,
			n: { x: 0, y: 0 },
		} as T,
	) {
		super(id, type, collisionGroups, state);
	}

	public commandMoveUp() {
		this.state.n = {
			x: 0,
			y: -1,
		};
		this.state.steps = this.state.speed;
	}

	public commandMoveDown() {
		this.state.n = {
			x: 0,
			y: 1,
		};
		this.state.steps = this.state.speed;
	}

	public commandMoveLeft() {
		this.state.n = {
			x: -1,
			y: 0,
		};
		this.state.steps = this.state.speed;
	}

	public commandMoveRight() {
		this.state.n = {
			x: 1,
			y: 0,
		};
		this.state.steps = this.state.speed;
	}

	public commandMove() {
		this.state.n = {
			...this.state.direction,
		};
		this.state.steps = this.state.speed;
	}

	public update(gameObjects: IGameBoardObject<T>[], board: IGameBoard<T>): void {
		// this.state.steps = Math.max(0, this.state.steps - 1);
	}
}
