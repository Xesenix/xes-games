import { inject } from 'lib/di';
import { IGameBoard, IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';
import { CollisionSystem } from 'lib/game/system/collision.system';

const ROCK_OBJECT_ASPECT = Symbol.for('ROCK_OBJECT_ASPECT');
const ROCK_TARGET_ASPECT = Symbol.for('ROCK_TARGET_ASPECT');

@inject(['kill', 'collision-system'])
export class RockSystem<T extends IGameObjectState> {
	constructor(
		private kill: (target: IGameBoardObject<T>) => void,
		collisionSystem: CollisionSystem<T, { objects: IGameBoardObject<T>[], board: IGameBoard<T> }>,
	) {
		this.kill = kill;

		collisionSystem.listenToCollision(this.onCollision.bind(this));
	}

	private onCollision(source: IGameBoardObject<T>, target: IGameBoardObject<T>): void {
		if (source.aspects.includes(ROCK_OBJECT_ASPECT) && !!target && target.aspects.includes(ROCK_TARGET_ASPECT)) {
			this.kill(target);
		}
	}
}
