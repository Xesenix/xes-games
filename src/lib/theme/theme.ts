import { injectable } from 'inversify';

export interface ITheme {
	primaryFont: string;
	[key: string]: any;
}

@injectable()
export class DefaultTheme implements ITheme {
	public primaryFont = 'Arial';
}
