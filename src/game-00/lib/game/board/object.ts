import { IGameBoardObject, IGameObjectState } from './interface';

export default class GameBoardObject<T extends IGameObjectState> implements IGameBoardObject<T> {
	public constructor(
		public id: number = 0,
		public type: number = 0,
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
