import { inject } from 'lib/di';
import { IGameBoard, IGameBoardObject } from 'lib/game/board/interface';

@inject(['on-collision', 'on-collision-filter'])
export default class CollisionSystem<T> {
	constructor(
		public onCollision = (source: IGameBoardObject, target: IGameBoardObject, impact: number) => true,
		public filter = (obj: IGameBoardObject) => true,
	) { }

	public checkCollision(obj: IGameBoardObject<T>, targets: IGameBoardObject<T>[]): boolean {
		// check out of bound
		if (targets === null) {
			return true;
		}
		return targets.reduce((result: boolean, target: IGameBoardObject<T>) => result || (target.collisionGroups & obj.collisionGroups) > 0, false);
	}

	update(objects: IGameBoardObject[], board: IGameBoard) {
		objects.forEach((obj) => {
			if (this.filter(obj)) {
				const { n = { x: 0, y: 0 }, position, steps = 0 } = obj.state;

				if (steps > 0 && (n.x != 0 || n.y != 0)) {
					const targetCellObjects = board.get(position.x + n.x, position.y + n.y, null);
					// is it out of bound?
					if (targetCellObjects !== null) {
						// is it empty?
						// TODO: check collision group
						targetCellObjects.forEach((target) => {
							const tn = target.state.n || { x: 0, y: 0 };
							const ts = target.state.steps || 0;
							if (this.checkCollision(obj, [target]) && (ts === 0 || n.x !== tn.x || n.y != tn.y)) {
								if (this.onCollision(obj, target, Math.abs(steps - ts))) {
									obj.state.steps = 0;
								}
							}
						});
					} else {
						obj.state.steps = 0;
						this.onCollision(obj, null, steps);
					}
				}
			}
		});
	}
}
