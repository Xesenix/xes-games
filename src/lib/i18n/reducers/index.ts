import { IValueAction } from 'lib/interfaces';

import {
	ISetLanguageAction,
	ISetLanguageReadyAction,
	LanguageType,
	SET_LANGUAGE,
	SET_LANGUAGE_READY,
} from '../actions';

export interface II18nState extends Object {
	languages: { [key: string]: { ready: boolean } };
	language: LanguageType;
}

export const defaultI18nState: II18nState = {
	languages: { en: { ready: false } },
	language: 'en',
};

export type I18nAction = IValueAction | ISetLanguageReadyAction;

export function i18nReducer<S extends II18nState | undefined, A extends I18nAction>(state: S = defaultI18nState as S, action: A): S {
	switch (action.type) {
		case SET_LANGUAGE: {
			const { value } = action as ISetLanguageAction;
			const { languages = { [value]: { ready: false } } } = state as II18nState;
			const lang = languages[value] || { ready: false };
			state = {
				...state as any,
				language: value,
				languages: {
					...languages,
					[value]: {
						ready: lang.ready,
					},
				},
			};
			break;
		}
		case SET_LANGUAGE_READY: {
			const { locale, value } = action as ISetLanguageReadyAction;
			state.languages = {
				...state.languages,
				[locale]: {
					ready: value,
				},
			};
			break;
		}
	}
	return state;
}
