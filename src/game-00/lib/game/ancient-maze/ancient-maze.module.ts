import { ContainerModule, interfaces } from 'inversify';
import Algorithm from 'lib/game/ancient-maze/algorithm';
import { IAncientMazeState } from 'lib/game/ancient-maze/ancient-maze';
import ArrowSystem from 'lib/game/ancient-maze/system/arrow-system';
import CollectableSystem from 'lib/game/ancient-maze/system/collectable';
import DeadBodiesSystem from 'lib/game/ancient-maze/system/dead-bodies';
import EndPortalSystem from 'lib/game/ancient-maze/system/end-portal';
import RockSystem from 'lib/game/ancient-maze/system/rock-system';
import { IGameBoardObject, IGameObjectState } from 'lib/game/board/interface';
import CollisionSystem from 'lib/game/system/collision';
import LifespanSystem from 'lib/game/system/lifespan';
import MapSystem from 'lib/game/system/map';
import SpawnSystem from 'lib/game/system/spawn';

import AncientMaze from './ancient-maze';
import { ObjectFactory } from './object-factory';

export const AncientMazeModule = () => new ContainerModule((bind: interfaces.Bind) => {
	console.log('=== AncientMazeModule ===');
	const kill = (target: IGameBoardObject<IGameObjectState>) => {
		target.state = { ...target.state, alive: false };
	};

	bind('kill').toConstantValue(kill);

	bind<ObjectFactory<IGameObjectState, IAncientMazeState<IGameObjectState>>>('game-objects-factory')
		.to(ObjectFactory)
		.inSingletonScope();

	bind<CollisionSystem<IGameObjectState>>('collision-system').to(CollisionSystem).inSingletonScope();
	bind<LifespanSystem>('lifespan-system').to(LifespanSystem).inSingletonScope();
	bind<ArrowSystem>('arrow-system').to(ArrowSystem).inSingletonScope();
	bind<RockSystem>('rock-system').to(RockSystem).inSingletonScope();
	bind<MapSystem>('map-system').to(MapSystem).inSingletonScope();
	bind<DeadBodiesSystem>('dead-bodies-system').to(DeadBodiesSystem).inSingletonScope();
	bind<CollectableSystem>('collectable-system').to(CollectableSystem).inSingletonScope();
	bind<SpawnSystem>('spawner-system').to(SpawnSystem).inSingletonScope();
	bind<EndPortalSystem>('exit-system').to(EndPortalSystem).inSingletonScope();

	bind<Algorithm<IAncientMazeState>>('game-engine').to(Algorithm).inSingletonScope();
	bind<AncientMaze<IAncientMazeState>>('game').to(AncientMaze);
	console.log('/// AncientMazeModule ///');
});