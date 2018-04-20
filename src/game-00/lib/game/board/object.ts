import { IGameBoardObject, IGameObjectState } from './interface';

export default class GameBoardObject<T extends IGameObjectState> implements IGameBoardObject<T> {
	/**
	 * Creates an instance of GameBoardObject.
	 * @param {number} id
	 * @param {symbol} type
	 * @param {symbol[]} aspects
	 * @param {number} [collisionGroup=0]
	 * @param {T} [state={
	 * 			alive: true,
	 * 			position: {
	 * 				x: 0,
	 * 				y: 0,
	 * 			},
	 * 		} as T]
	 * @memberof GameBoardObject
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
