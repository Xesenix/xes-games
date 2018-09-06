import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { EventEmitter } from 'events';
import { Container } from 'inversify';

import OutletComponent from 'game-00/components/outlet/outlet';
import { FlatDictionary } from 'lib/dictionary/flat-dictionary';
import { IDictionary } from 'lib/dictionary/interfaces';
import { AncientMaze } from 'lib/game/ancient-maze/ancient-maze';
import { IAncientMazeState } from 'lib/game/ancient-maze/ancient-maze';
import { AncientMazeModule } from 'lib/game/ancient-maze/ancient-maze.module';
import { Board } from 'lib/game/board/board';
import { IRenderer, ReactRenderer } from 'lib/renderer/react-renderer';

import { IGameObjectState } from 'lib/game/board/interface';

declare const process: any;

const KEY_ITEM_TYPE = Symbol.for('KEY_ITEM_TYPE');

/**
 * Main module for application. Defines all dependencies and provides default setup for configuration variables.
 *
 * @export
 * @extends {Container}
 */
export class AppModule extends Container {
	constructor() {
		super();

		// console
		if (process.env.DEBUG) {
			this.bind<Console>('debug:console').toConstantValue(console);
		} else {
			// tslint:disable:no-empty
			const noop = () => {};
			this.bind<Console>('debug:console').toConstantValue({
				assert: noop,
				debug: noop,
				error: noop,
				log: noop,
				trace: noop,
				group: noop,
				groupEnd: noop,
			} as Console);
		}

		// event manager
		this.bind<EventEmitter>('event-manager').toConstantValue(new EventEmitter());

		// phaser
		// this.load(ThemeModule());

		// game
		this.load(AncientMazeModule());

		// rendering DOM
		this.bind<HTMLElement>('ui:root').toConstantValue(document.getElementById('app') as HTMLElement);
		this.bind<React.ComponentFactory<any, any>>('ui:outlet-component').toConstantValue(React.createFactory(OutletComponent));
		this.bind<IRenderer>('ui:renderer').to(ReactRenderer).inSingletonScope();

		// environment
		this.bind<any>('player-pref').toConstantValue({
			debug: process.env.DEBUG,
		});

		this.bind<any>('environment').toConstantValue({});

		this.bind<IAncientMazeState<IGameObjectState>>('game-state').toConstantValue({
			objects: [],
			inputBuffer: [
				'left', 'up', 'up', 'right', 'down', 'down', 'left', 'right',
				'right', 'right', 'down', 'down', 'right', 'right', 'right',
				'up', 'right', 'up', 'up', 'up', 'right', 'up', 'left', 'left',
				'down', 'down', 'up', 'up', 'right', 'right', 'right', 'up',
				'right', 'down', 'down', 'down',
			],
			finished: false,
			command: undefined,
			executedCommands: [],
			collected: { [KEY_ITEM_TYPE]: 0 },
			initialCollectableCount: { [KEY_ITEM_TYPE]: 0 },
			steps: 0,
			board: new Board(12, 9),
		});
	}

	public banner() {
		// tslint:disable:max-line-length
		console.log('%c  ★★★ Black Dragon Framework ★★★  ',
			'display: block; line-height: 3rem; border-bottom: 5px double #a02060; font-family: fantasy; font-size: 2rem; color: #f02060; background-color: #000;',
		);
		console.log(`%c  author: ${ process.env.APP.templateData.author.padEnd(37) }\n%c    game: ${ process.env.APP.templateData.title.padEnd(37) }`,
			'line-height: 1.25rem; font-family: Consolas; font-weight: bold; font-size: 1.25rem; color: #a060d0; background-color: #000;',
			'line-height: 1.25rem; font-family: Consolas; font-weight: bold; font-size: 1.25rem; color: #a060d0; background-color: #000; border-bottom: 1px solid #600080;',
		);
	}

	public boot() {
		this.banner();

		const game = this.get<AncientMaze<IGameObjectState, IAncientMazeState<IGameObjectState>>>('game');
		game.boot();
	}
}
