import { AnyAction } from 'redux';

export interface IAppDataState {
}

export const reducer = (state: IAppDataState = {}, action: AnyAction) => {
	return {
		...state,
	};
};
