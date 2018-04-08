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
		public onCollision = (source: IGameBoardObject, target: IGameBoardObject, impact: number) => {},
		public onOverlap = (source: IGameBoardObject, target: IGameBoardObject) => {},
		public filter = (obj: IGameBoardObject) => true,
	) { }

	public checkCollision(obj: IGameBoardObject<T>, targets: IGameBoardObject<T>[]): boolean {
		return this.collectCollisions(obj, targets).length > 0;
	}

	public collectCollisions(source: IGameBoardObject, targets: IGameBoardObject[]) {
		if (targets === null) {
			return [null];
		}
		return targets.filter((target: IGameBoardObject<T>) => this.collisionMap[source.collisionGroup][target.collisionGroup]);
	}

	update(objects: IGameBoardObject[], board: IGameBoard) {
		objects.filter(obj => obj.state.collided).forEach(obj => {
			const { n = { x: 0, y: 0 }, position = { x: 0, y: 0 } } = obj.state as any;
			const targetCellObjects = board.get(position.x + n.x, position.y + n.y, null);
			console.log('collision', obj, targetCellObjects);
			this.collectCollisions(obj, targetCellObjects).forEach(target => this.onCollision(obj, target, 0));
		});
	}
}
