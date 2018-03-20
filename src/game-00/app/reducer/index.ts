import { AnyAction } from 'redux';

export interface IPreloadState {
	progress: number;
	description?: string;
	complete: boolean;
}
export interface IAppDataState {
	preload?: {
		[key: string]: IPreloadState,
	};
}

export const reducer = (state: IAppDataState = {}, action: AnyAction) => {
	switch (action.type) {
		case 'PRELOAD:SET_PROGRESS': {
			const { namespace = 'assets', progress = 0, description = '' } = action.payload || {};
			const preload = state.preload || {};
			state.preload = { ...preload, [namespace]: { progress, description, complete: false } };
			break;
		}
		case 'PRELOAD:COMPLETE': {
			const { namespace = 'assets', progress = 0, description = '' } = action.payload || {};
			const preload = state.preload || {};
			state.preload = { ...preload, [namespace]: { progress, description, complete: true } };
			break;
		}
	}
	return state;
};
