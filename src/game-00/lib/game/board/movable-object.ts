import GameBoardObject from './object';
import { IGameBoardMovableObject } from './interface';

export default class GameBoardMovableObject extends GameBoardObject implements IGameBoardMovableObject {
	public constructor(
		public id: number = 0,
		public appearance: number = 0,
		public type: number = 0,
		public x: number = 0,
		public y: number = 0,
		public v: { x: number, y: number } = { x: 0, y: 0 },
	) {
		super(id, appearance, type, x, y);
	}
}
