import { ContainerModule, interfaces } from 'inversify';
import Algorithm from 'lib/game/ancient-maze/algorithm';
import { IAncientMazeState } from 'lib/game/ancient-maze/ancient-maze';
import ArrowSystem from 'lib/game/ancient-maze/system/arrow-system';
import { IGameBoardObject, IGameObjectState, IMovableGameObjectState } from 'lib/game/board/interface';
import CollisionSystem from 'lib/game/system/collision';
import LifespanSystem from 'lib/game/system/lifespan';
import { ROCK_APPEARANCE } from 'lib/game/system/map';

import AncientMaze from './ancient-maze';
import { DESTROY_OBJECT_ON_COLLISION_ASPECT, DESTRUCTIBLE_OBJECT_ASPECT, KILL_ON_COLLISION_OBJECT_ASPECT } from './aspects';

export const AncientMazeModule = () => new ContainerModule((bind: interfaces.Bind) => {
	const kill = (target: IGameBoardObject<IGameObjectState>) => {
		target.state = { ...target.state, alive: false };
	};

	bind('kill').toConstantValue(kill);

	bind('on-collision-filter').toConstantValue((obj: IGameBoardObject) => true);
	bind('on-collision').toConstantValue(
		(source: IGameBoardObject<IMovableGameObjectState>, target: IGameBoardObject<IGameObjectState>, impact: number) => {
			console.log('== collision', source, target);
			source.state.impact = impact;
			if ((source.type & KILL_ON_COLLISION_OBJECT_ASPECT) === KILL_ON_COLLISION_OBJECT_ASPECT) {
				if (target !== null && (target.type & DESTRUCTIBLE_OBJECT_ASPECT) === DESTRUCTIBLE_OBJECT_ASPECT) {
					// if target is rock only rock can kill it
					if (source.state.appearance === ROCK_APPEARANCE || target.state.appearance !== ROCK_APPEARANCE) {
						kill(target);
					}
				}
			}

			if ((source.type & DESTROY_OBJECT_ON_COLLISION_ASPECT) === DESTROY_OBJECT_ON_COLLISION_ASPECT) {
				kill(source);
			}
		},
	);
	bind<CollisionSystem<IGameObjectState>>('collision-system').to(CollisionSystem).inSingletonScope();

	bind<ArrowSystem>('arrow-system').to(ArrowSystem).inSingletonScope();

	bind<LifespanSystem>('lifespan-system').to(LifespanSystem).inSingletonScope();
	bind<Algorithm<IAncientMazeState>>('game-engine').to(Algorithm).inSingletonScope();
	bind<AncientMaze>('game').to(AncientMaze);
});
