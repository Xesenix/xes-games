import { IGameBoard, IGameBoardObject, IGameObjectState } from './interface';
import { SPAWNER_OBJECT_ASPECT } from 'game-00/lib/game/sokobana/aspects';

export default class GameBoardObjectSpawner<T extends IGameObjectState> {
	public spawned: IGameBoardObject<T>[] = [];

	public constructor(
		public id: number = 0,
		public type: number = SPAWNER_OBJECT_ASPECT,
		public collisionGroups = 0b1,
		public state: T = {
			alive: true,
			position: {
				x: 0,
				y: 0,
			},
		} as T,
		public spawn: (x, y) => IGameBoardObject<T>,
	) { }

	public commandAction() {
		const obj = this.spawn(this.state.position.x, this.state.position.y);
		obj.commandAction();
		this.spawned.push(obj);
	}

	public update(gameObjects: IGameBoardObject<T>[], board: IGameBoard<T>): void {
		this.spawned.forEach(obj => {
			const spawnTarget = board.get(this.state.position.x, this.state.position.y, null);
			console.log('spawn', this.state.position.x, this.state.position.y, obj, spawnTarget);
			// TODO: condition to let new spawn appear
			gameObjects.push(obj);
			board.add(this.state.position.x, this.state.position.y, obj);
			obj.update(gameObjects, board);
			console.log('spawn updated', board.get(this.state.position.x, this.state.position.y, null));
		});
		this.spawned = [];
	}
}
