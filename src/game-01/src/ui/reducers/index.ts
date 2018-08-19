import { IValueAction } from 'lib/interfaces';

import {
	ISetFullscreenAction,
	ISetMuteAction,
	ISetPauseAction,
	ISetThemeAction,
	ISetVolumeAction,
	SET_FULLSCREEN,
	SET_MUSIC_VOLUME,
	SET_MUTE,
	SET_MUTE_MUSIC,
	SET_EFFECTS_MUTED,
	SET_PAUSE,
	SET_EFFECTS_VOLUME,
	SET_THEME,
	SET_VOLUME,
} from '../actions';

export interface IUIState {
	mute: boolean;
	musicMuted: boolean;
	effectsMuted: boolean;
	paused: boolean;
	effectsVolume: number;
	musicVolume: number;
	volume: number;
	theme: 'dark' | 'light';
	fullscreen: boolean;
}

export const defaultUIState: IUIState = {
	mute: false,
	musicMuted: false,
	effectsMuted: false,
	paused: false,
	effectsVolume: 1.0,
	volume: 0.1,
	musicVolume: 1.0,
	theme: 'light',
	fullscreen: false,
};

export function uiReducer<S extends IUIState | undefined, A extends IValueAction>(state: S = defaultUIState as S, action: A): S {
	switch (action.type) {
		case SET_MUTE: {
			const { value } = action as ISetMuteAction;
			return {
				...state as any,
				mute: value,
			};
		}
		case SET_MUTE_MUSIC: {
			const { value } = action as ISetMuteAction;
			return {
				...state as any,
				musicMuted: value,
			};
		}
		case SET_EFFECTS_MUTED: {
			const { value } = action as ISetMuteAction;
			return {
				...state as any,
				effectsMuted: value,
			};
		}
		case SET_PAUSE: {
			const { value } = action as ISetPauseAction;
			return {
				...state as any,
				paused: value,
			};
		}
		case SET_VOLUME: {
			const { value } = action as ISetVolumeAction;
			return {
				...state as any,
				volume: value,
			};
		}
		case SET_MUSIC_VOLUME: {
			const { value } = action as ISetVolumeAction;
			return {
				...state as any,
				musicVolume: value,
			};
		}
		case SET_EFFECTS_VOLUME: {
			const { value } = action as ISetVolumeAction;
			return {
				...state as any,
				effectsVolume: value,
			};
		}
		case SET_THEME: {
			const { value } = action as ISetThemeAction;
			return {
				...state as any,
				theme: value,
			};
		}
		case SET_FULLSCREEN: {
			const { value } = action as ISetFullscreenAction;
			return {
				...state as any,
				fullscreen: value,
			};
		}
	}
	return state;
}
