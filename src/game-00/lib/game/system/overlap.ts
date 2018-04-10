import { IGameBoardObject } from 'lib/game/board/interface';
import { IGameBoard } from 'lib/game/sokobana/aspects';

export default class OverlapSystem {
	constructor(
		private visitableType: number,
		private visitorType: number,
		private onVisit: (visitable: IGameBoardObject, visitor: IGameBoardObject) => void,
	) { }

	public update(objects: Array<IGameBoardObject>, board: IGameBoard): void {
		objects.forEach((visitable: IGameBoardObject) => {
			if ((visitable.type & this.visitableType) === this.visitableType) {
				const visitors = board.get(visitable.state.position.x, visitable.state.position.y, null);

				if (!!visitors) {
					visitors.filter((visitor: IGameBoardObject) => visitor.id !== visitable.id).forEach((visitor: IGameBoardObject) => {
						if (visitable.state.alive && visitor.state.alive && (visitor.type & this.visitorType) === this.visitorType) {
							this.onVisit(visitable, visitor);
						}
					});
				}
			}
		});
	}
}
