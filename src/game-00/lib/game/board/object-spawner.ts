import { IGameBoard, IGameBoardObject } from './interface';
import { SPAWNER_OBJECT } from 'game-00/lib/game/sokobana/algorithm';

export default class GameBoardObjectSpawner {
	public spawned: IGameBoardObject[] = [];

	public constructor(
		public spawn: (x, y) => IGameBoardObject,
		public originX: number = 0,
		public originY: number = 0,

		public type: number = SPAWNER_OBJECT,
	) { }

	public commandAction() {
		const obj = this.spawn(this.originX, this.originY);
		obj.commandAction();
		this.spawned.push(obj);
	}

	public update(gameObjects: IGameBoardObject[], board: IGameBoard): void {
		this.spawned.forEach(obj => {
			const spawnTarget = board.get(this.originX, this.originY);
			console.log('spawn', spawnTarget);
			// TODO: condition to let new spawn appear
			gameObjects.push(obj);
			board.add(this.originX, this.originY, obj);
			obj.update(gameObjects, board);
		});
		this.spawned = [];
	}
}
