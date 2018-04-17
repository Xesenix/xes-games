import { ACTOR_ASPECT, EXIT_ASPECT } from 'lib/game/ancient-maze/aspects';
import { IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';
import OverlapSystem, { IOverlapableState } from 'lib/game/system/overlap';

export interface IFinishableState<T> extends IOverlapableState<T> {
	objects: IGameBoardObject<T>[];
	initialCollectableCount: { [key: number]: number };
	collected: { [key: number]: number };
	finished: boolean;
}

export default class EndPortalSystem<T extends IGameObjectState, S extends IFinishableState<T>> extends OverlapSystem<T, S> {
	constructor() {
		super(EXIT_ASPECT, ACTOR_ASPECT, (state: S, visitable: IGameBoardObject, visitor: IGameBoardObject) => {
			state.finished = state.collected[visitable.state.keyItemId] === state.initialCollectableCount[visitable.state.keyItemId];
		});
	}
}
