import { IGameBoardObject } from './interface';

export default class GameBoardObject implements IGameBoardObject {
	public constructor(
		public id: number = 0,
		public appearance: number = 0,
		public type: number = 0,
		public x: number = 0,
		public y: number = 0,
	) { }
}
