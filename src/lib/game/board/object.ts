import { IGameBoardObject, IGameObjectState } from './interface';

export class GameBoardObject<T extends IGameObjectState> implements IGameBoardObject<T> {
	/**
	 * Creates an instance of GameBoardObject.
	 */
	public constructor(
		public id: number,
		public type: symbol,
		public aspects: symbol[],
		public collisionGroup: number = 0,
		public state: T = {
			alive: true,
			position: {
				x: 0,
				y: 0,
			},
		} as T,
	) { }
}
