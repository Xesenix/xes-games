import { IGameBoard, IGameBoardObject } from './interface';

export default class GameBoardObjectSpawner {
	public spawned: IGameBoardObject[] = [];

	public constructor(
		public spawn: (x, y) => IGameBoardObject,
		public originX: number = 0,
		public originY: number = 0,
	) { }

	public commandAction() {
		this.spawned.push(this.spawn(this.originX, this.originY));
	}

	public update(gameObjects: IGameBoardObject[], board: IGameBoard): void {
		this.spawned.forEach(obj => {
			gameObjects.push(obj);
			board.add(this.originX, this.originY, obj);
		});
		this.spawned = [];
	}
}
