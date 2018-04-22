import { inject } from 'lib/di';
import { ObjectFactory } from 'lib/game/ancient-maze/object-factory';
import { IGameBoard, IGameBoardObject, IGameObjectState, IMovableGameObjectState } from 'lib/game/board/interface';

export interface IMortalState<T extends IGameObjectState> {
	objects: IGameBoardObject<T>[];
	board: IGameBoard<T>;
}

const DESTRUCTIBLE_OBJECT_ASPECT = Symbol.for('DESTRUCTIBLE_OBJECT_ASPECT');

@inject(['game-objects-factory'])
export default class ReplaceDeadWithBodySystem<T extends IMovableGameObjectState, S extends IMortalState<T>> {
	constructor(
		private builder: ObjectFactory<T, S>,
	) { }

	public update(state: S) {
		const { objects, board } = state;
		const spawned: IGameBoardObject<T>[] = [];
		objects.forEach((obj: IGameBoardObject<T>) => {
			if (!obj.state.alive && obj.aspects.includes(DESTRUCTIBLE_OBJECT_ASPECT)) {
				if (!!obj.state.bodyFactoryId) {
					const created: IGameBoardObject<T> = this.builder.create(obj.state.bodyFactoryId, obj.state.position, obj.state.direction);
					const isCreated = board.addUnique(created.state.position.x, created.state.position.y, created);

					if (isCreated) {
						spawned.push(created);
					}
				}
			}
		});
		console.log('spawned bodies', spawned);
		objects.push(...spawned);
	}

}
