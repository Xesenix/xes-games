import { inject } from 'lib/di';
import { IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';
import { CollisionSystem } from 'lib/game/system/collision.system';
import { IOverlapableState, OverlapSystem } from 'lib/game/system/overlap.system';

const ARROW_OBJECT_ASPECT = Symbol.for('ARROW_OBJECT_ASPECT');
const ARROW_TARGET_ASPECT = Symbol.for('ARROW_TARGET_ASPECT');
const ARROW_KILLABLE_ASPECT = Symbol.for('ARROW_KILLABLE_ASPECT');
const COLLISION_ASPECT = Symbol.for('COLLISION_ASPECT');

@inject(['kill', 'collision-system'])
export class ArrowSystem<T extends IGameObjectState, S extends IOverlapableState<T>> {
	private overlapSystem: OverlapSystem<T, S>;

	constructor(
		private kill: (target: IGameBoardObject<T>) => void,
		private collisionSystem: CollisionSystem<T, S>,
	) {
		this.overlapSystem = new OverlapSystem<T, S>(ARROW_OBJECT_ASPECT, ARROW_TARGET_ASPECT,
			(state: S, arrow: IGameBoardObject<T>, target: IGameBoardObject<T>) => {
				if (arrow.state.alive) {
					if (target.aspects.includes(ARROW_KILLABLE_ASPECT)) {
						kill(target);
					}
					kill(arrow);
				}
			},
		);

		this.collisionSystem.listenToCollision(this.onCollision.bind(this));
	}

	public update(state: S): void {
		this.overlapSystem.update(state);
	}

	private onCollision(source: IGameBoardObject<T>, target: IGameBoardObject<T>): void {
		if (source.aspects.includes(ARROW_OBJECT_ASPECT) && !!target && target.aspects.includes(COLLISION_ASPECT)) {
			this.kill(source);
		}
	}
}
