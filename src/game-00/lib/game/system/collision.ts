import { IGameBoard, IGameBoardMovableObject, IGameBoardObject } from 'lib/game/board/interface';

export default class CollisionSystem {
	constructor(
		public onCollision = (source: IGameBoardMovableObject, target: IGameBoardObject, impact: number) => {},
		public filter = (obj: IGameBoardObject) => true,
	) { }

	update(objects: IGameBoardObject[], board: IGameBoard) {
		objects.forEach((obj) => {
			if (this.filter(obj)) {
				const { n = { x: 0, y: 0 }, position, steps = 0 } = obj.state;

				if (n.x != 0 || n.y != 0) {
					const targetCellObjects = board.get(position.x + n.x, position.y + n.y, null);
					// is it out of bound?
					if (targetCellObjects !== null) {
						// is it empty?
						// TODO: check collision group
						targetCellObjects.forEach((target) => {
							obj.state.steps = 0;
							this.onCollision(obj, target, Math.abs(steps - target.state.steps));
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
