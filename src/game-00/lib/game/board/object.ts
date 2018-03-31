import { IGameBoardObject, IGameBoard } from './interface';

export default class GameBoardObject implements IGameBoardObject {
	public constructor(
		public id: number = 0,
		public appearance: number = 0,
		public type: number = 0,
		public state: number = 0,
		public x: number = 0,
		public y: number = 0,
		public direction: { x: number, y: number } = { x: 0, y: 0 },
	) { }

	public commandAction() {

	}

	public update(gameObjects: IGameBoardObject[], board: IGameBoard): void {

	}
}
