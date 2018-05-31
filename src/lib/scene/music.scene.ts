import * as Phaser from 'phaser';

export default class MusicScene extends Phaser.Scene {
	private soundtrack?: Phaser.Sound.BaseSound;

	constructor() {
		super({
			key: 'music',
		});
	}

	public preload() {
		console.log('=== PRELOAD MUSIC');
		this.load.audio('soundtrack', [
			'assets/soundtrack.ogg',
		]);
	}

	public create() {
		console.log('=== CREATE MUSIC');
		this.soundtrack = this.sound.add('soundtrack');
		this.soundtrack.play('', { loop: true });
	}

	public destroy() {
		if (this.soundtrack) {
			this.soundtrack.destroy();
		}
	}
}
