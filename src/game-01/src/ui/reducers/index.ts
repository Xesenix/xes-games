import { Reducer } from 'redux';

import {
	SET_MUTE,
	SET_PAUSE,
	SET_VOLUME,
	ISetMuteAction,
	ISetPauseAction,
	ISetVolumeAction,
	UIAction,
} from '../actions/index';

export interface IUIState {
	mute: boolean;
	paused: boolean;
	volume: number;
}

export const defaultUIState: IUIState = {
	mute: false,
	paused: false,
	volume: 0.5,
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
	}
	return state;
};
