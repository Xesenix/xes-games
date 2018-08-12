import { IValueAction } from 'lib/interfaces';

export type LanguageType = 'en' | 'pl';

export const SET_LANGUAGE = 'I18N_SET_LANGUAGE';
export interface ISetLanguageAction extends IValueAction {
	value: LanguageType;
}
export const createSetLanguageAction = (value: LanguageType): ISetLanguageAction => ({
	type: SET_LANGUAGE,
	value,
});

export const SET_LANGUAGE_READY = 'I18N_SET_LANGUAGE_READY';
export interface ISetLanguageReadyAction extends IValueAction {
	locale: LanguageType;
	value: boolean;
}
export const createLanguageReadyAction = (locale: LanguageType, value: boolean): ISetLanguageReadyAction => ({
	type: SET_LANGUAGE_READY,
	locale,
	value,
});
