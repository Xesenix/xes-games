import { Container } from 'inversify';
import { Board } from 'lib/game/board/board';

import { AncientMaze } from './ancient-maze';

const KEY_ITEM_TYPE = Symbol.for('KEY_ITEM_TYPE');

describe('map 1', () => {
	it('should have solution', () => {
		const inputBuffer = [
			'left', 'up', 'right', 'down', 'down', 'left', 'right', 'right', 'up', 'right',
			'down', 'down', 'right', 'right', 'right', 'up', 'up', 'right', 'up', 'right',
			'up', 'up', 'right', 'up', 'left', 'left', 'down', 'down', 'up', 'up', 'right',
			'down', 'right', 'right', 'up', 'right', 'down', 'down', 'down',
		];
		const container = new Container();
		container.bind('state').toConstantValue({
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

		const game = new AncientMaze(container);
		game.boot();
	});

	it('should have better solution', () => {
		const inputBuffer = [
			'left', 'up', 'up', 'right', 'down', 'down', 'left', 'right',
			'right', 'right', 'down', 'down', 'right', 'right', 'right',
			'up', 'right', 'up', 'up', 'up', 'right', 'up', 'left', 'left',
			'down', 'down', 'up', 'up', 'right', 'right', 'right', 'up',
			'right', 'down', 'down', 'down',
		];
	});
});
