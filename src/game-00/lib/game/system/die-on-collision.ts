import { IGameBoard, IGameBoardObject, IGameBoardMovableObject } from 'lib/game/board/interface';
import { DESTROY_ON_COLLISION_OBJECT } from 'lib/game/sokobana/algorithm';

export default class DieOnCollisionSystem {
	constructor(
		public kill = (target: IGameBoardObject) => {},
	) { }

	update(objects: IGameBoardObject[], board: IGameBoard) {
		objects.forEach((obj) => {
			// destroyed on collision
			if ((obj.type & DESTROY_ON_COLLISION_OBJECT) == DESTROY_ON_COLLISION_OBJECT && typeof (obj as any).v !== 'undefined') {
				const actor = obj as IGameBoardMovableObject;
				const { v = null } = actor;

				if (v !== null) {
					const n = {
						x: v.x !== 0 ? v.x / Math.abs(v.x) : 0,
						y: v.y !== 0 ? v.y / Math.abs(v.y) : 0,
					};

					if (n.x != 0 || n.y != 0) {
						const targetCellObjects = board.get(actor.x + n.x, actor.y + n.y, null);
						if (targetCellObjects === null || targetCellObjects.length > 0) {
							// TODO: check collision group
							this.kill(obj);
						}
					}
				}
			}
		});
	}
}
