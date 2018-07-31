import { Action } from 'redux';

// tslint:disable:max-classes-per-file
export const SET_MUTE = 'UI_SET_MUTE';
export class SetMuteAction implements Action {
	public readonly type = SET_MUTE;

	constructor(
		public value: boolean,
	) {
		this.value = value;
	}
}

export const SET_PAUSE = 'UI_SET_PAUSE';
export class SetPauseAction implements Action {
	public readonly type = SET_PAUSE;

	constructor(
		public value: boolean,
	) {
		this.value = value;
	}
}

export const SET_VOLUME = 'UI_SET_VOLUME';
export class SetVolumeAction implements Action {
	public readonly type = SET_VOLUME;

	constructor(
		public value: number,
	) {
		this.value = value;
	}
}

export type UIAction = SetMuteAction | SetPauseAction | SetVolumeAction;
