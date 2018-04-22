import { inject } from 'lib/di';
import { ObjectFactory } from 'lib/game/ancient-maze/object-factory';
import { IGameBoard, IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';

export const SPAWNER_OBJECT_ASPECT = Symbol.for('SPAWNER_OBJECT_ASPECT');

@inject(['game-objects-factory'])
export default class SpawnSystem<T extends IGameObjectState, S extends { objects: IGameBoardObject<T>[], board: IGameBoard<T> }> {
	constructor(
		private builder: ObjectFactory<T, S>,
	) { }

	public update(state: S) {
		const { objects } = state;
		const spawned: IGameBoardObject<T>[] = [];
		objects.forEach((obj: IGameBoardObject<T>) => {
			if (obj.aspects.includes(SPAWNER_OBJECT_ASPECT)) {
				if (!!obj.state.spawnFactoryId) {
					const created: IGameBoardObject<T> = this.builder.create(obj.state.spawnFactoryId, obj.state.position, obj.state.direction);

					spawned.push(created);
				}
			}
		});

		console.log('spawned', spawned);
		objects.push(...spawned);
	}
}
