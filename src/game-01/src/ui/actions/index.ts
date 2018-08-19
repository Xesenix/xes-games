import { IValueAction } from 'lib/interfaces';

// tslint:disable:max-classes-per-file
export const SET_MUTE = 'UI_SET_MUTE';
export interface ISetMuteAction extends IValueAction {
	value: boolean;
}
export const createSetMuteAction = (value: boolean): ISetMuteAction => ({
	type: SET_MUTE,
	value,
});

export const SET_MUTE_MUSIC = 'UI_SET_MUTE_MUSIC';
export const createSetMusicMutedAction = (value: boolean): ISetMuteAction => ({
	type: SET_MUTE_MUSIC,
	value,
});

export const SET_EFFECTS_MUTED = 'UI_SET_EFFECTS_MUTED';
export const createSetEffectsMutedAction = (value: boolean): ISetMuteAction => ({
	type: SET_EFFECTS_MUTED,
	value,
});

export const SET_PAUSE = 'UI_SET_PAUSE';
export interface ISetPauseAction extends IValueAction {
	value: boolean;
}
export const createSetPauseAction = (value: boolean): ISetPauseAction => ({
	type: SET_PAUSE,
	value,
});

export const SET_VOLUME = 'UI_SET_VOLUME';
export interface ISetVolumeAction extends IValueAction {
	value: number;
}
export const createSetVolumeAction = (value: number): ISetVolumeAction => ({
	type: SET_VOLUME,
	value,
});

export const SET_EFFECTS_VOLUME = 'UI_SET_EFFECTS_VOLUME';
export const createSetEffectsVolumeAction = (value: number): ISetVolumeAction => ({
	type: SET_EFFECTS_VOLUME,
	value,
});

export const SET_MUSIC_VOLUME = 'UI_SET_MUSIC_VOLUME';
export const createSetMusicVolumeAction = (value: number): ISetVolumeAction => ({
	type: SET_MUSIC_VOLUME,
	value,
});

export const SET_THEME = 'UI_SET_THEME';
export interface ISetThemeAction extends IValueAction {
	value: 'dark' | 'light';
}
export const createSetThemeAction = (value: 'dark' | 'light'): ISetThemeAction => ({
	type: SET_THEME,
	value,
});

export const SET_FULLSCREEN = 'UI_SET_FULLSCREEN';
export interface ISetFullscreenAction extends IValueAction {
	value: boolean;
}
export const createSetFullscreenAction = (value: boolean): ISetFullscreenAction => ({
	type: SET_FULLSCREEN,
	value,
});
