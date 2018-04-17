import { IGameBoard } from 'lib/game/ancient-maze/algorithm';
import { DESTRUCTIBLE_OBJECT_ASPECT } from 'lib/game/ancient-maze/aspects';
import { IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';

export interface IMortalState<T> {
	objects: IGameBoardObject<T>[];
	board: IGameBoard<T>;
}

export default class ReplaceDeadWithBodySystem<T extends IGameObjectState, S extends IMortalState<T>> {
	constructor(
		private factories: { [key: string]: (x: number, y: number, dx: number, dy: number) => IGameBoardObject<T>[] } = {},
	) { }

	public update(state: S) {
		const { objects, board } = state;
		const spawned = [];
		objects.forEach((obj: IGameBoardObject<T>) => {
			if (!obj.state.alive && (obj.type & DESTRUCTIBLE_OBJECT_ASPECT) === DESTRUCTIBLE_OBJECT_ASPECT) {
				console.log('die', obj);
				const factory = this.factories[obj.state.bodyFactoryId];

				if (!!factory) {
					const created: IGameBoardObject<T> = factory(obj.state.position.x, obj.state.position.y, obj.state.direction.x, obj.state.direction.y);

					created.forEach((body: IGameBoardObject<T>) => {
						const isCreated = board.addUnique(body.state.position.x, body.state.position.y, body);
						if (isCreated) {
							spawned.push(body);
						}
					});
				}
			}
		});
		objects.push(...spawned);
	}

}
