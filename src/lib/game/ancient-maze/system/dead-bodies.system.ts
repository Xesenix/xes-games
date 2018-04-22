import { inject } from 'lib/di';
import { IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';
import ReplaceDeadWithBodySystem, { IMortalState } from 'lib/game/system/replace-dead-with-body.system';

@inject(['game-objects-factory'])
export default class DeadBodiesSystem<T extends IGameObjectState, S extends IMortalState<T>> extends ReplaceDeadWithBodySystem<T, S> {
	public update(state: S): void {
		super.update(state);

		// remove dead
		state.objects = state.objects.filter((obj: IGameBoardObject<T>) => {
			if (!obj.state.alive) {
				state.board.remove(obj.state.position.x, obj.state.position.y, obj);
				return false;
			}
			return true;
		});
	}
}
