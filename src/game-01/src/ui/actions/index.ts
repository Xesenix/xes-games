import { Action } from 'redux';

// tslint:disable:max-classes-per-file
export const SET_MUTE = 'UI_SET_MUTE';
export interface ISetMuteAction extends Action {
	value: boolean;
}
export const createSetMuteAction = (value: boolean): ISetMuteAction => ({
	type: SET_MUTE,
	value,
})

export const SET_PAUSE = 'UI_SET_PAUSE';
export interface ISetPauseAction extends Action {
	value: boolean;
}
export const createSetPauseAction = (value: boolean): ISetPauseAction => ({
	type: SET_PAUSE,
	value,
});

export const SET_VOLUME = 'UI_SET_VOLUME';
export interface ISetVolumeAction extends Action {
	value: number;
}
export const createSetVolumeAction = (value: number): ISetVolumeAction => ({
	type: SET_VOLUME,
	value,
});

export type UIAction = ISetMuteAction | ISetPauseAction | ISetVolumeAction;
