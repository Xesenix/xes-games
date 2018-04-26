import { ContainerModule, interfaces } from 'inversify';
import Algorithm from 'lib/game/ancient-maze/algorithm';
import { IAncientMazeState } from 'lib/game/ancient-maze/ancient-maze';
import ArrowSystem from 'lib/game/ancient-maze/system/arrow.system';
import CollectableSystem from 'lib/game/ancient-maze/system/collectable.system';
import DeadBodiesSystem from 'lib/game/ancient-maze/system/dead-bodies.system';
import EndPortalSystem from 'lib/game/ancient-maze/system/end-portal.system';
import RockSystem from 'lib/game/ancient-maze/system/rock.system';
import { IGameBoardObject, IGameObjectState, IMovableGameObjectState } from 'lib/game/board/interface';
import CollisionSystem from 'lib/game/system/collision.system';
import LifespanSystem from 'lib/game/system/lifespan.system';
import MapSystem from 'lib/game/system/map.system';
import SpawnSystem from 'lib/game/system/spawn.system';

import AncientMaze from './ancient-maze';
import { ObjectFactory } from './object-factory';

type GO = (IGameObjectState | IMovableGameObjectState);

export const AncientMazeModule = () => new ContainerModule((bind: interfaces.Bind) => {
	console.log('=== AncientMazeModule ===');
	const kill = (target: IGameBoardObject<IGameObjectState>) => {
		target.state = { ...target.state, alive: false };
	};

	bind('kill').toConstantValue(kill);

	bind<ObjectFactory<IGameObjectState, IAncientMazeState<IGameObjectState>>>('game-objects-factory')
		.to(ObjectFactory)
		.inSingletonScope();

	bind<CollisionSystem<GO, IAncientMazeState<GO>>>('collision-system').to(CollisionSystem).inSingletonScope();
	bind<LifespanSystem<GO, IAncientMazeState<GO>>>('lifespan-system').to(LifespanSystem).inSingletonScope();
	bind<ArrowSystem<GO, IAncientMazeState<GO>>>('arrow-system').to(ArrowSystem).inSingletonScope();
	bind<RockSystem<GO>>('rock-system').to(RockSystem).inSingletonScope();
	bind<MapSystem<GO, IAncientMazeState<GO>>>('map-system').to(MapSystem).inSingletonScope();
	bind<DeadBodiesSystem<GO, IAncientMazeState<GO>>>('dead-bodies-system').to(DeadBodiesSystem).inSingletonScope();
	bind<CollectableSystem<GO, IAncientMazeState<GO>>>('collectable-system').to(CollectableSystem).inSingletonScope();
	bind<SpawnSystem<GO, IAncientMazeState<GO>>>('spawner-system').to(SpawnSystem).inSingletonScope();
	bind<EndPortalSystem<GO, IAncientMazeState<GO>>>('exit-system').to(EndPortalSystem).inSingletonScope();

	bind<Algorithm<GO, IAncientMazeState<GO>>>('game-engine').to(Algorithm).inSingletonScope();
	bind<AncientMaze<GO, IAncientMazeState<GO>>>('game').to(AncientMaze);
	console.log('/// AncientMazeModule ///');
});
