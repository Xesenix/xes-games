import * as Phaser from 'phaser';

import { injectable } from 'inversify';

export type IPhaserState = any;

@injectable()
export class BaseState {
	public add: Phaser.GameObjectFactory;
	public game: Phaser.Game;
	public load: Phaser.Loader;
	public stage: Phaser.Stage;
}
