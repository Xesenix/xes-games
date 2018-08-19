import { __ } from 'lib/i18n';
import { ISoundManager } from 'lib/phaser/sound-manager.plugin';

export class MusicScene extends Phaser.Scene {
	private soundtrack?: Phaser.Sound.BaseSound;
	private label?: Phaser.GameObjects.Text;

	constructor() {
		super({
			key: 'music',
		});
	}

	public preload(): void {
		const sm: ISoundManager = this.sys.plugins.get('sound-manager') as any;

		sm.loader = this.load;
		sm.preloadAudioAsset('soundtrack1', 'assets/soundtrack.ogg');
		sm.preloadAudioAsset('soundtrack2', 'assets/soundtrack.wav');
		sm.preloadAudioAsset('fx1', 'assets/fx_00.ogg');
		sm.preloadAudioAsset('fx2', 'assets/fx_01.ogg');

		/*this.load.audio('soundtrack', [
			'assets/soundtrack.wav',
		]);*/
	}

	public create(): void {
		const sm: ISoundManager = this.sys.plugins.get('sound-manager') as any;

		sm.playLoop('soundtrack1');

		setInterval(() => {
			sm.playFxSound('fx2');
		}, 2500);

		setTimeout(() => {
			sm.stopSound('soundtrack1');
			sm.playFxSound('fx1');
		}, 10000);

		setTimeout(() => {
			sm.playLoop('soundtrack2');
			sm.playFxSound('fx2');
		}, 15000);

		// this.soundtrack = this.sound.add('soundtrack');

		// this.soundtrack.play();
		// this.soundtrack.source.loop = true;

		this.label = this.add.text(400, 300, '', { font: '48px Consolas', fill: '#ffffff' });
		this.label.setOrigin(0.5, 0.5);
	}

	public destroy(): void {
		if (this.soundtrack) {
			this.soundtrack.destroy();
		}
	}

	public update(time: number, delta: number): void {
		if (this.label) {
			this.label.setText(`${ __('total time') }: ${(time / 1000).toFixed(0)}s\n${ __('delta time') }: ${delta.toFixed(2)}ms`);
		}
	}
}
