import { inject } from 'lib/di';
import { IGameObjectState } from 'lib/game/board/interface';
import { IGameBoard, IGameBoardObject } from 'lib/game/board/interface';

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
export default class CollisionSystem<T extends IGameObjectState, S extends { objects: IGameBoardObject<T>[], board: IGameBoard<T> }> {
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

	public checkCollision(obj: IGameBoardObject<T>, targets: IGameBoardObject<T>[]): boolean {
		return this.collectCollisions(obj, targets).length > 0;
	}

	public collectCollisions(source: IGameBoardObject<T>, targets: IGameBoardObject<T>[]): IGameBoardObject<T>[] {
		if (targets === null) {
			return [ null ];
		}
		return targets.filter((target: IGameBoardObject<T>) => this.collisionMap[source.collisionGroup][target.collisionGroup]);
	}

	public update(state: S): void {
		const { objects, board } = state;
		objects
			.filter((obj: IGameBoardObject<T>) => obj.state.collided)
			.forEach((obj: IGameBoardObject<T>) => {
				const { n = { x: 0, y: 0 }, position = { x: 0, y: 0 } } = obj.state as any;
				const targetCellObjects: IGameBoardObject<T>[] = board.get(position.x + n.x, position.y + n.y, null);
				this.collectCollisions(obj, targetCellObjects).forEach((target: IGameBoardObject<T>) => this.onCollision(obj, target, 0));
			});
	}
}
