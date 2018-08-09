import { Reducer } from 'redux';

import {
	ISetMuteAction,
	ISetPauseAction,
	ISetVolumeAction,
	SET_MUSIC_VOLUME,
	SET_MUTE,
	SET_MUTE_MUSIC,
	SET_MUTE_SOUND,
	SET_PAUSE,
	SET_SOUND_VOLUME,
	SET_VOLUME,
	UIAction,
} from '../actions/index';

export interface IUIState {
	mute: boolean;
	muteMusic: boolean;
	muteSound: boolean;
	paused: boolean;
	soundVolume: number;
	musicVolume: number;
	volume: number;
}

export const defaultUIState: IUIState = {
	mute: false,
	muteMusic: false,
	muteSound: false,
	paused: false,
	soundVolume: 1.0,
	volume: 0.5,
	musicVolume: 1.0,
};

export const ui: Reducer<IUIState, UIAction> = (state: IUIState = defaultUIState, action: UIAction): IUIState => {
	switch (action.type) {
		case SET_MUTE: {
			const { value } = action as ISetMuteAction;
			return {
				...state,
				mute: value,
			};
		}
		case SET_MUTE_MUSIC: {
			const { value } = action as ISetMuteAction;
			return {
				...state,
				muteMusic: value,
			};
		}
		case SET_MUTE_SOUND: {
			const { value } = action as ISetMuteAction;
			return {
				...state,
				muteSound: value,
			};
		}
		case SET_PAUSE: {
			const { value } = action as ISetPauseAction;
			return {
				...state,
				paused: value,
			};
		}
		case SET_VOLUME: {
			const { value } = action as ISetVolumeAction;
			return {
				...state,
				volume: value,
			};
		}
		case SET_MUSIC_VOLUME: {
			const { value } = action as ISetVolumeAction;
			return {
				...state,
				musicVolume: value,
			};
		}
		case SET_SOUND_VOLUME: {
			const { value } = action as ISetVolumeAction;
			return {
				...state,
				soundVolume: value,
			};
		}
	}
	return state;
};
