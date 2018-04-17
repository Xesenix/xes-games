import { COLLECTABLE_ASPECT, COLLECTOR_ASPECT } from 'lib/game/ancient-maze/aspects';
import { IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';
import OverlapSystem, { IOverlapableState } from 'lib/game/system/overlap';

export interface ICollectableState<T> extends IOverlapableState<T> {
	objects: IGameBoardObject<T>[];
	initialCollectableCount: { [key: number]: number };
	collected: { [key: number]: number };
}

export default class CollectableSystem<T extends IGameObjectState, S extends ICollectableState<T>> extends OverlapSystem<T, S> {
	constructor() {
		super(COLLECTABLE_ASPECT, COLLECTOR_ASPECT, (state: S, visitable: IGameBoardObject<T>, visitor: IGameBoardObject<T>) => {
			if (visitable.state.alive) {
				state.collected[visitable.state.collectableId] ++;
				visitable.state.alive = false;
			}
		});
	}

	public onLevelInit(state: S): void {
		state.objects.forEach((obj) => {
			if ((obj.type & COLLECTABLE_ASPECT) === COLLECTABLE_ASPECT) {
				state.initialCollectableCount[obj.state.collectableId] ++;
			}
		});
	}
}
