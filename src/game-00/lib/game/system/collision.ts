import { inject } from 'lib/di';
import { IGameBoard, IGameBoardObject } from 'lib/game/board/interface';
import { COLLISION_ASPECT } from 'lib/game/sokobana/aspects';

// wall   = 0
// player = 1
// rock   = 2
// arrow  = 3
// floor  = 4
//
//   0 1 2 3 4
//  +-+-+-+-+-
// 0|1|1|1|1|0
// 1|1|1|1|0|0
// 2|1|1|1|1|0
// 3|1|0|0|0|0
// 4|0|0|0|0|0

@inject(['on-collision', 'on-collision-filter'])
export default class CollisionSystem<T> {
	private collisionMap = [
		[ true,  true,  true,  true, false],
		[ true,  true,  true,  true, false],
		[ true,  true,  true,  true, false],
		[ true,  true,  true, false, false],
		[false, false, false, false, false],
	];

	constructor(
		public onCollision = (source: IGameBoardObject, target: IGameBoardObject, impact: number) => true,
		public filter = (obj: IGameBoardObject) => true,
	) { }

	public checkCollision(obj: IGameBoardObject<T>, targets: IGameBoardObject<T>[]): boolean {
		// check out of bound
		if (targets === null) {
			return true;
		}

		return targets.reduce((result: boolean, target: IGameBoardObject<T>) => result || this.collisionMap[obj.collisionGroup][target.collisionGroup], false);
	}

	update(objects: IGameBoardObject[], board: IGameBoard) {
		objects.forEach((obj) => {
			if ((obj.type & COLLISION_ASPECT) === COLLISION_ASPECT && this.filter(obj)) {
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
							if ((target.type & COLLISION_ASPECT) === COLLISION_ASPECT && this.checkCollision(obj, [target]) && (ts === 0 || n.x !== tn.x || n.y != tn.y)) {
								this.onCollision(obj, target, Math.abs(steps - ts));
								console.log('stop', obj);
								obj.state.steps = 0;
							}
						});
					} else {
						obj.state.steps = 0;
						this.onCollision(obj, null, steps);
						console.log('stop', obj);
					}
				}
			}
		});
	}
}
