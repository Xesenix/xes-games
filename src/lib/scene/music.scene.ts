import { ISoundtrack } from './../sound-scape/interfaces';
import { __ } from 'lib/i18n';
import { IAudioManager } from 'lib/sound';
import { ISoundtrackManager } from 'lib/sound-scape';

export class MusicScene extends Phaser.Scene {
	private soundtrack?: Phaser.Sound.BaseSound;
	private label?: Phaser.GameObjects.Text;

	constructor() {
		super({
			key: 'music',
		});
	}

	public preload(): void {
		const sm: IAudioManager = this.sys.plugins.get('audio-manager') as any;
		console.log('MusicScene:preload');
		if (!!(sm as any).setLoader) {
			(sm as any).setLoader(this.load);
		}

		sm.preloadAudioAsset('soundtrack1', 'assets/soundtrack.ogg');
		sm.preloadAudioAsset('soundtrack2', 'assets/soundtrack.wav');
		sm.preloadAudioAsset('fx1', 'assets/fx_00.ogg');
		sm.preloadAudioAsset('fx2', 'assets/fx_01.ogg');
		sm.preloadAudioAsset('soundtrack', 'assets/soundtrack_sprite_00.wav');

		/*this.load.audio('soundtrack', [
			'assets/soundtrack.wav',
		]);*/
	}

	public create(): void {
		const sm: IAudioManager = this.sys.plugins.get('audio-manager') as any;
		const stm: ISoundtrackManager = this.sys.plugins.get('soundtrack-manager') as any;

		sm.preload().then(() => {
			/*sm.playLoop('soundtrack1');

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
			}, 15000);*/
			const bpm = 140;
			const note = 240 / bpm;

			const loop: ISoundtrack = {
				key: 'soundtrack',
				name: 'idle',
				intro: {
					start: note * 4 * 1000,
					end: note * 8 * 1000,
				},
				loop: {
					start: note * 8 * 1000,
					end: note * 12 * 1000,
				},
				outro: {
					start: note * 19 * 1000,
					end: note * 21 * 1000,
				},
			};

			stm.soundtrackPlayer.scheduleNext(loop, 5, 30);

			const action: ISoundtrack = {
				key: 'soundtrack',
				name: 'action',
				intro: {
					start: note * 12 * 1000,
					end: note * 16 * 1000,
				},
				loop: {
					start: note * 16 * 1000,
					end: note * 18 * 1000,
				},
				outro: {
					start: note * 18 * 1000,
					end: note * 19 * 1000,
				},
			};

			stm.soundtrackPlayer.scheduleNext(action, 35, 20);

			const ambient: ISoundtrack = {
				key: 'soundtrack',
				name: 'ambient',
				intro: {
					start: 0,
					end: note * 4 * 1000,
				},
				loop: {
					start: note * 0 * 1000,
					end: note * 4 * 1000,
				},
				outro: {
					start: 0,
					end: 0,
				},
			};

			stm.soundtrackPlayer.scheduleNext(ambient, 0, 5);
			stm.soundtrackPlayer.scheduleNext(ambient, 55, 0);
		});

		// this.soundtrack = this.sound.add('soundtrack');

		// this.soundtrack.play();
		// this.soundtrack.source.loop = true;

		this.label = this.add.text(400, 300, '', { font: '24px Consolas', fill: '#ffffff' });
		this.label.setOrigin(0.5, 0.5);
	}

	public destroy(): void {
		if (this.soundtrack) {
			this.soundtrack.destroy();
		}
	}

	public update(time: number, delta: number): void {
		if (this.label) {
			const sm: IAudioManager = this.sys.plugins.get('audio-manager') as any;
			const stm: ISoundtrackManager = this.sys.plugins.get('soundtrack-manager') as any;
			const currentSoundtrack = stm.soundtrackPlayer.getCurrentSoundtrack()
				.map(({ name, start, end }) => `${name}[${start.toFixed(2)}-${end && end.toFixed(2) || 'inf'}]`)
				.join(', ');

			this.label.setText(`${ __('total time') }: ${(time / 1000).toFixed(0)}s\n
${ __('delta time') }: ${delta.toFixed(2)}ms\n
${ __('audio time') }: ${sm.context.currentTime.toFixed(2)}s\n
current sound: ${ currentSoundtrack }`);
		}
	}
}
