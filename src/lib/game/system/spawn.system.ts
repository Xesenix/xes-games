import { inject } from 'lib/di';
import { ObjectFactory } from 'lib/game/ancient-maze/object-factory';
import { IGameBoard, IGameBoardObject, IGameObjectState, IMovableGameObjectState } from 'lib/game/board/interface';

export const SPAWNER_OBJECT_ASPECT = Symbol.for('SPAWNER_OBJECT_ASPECT');

@inject(['game-objects-factory'])
export class SpawnSystem<T extends (IGameObjectState | IMovableGameObjectState), S extends { objects: IGameBoardObject<T>[], board: IGameBoard<T> }> {
	constructor(
		private builder: ObjectFactory<T, S>,
	) { }

	public update(state: S) {
		const { objects } = state;
		const spawned: IGameBoardObject<T>[] = [];
		objects.forEach((obj: IGameBoardObject<T>) => {
			if (obj.aspects.includes(SPAWNER_OBJECT_ASPECT)) {
				if (!!obj.state.spawnFactoryId) {
					const { direction } = obj.state as IMovableGameObjectState;
					const created: IGameBoardObject<T> = this.builder.create(obj.state.spawnFactoryId, obj.state.position, direction);

					spawned.push(created);
				}
			}
		});

		console.log('spawned', spawned);
		objects.push(...spawned);
	}
}
