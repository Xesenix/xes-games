import { inject } from 'lib/di';
import { IGameBoard, IGameBoardObject } from 'lib/game/board/interface';
import { COLLISION_ASPECT } from 'lib/game/sokobana/aspects';
import { updateNonNullExpression } from 'typescript';

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

@inject(['on-collision', 'on-overlap', 'on-collision-filter'])
export default class CollisionSystem<T> {
	private collisionMap = [
		[ true,  true,  true,  true, false],
		[ true,  true,  true,  true, false],
		[ true,  true,  true, false, false],
		[ true, false,  true, false, false],
		[false, false, false, false, false],
	];

	constructor(
		public onCollision = (source: IGameBoardObject<T>, target: IGameBoardObject<T>, impact: number) => {},
		public onOverlap = (source: IGameBoardObject<T>, target: IGameBoardObject<T>) => {},
		public filter = (obj: IGameBoardObject<T>) => true,
	) { }

	public checkCollision(obj: IGameBoardObject<T>, targets: Array<IGameBoardObject<T>>): boolean {
		return this.collectCollisions(obj, targets).length > 0;
	}

	public collectCollisions(source: IGameBoardObject<T>, targets: Array<IGameBoardObject<T>>): void {
		if (targets === null) {
			return [null];
		}
		return targets.filter((target: IGameBoardObject<T>) => this.collisionMap[source.collisionGroup][target.collisionGroup]);
	}

	public update(objects: Array<IGameBoardObject<T>>, board: IGameBoard): void {
		objects
			.filter((obj: IGameBoardObject<T>) => obj.state.collided)
			.forEach((obj: IGameBoardObject<T>) => {
				const { n = { x: 0, y: 0 }, position = { x: 0, y: 0 } } = obj.state as any;
				const targetCellObjects: Array<IGameBoardObject> = board.get(position.x + n.x, position.y + n.y, null);
				this.collectCollisions(obj, targetCellObjects).forEach((target: IGameBoardObject) => this.onCollision(obj, target, 0));
			});
	}
}
