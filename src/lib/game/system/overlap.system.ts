import { injectable } from 'lib/di';
import { IGameBoard, IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';

export interface IOverlapableState<T extends IGameObjectState> {
	objects: IGameBoardObject<T>[];
	board: IGameBoard<T>;
}

@injectable()
export default class OverlapSystem<T extends IGameObjectState, S extends IOverlapableState<T>> {
	constructor(
		private visitableType: symbol,
		private visitorType: symbol,
		private onVisit: (state: S, visitable: IGameBoardObject<T>, visitor: IGameBoardObject<T>) => void,
	) { }

	public update(state: S): void {
		const { objects, board } = state;
		objects.forEach((visitable: IGameBoardObject<T>) => {
			if (visitable.aspects.includes(this.visitableType)) {
				const visitors = board.get(visitable.state.position.x, visitable.state.position.y, null);

				if (!!visitors) {
					visitors.filter((visitor: IGameBoardObject<T>) => visitor.id !== visitable.id).forEach((visitor: IGameBoardObject<T>) => {
						if (visitable.state.alive && visitor.state.alive && visitor.aspects.includes(this.visitorType)) {
							this.onVisit(state, visitable, visitor);
						}
					});
				}
			}
		});
	}
}
