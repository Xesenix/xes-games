import { IValueAction } from 'lib/interfaces';

import {
	ISetMuteAction,
	ISetPauseAction,
	ISetThemeAction,
	ISetVolumeAction,
	SET_MUSIC_VOLUME,
	SET_MUTE,
	SET_MUTE_MUSIC,
	SET_MUTE_SOUND,
	SET_PAUSE,
	SET_SOUND_VOLUME,
	SET_THEME,
	SET_VOLUME,
} from '../actions';

export interface IUIState {
	mute: boolean;
	muteMusic: boolean;
	muteSound: boolean;
	paused: boolean;
	soundVolume: number;
	musicVolume: number;
	volume: number;
	theme: 'dark' | 'light';
}

export const defaultUIState: IUIState = {
	mute: false,
	muteMusic: false,
	muteSound: false,
	paused: false,
	soundVolume: 1.0,
	volume: 0.1,
	musicVolume: 1.0,
	theme: 'light',
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
				muteMusic: value,
			};
		}
		case SET_MUTE_SOUND: {
			const { value } = action as ISetMuteAction;
			return {
				...state as any,
				muteSound: value,
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
		case SET_SOUND_VOLUME: {
			const { value } = action as ISetVolumeAction;
			return {
				...state as any,
				soundVolume: value,
			};
		}
		case SET_THEME: {
			const { value } = action as ISetThemeAction;
			return {
				...state as any,
				theme: value,
			};
		}
	}
	return state;
}
