import { Action } from 'redux';

// tslint:disable:max-classes-per-file
export const SET_MUTE = 'UI_SET_MUTE';
export interface ISetMuteAction extends Action {
	value: boolean;
}
export const createSetMuteAction = (value: boolean): ISetMuteAction => ({
	type: SET_MUTE,
	value,
});

export const SET_MUTE_MUSIC = 'UI_SET_MUTE_MUSIC';
export const createSetMuteMusicAction = (value: boolean): ISetMuteAction => ({
	type: SET_MUTE_MUSIC,
	value,
});

export const SET_MUTE_SOUND = 'UI_SET_MUTE_SOUND';
export const createSetMuteSoundAction = (value: boolean): ISetMuteAction => ({
	type: SET_MUTE_SOUND,
	value,
});

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

export const SET_SOUND_VOLUME = 'UI_SET_SOUND_VOLUME';
export const createSetSoundVolumeAction = (value: number): ISetVolumeAction => ({
	type: SET_SOUND_VOLUME,
	value,
});

export const SET_MUSIC_VOLUME = 'UI_SET_MUSIC_VOLUME';
export const createSetMusicVolumeAction = (value: number): ISetVolumeAction => ({
	type: SET_MUSIC_VOLUME,
	value,
});

export type LanguageType = 'en' | 'pl';
export const SET_LANGUAGE = 'UI_SET_LANGUAGE';
export interface ISetLanguageAction extends Action {
	value: LanguageType;
}
export const createSetLanguageAction = (value: LanguageType): ISetLanguageAction => ({
	type: SET_LANGUAGE,
	value,
});

export type UIAction = ISetMuteAction | ISetPauseAction | ISetVolumeAction | ISetLanguageAction;
