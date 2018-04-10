import { IGameBoardObject } from 'lib/game/board/interface';
import { IGameBoard } from 'lib/game/game-board';
import { SPAWNER_OBJECT_ASPECT } from 'lib/game/sokobana/aspects';

export default class SpawnSystem {
	constructor(
		private factories: { [key: string]: (x: number, y: number, dx: number, dy: number) => IGameBoardObject[] } = {},
	) { }

	public update(objects: IGameBoardObject[], board: IGameBoard) {
		const spawned = [];
		objects.forEach((obj: IGameBoardObject) => {
			if ((obj.type & SPAWNER_OBJECT_ASPECT) === SPAWNER_OBJECT_ASPECT) {
				const factory = this.factories[obj.state.spawnFactoryId];

				if (!!factory) {
					console.log('spawn', obj);
					const created: IGameBoardObject = factory(obj.state.position.x, obj.state.position.y, obj.state.direction.x, obj.state.direction.y);

					spawned.push(...created);
				}
			}
		});
		console.log('spawned', spawned);
		objects.push(...spawned);
	}
}
