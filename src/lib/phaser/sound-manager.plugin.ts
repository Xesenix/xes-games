import { Store } from 'redux';

export interface ISoundConfigurationState {
	mute: boolean;
	musicMuted: boolean;
	effectsMuted: boolean;
	effectsVolume: number;
	musicVolume: number;
	volume: number;
	paused: boolean;
}

export const createSoundManagerPlugin = <T extends ISoundConfigurationState>(store: Store) =>
class SoundManagerPlugin extends Phaser.Plugins.BasePlugin {
	public store: Store<T> = store;
	private unsubscribe: any;
	private context = new AudioContext();
	private masterGain?: GainNode;
	private musicGain?: GainNode;
	private effectsGain?: GainNode;
	private audioNodes = {};
	private ready?: () => void;
	private readyPromise = new Promise((resolve) => {
		this.ready = resolve;
	});

	constructor(
		public pluginManager: Phaser.Plugins.PluginManager,
	) {
		super(pluginManager);
		console.log('SoundManagerPlugin:constructor');
	}

	public start(): void {
		console.log('SoundManagerPlugin:start', this);
		this.unsubscribe = this.store.subscribe(this.syncWithState);
		this.syncWithState();

		this.masterGain = this.context.createGain();
		this.musicGain = this.context.createGain();
		this.effectsGain = this.context.createGain();

		this.musicGain.connect(this.masterGain);
		this.effectsGain.connect(this.masterGain);

		this.masterGain.connect(this.context.destination);

		// TODO: move outside plugin
		this.addAudioAsset('soundtrack', 'assets/soundtrack.wav', true);

		this.syncWithState();

		if (!!this.ready) {
			this.ready();
		}
	}

	public getAudioAsset(key: string): Promise<AudioBufferSourceNode> {
		if (!!this.audioNodes[key]) {
			return this.audioNodes[key];
		}

		return Promise.reject(`No audio asset for key: ${key}`);
	}

	public addAudioAsset(key: string, src: string, autostart: boolean = false): Promise<AudioBufferSourceNode> {
		const source = this.context.createBufferSource();
		source.loop = true;

		let promise: Promise<any> = this.load(src).then((buffer: AudioBuffer) => {
			source.buffer = buffer;
			if (!!this.musicGain) {
				source.connect(this.musicGain);
			}
		});

		if (autostart) {
			promise = promise.then(() => {
				source.start(0);
			})
			.then(() => source);
		} else {
			promise = promise.then(() => source);
		}

		this.audioNodes[key] = promise;

		return promise;
	}

	public load(src: string): Promise<AudioBuffer> {
		return new Promise((resolve) => {
			const request = new XMLHttpRequest();
			request.open('GET', src, true);
			request.responseType = 'arraybuffer';
			request.onload = () => {
				this.decodeAudio(request.response).then(resolve);
			};
			request.send();
		});
	}

	public decodeAudio(buffer): Promise<AudioBuffer> {
		return new Promise((resolve) => {
			this.readyPromise.then(() => {
				this.context.decodeAudioData(buffer, resolve);
			});
		});
	}

	public stop() {
		console.log('SoundManagerPlugin:stop');
		this.unsubscribe();
	}

	private syncWithState = () => {
		const state: T = this.store.getState();
		console.log('UIManagerPlugin:syncWithState', state);

		const mute = state.paused || state.mute;

		if (!!this.context) {
			if (mute) {
				this.context.suspend();
			} else {
				this.context.resume();
			}
		}

		if (!!this.masterGain) {
			this.masterGain.gain.value = state.volume;
		}

		if (!!this.musicGain) {
			this.musicGain.gain.value = state.musicMuted ? 0 : state.musicVolume;
		}

		if (!!this.effectsGain) {
			this.effectsGain.gain.value = state.effectsMuted ? 0 : state.effectsVolume;
		}
	}
};
