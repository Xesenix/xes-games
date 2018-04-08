import { IGameBoard } from 'lib/game/sokobana/aspects';
import { IGameBoardObject } from 'lib/game/board/interface';

export default class OverlapSystem {
	constructor(
		private visitableType: number,
		private visitorType: number,
		private onVisit: (visitable: IGameBoardObject, visitor: IGameBoardObject) => void,
	) { }

	public update(objects: IGameBoardObject[], board: IGameBoard) {
		objects.forEach((visitable: IGameBoardObject) => {
			if ((visitable.type & this.visitableType) === this.visitableType) {
				const objects = board.get(visitable.state.position.x, visitable.state.position.y, null);

				if (!!objects) {
					objects.filter(visitor => visitor.id !== visitable.id).forEach(visitor => {
						if (visitable.state.alive && visitor.state.alive && (visitor.type & this.visitorType) === this.visitorType) {
							this.onVisit(visitable, visitor);
						}
					});
				}
			}
		});
	}
}
