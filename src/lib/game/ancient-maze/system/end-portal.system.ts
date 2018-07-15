import { injectable } from 'lib/di';
import { IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';
import { IOverlapableState, OverlapSystem } from 'lib/game/system/overlap.system';

export interface IFinishableState<T extends IGameObjectState> extends IOverlapableState<T> {
	objects: IGameBoardObject<T>[];
	initialCollectableCount: { [key: number]: number };
	collected: { [key: number]: number };
	finished: boolean;
}

const ACTOR_ASPECT = Symbol.for('ACTOR_ASPECT');
const EXIT_ASPECT = Symbol.for('EXIT_ASPECT');

@injectable()
export class EndPortalSystem<T extends IGameObjectState, S extends IFinishableState<T>> {
	private overlapSystem: OverlapSystem<T, S>;

	constructor() {
		this.overlapSystem = new OverlapSystem<T, S>(EXIT_ASPECT, ACTOR_ASPECT,
			(state: S, visitable: IGameBoardObject<T>, visitor: IGameBoardObject<T>) => {
				const { keyItemId = Symbol.for('KEY_ITEM_TYPE') } = visitable.state;
				state.finished = state.collected[keyItemId] === state.initialCollectableCount[keyItemId];
				console.log('finished?', state.finished, visitable, visitor, state.collected, state.initialCollectableCount);
			},
		);
	}

	public update(state: S): void {
		this.overlapSystem.update(state);
	}
}
