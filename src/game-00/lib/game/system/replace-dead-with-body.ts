import { IGameBoardObject } from 'lib/game/board/interface';
import { IGameBoard } from 'lib/game/sokobana/algorithm';
import { DESTRUCTIBLE_OBJECT_ASPECT } from 'lib/game/sokobana/aspects';

export default class ReplaceDeadWithBodySystem {
	constructor(
		private factories: { [key: string]: (x: number, y: number, dx: number, dy: number) => IGameBoardObject[] } = {},
	) { }

	public update(objects: IGameBoardObject[], board: IGameBoard) {
		const spawned = [];
		objects.forEach((obj: IGameBoardObject) => {
			if (!obj.state.alive && (obj.type & DESTRUCTIBLE_OBJECT_ASPECT) === DESTRUCTIBLE_OBJECT_ASPECT) {
				console.log('die', obj);
				const factory = this.factories[obj.state.bodyFactoryId];

				if (!!factory) {
					const created: IGameBoardObject = factory(obj.state.position.x, obj.state.position.y, obj.state.direction.x, obj.state.direction.y);

					created.forEach((body: IGameBoardObject) => {
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
