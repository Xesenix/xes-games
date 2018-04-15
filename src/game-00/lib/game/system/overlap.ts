import { IGameBoard } from 'lib/game/ancient-maze/aspects';
import { IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';

export default class OverlapSystem<T extends IGameObjectState, S extends { objects: IGameBoardObject<T>[], board: IGameBoard<T> }> {
	constructor(
		private visitableType: number,
		private visitorType: number,
		private onVisit: (visitable: IGameBoardObject<T>, visitor: IGameBoardObject<T>) => void,
	) { }

	public update(state: S): void {
		const { objects, board } = state;
		objects.forEach((visitable: IGameBoardObject<T>) => {
			if ((visitable.type & this.visitableType) === this.visitableType) {
				const visitors = board.get(visitable.state.position.x, visitable.state.position.y, null);

				if (!!visitors) {
					visitors.filter((visitor: IGameBoardObject<T>) => visitor.id !== visitable.id).forEach((visitor: IGameBoardObject<T>) => {
						if (visitable.state.alive && visitor.state.alive && (visitor.type & this.visitorType) === this.visitorType) {
							this.onVisit(visitable, visitor);
						}
					});
				}
			}
		});
	}
}
