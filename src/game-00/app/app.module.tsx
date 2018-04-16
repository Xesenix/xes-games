import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { EventEmitter } from 'events';
import { Container } from 'inversify';

import OutletComponent from 'components/outlet/outlet';
import { FlatDictionary } from 'lib/dictionary/flat-dictionary';
import { IDictionary } from 'lib/dictionary/interfaces';
import Algorithm from 'lib/game/ancient-maze/algorithm';
import AncientMaze from 'lib/game/ancient-maze/ancient-maze';
import { IAncientMazeState } from 'lib/game/ancient-maze/ancient-maze';
import {
	DESTROY_OBJECT_ON_COLLISION_ASPECT,
	DESTRUCTIBLE_OBJECT_ASPECT,
	KILL_ON_COLLISION_OBJECT_ASPECT,
} from 'lib/game/ancient-maze/aspects';
import { IGameBoardObject, IGameObjectState, IMovableGameObjectState } from 'lib/game/board/interface';
import CollisionSystem from 'lib/game/system/collision';
import LifespanSystem from 'lib/game/system/lifespan';
import { ROCK_APPEARANCE } from 'lib/game/system/map';
import { PhaserModule } from 'lib/phaser/phaser.module';
import { IRenderer, ReactRenderer } from 'lib/renderer/react-renderer';
import { ThemeModule } from 'lib/theme/theme.module';

// import { IAppDataState, reducer } from './reducer';

declare const process: any;

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
		this.load(ThemeModule());
		this.load(PhaserModule());

		// state management
		// this.load(StateManagerModule());
		// this.load(UIStatesModule());
		// this.load(GameStatesModule());

		// rendering DOM
		this.bind<HTMLElement>('ui:root').toConstantValue(document.getElementById('app') as HTMLElement);
		this.bind<React.Component>('ui:outlet-component').toConstantValue(OutletComponent);
		this.bind<IRenderer>('ui:renderer').to(ReactRenderer).inSingletonScope();

		// setup data store
		// this.load(DataStoreModule<IAppDataState>({}, reducer, process.env.DEBUG));

		// environment
		this.bind<IDictionary>('player-pref').toConstantValue(new FlatDictionary({
			debug: process.env.DEBUG,
		}));

		this.bind<IDictionary>('environment').toConstantValue(new FlatDictionary({}));

		const kill = (target: IGameBoardObject<IGameObjectState>) => {
			target.state = { ...target.state, alive: false };
		};

		this.bind('kill').toConstantValue(kill);

		this.bind('on-collision').toConstantValue(
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
		this.bind('on-overlap').toConstantValue(
			(source: IGameBoardObject<IMovableGameObjectState>, target: IGameBoardObject<IGameObjectState>) => {
			},
		);
		this.bind('on-collision-filter').toConstantValue((obj: IGameBoardObject) => true);
		this.bind<CollisionSystem<IGameObjectState>>('collision-system').to(CollisionSystem).inSingletonScope();
		this.bind<LifespanSystem>('lifespan-system').to(LifespanSystem).inSingletonScope();

		this.bind<Algorithm<IAncientMazeState>>('game-engine').to(Algorithm).inSingletonScope();
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

		const game = new AncientMaze(this);
		game.boot();
	}
}
