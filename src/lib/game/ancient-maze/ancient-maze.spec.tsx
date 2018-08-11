import { Container } from 'inversify';
import { injectable } from 'lib/di';
import { Board } from 'lib/game/board/board';
import { IGameObjectState, IMovableGameObjectState } from 'lib/game/board/interface';
import { IRenderer } from 'lib/renderer/react-renderer';

import { AncientMaze, IAncientMazeState } from './ancient-maze';
import { AncientMazeModule } from './ancient-maze.module';

type GO = (IGameObjectState | IMovableGameObjectState);

const KEY_ITEM_TYPE = Symbol.for('KEY_ITEM_TYPE');

@injectable()
class RendererMock implements IRenderer  {
	public setOutlet(component: any, outlet?: string) {
		return this;
	}

	public render() {
		return this;
	}
}

const prepareGameState = (inputBuffer) => ({
	objects: [],
	inputBuffer,
	finished: false,
	command: undefined,
	executedCommands: [],
	collected: { [KEY_ITEM_TYPE]: 0 },
	initialCollectableCount: { [KEY_ITEM_TYPE]: 0 },
	steps: 0,
	board: new Board(12, 9),
});

describe('ancient-maze->map 1', () => {
	let container: Container;

	beforeEach(() => {
		container = new Container();
		container.load(AncientMazeModule());
		container.bind<IRenderer>('ui:renderer').to(RendererMock).inSingletonScope();
		container.bind<Console>('debug:console').toConstantValue(console);
	});

	it('should have solution', () => {
		const inputBuffer = [
			'left', 'up', 'right', 'down', 'down', 'left', 'right', 'right', 'up', 'right',
			'down', 'down', 'right', 'right', 'right', 'up', 'up', 'right', 'up', 'right',
			'up', 'up', 'right', 'up', 'left', 'left', 'down', 'down', 'up', 'up', 'right',
			'down', 'right', 'right', 'up', 'right', 'down', 'down', 'down',
		];

		container.bind('game-state').toConstantValue(prepareGameState(inputBuffer));

		const game = container.get<AncientMaze<GO, IAncientMazeState<GO>>>('game');
		// TODO: use zone.js for testing async actions
		game.boot();

		expect(container.get<IAncientMazeState<GO>>('game-state').finished).toBe(true, `game didn't finish`);
	});

	it('should have better solution', () => {
		const inputBuffer = [
			'left', 'up', 'up', 'right', 'down', 'down', 'left', 'right',
			'right', 'right', 'down', 'down', 'right', 'right', 'right',
			'up', 'right', 'up', 'up', 'up', 'right', 'up', 'left', 'left',
			'down', 'down', 'up', 'up', 'right', 'right', 'right', 'up',
			'right', 'down', 'down', 'down',
		];

		container.bind('game-state').toConstantValue(prepareGameState(inputBuffer));

		const game = container.get<AncientMaze<GO, IAncientMazeState<GO>>>('game');
		// TODO: use zone.js for testing async actions
		game.boot();

		expect(container.get<IAncientMazeState<GO>>('game-state').finished).toBe(true, `game didn't finish`);
	});
});
