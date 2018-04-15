import { SPAWNER_OBJECT_ASPECT } from 'lib/game/ancient-maze/aspects';
import { IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';

export default class SpawnSystem<T extends IGameObjectState, S extends { objects: IGameBoardObject<T>[] }> {
	constructor(
		private factories: { [key: string]: (x: number, y: number, dx: number, dy: number) => IGameBoardObject<T>[] } = {},
	) { }

	public update(state: S) {
		const { objects } = state;
		const spawned: IGameBoardObject<T>[] = [];
		objects.forEach((obj: IGameBoardObject<T>) => {
			if ((obj.type & SPAWNER_OBJECT_ASPECT) === SPAWNER_OBJECT_ASPECT) {
				const factory = this.factories[obj.state.spawnFactoryId];

				if (!!factory) {
					const created: IGameBoardObject<T> = factory(obj.state.position.x, obj.state.position.y, obj.state.direction.x, obj.state.direction.y);

					spawned.push(...created);
				}
			}
		});
		objects.push(...spawned);
	}
}
