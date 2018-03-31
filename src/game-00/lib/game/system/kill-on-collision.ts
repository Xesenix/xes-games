import { IGameBoard, IGameBoardObject, IGameBoardMovableObject } from 'lib/game/board/interface';
import { KILL_ON_COLLISION_OBJECT, DESTRUCTIBLE_OBJECT } from 'lib/game/sokobana/algorithm';

export default class KillOnCollisionSystem {
	constructor(
		public kill = (target: IGameBoardObject) => {},
	) { }

	update(objects: IGameBoardObject[], board: IGameBoard) {
		objects.forEach((obj) => {
			// kill on collision
			if ((obj.type & KILL_ON_COLLISION_OBJECT) == KILL_ON_COLLISION_OBJECT && typeof (obj as any).v !== 'undefined') {
				const actor = obj as IGameBoardMovableObject;
				const { v = null } = actor;

				if (v !== null) {
					const n = {
						x: v.x !== 0 ? v.x / Math.abs(v.x) : 0,
						y: v.y !== 0 ? v.y / Math.abs(v.y) : 0,
					};

					if (n.x != 0 || n.y != 0) {
						const targetCellObjects = board.get(actor.x + n.x, actor.y + n.y, null);
						// is it out of bound?
						if (targetCellObjects !== null) {
							// is it empty?
							// TODO: check collision group
							targetCellObjects.forEach((target) => {
								if ((target.type & DESTRUCTIBLE_OBJECT) == DESTRUCTIBLE_OBJECT) {
									this.kill(target);
								}
							});
						}
					}
				}
			}
		});
	}
}
