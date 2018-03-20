import { inject, injectable } from 'lib/di';
import * as React from 'react';
import { render } from 'react-dom';

export interface IRenderer {
	setOutlet(component: any, outlet?: string): IRenderer;
	render(): IRenderer;
}

@inject(['ui:root'])
export class ReactRenderer implements IRenderer {
	private outlets: { [key: string]: any } = {};

	constructor(
		private uiRoot: HTMLElement,
	) { }

	public setOutlet(component: any, outlet: string = 'main'): IRenderer {
		this.outlets[outlet] = component;
		return this;
	}

	public render(): IRenderer {
		const content = new Array<JSX.Element>();
		for (const key in this.outlets) {
			if (this.outlets.hasOwnProperty(key)) {
				const element = this.outlets[key];
				if (!!element) {
					content.push((
						<div
							key={key}
							style={ { border: '1px solid black', padding: '20px' } }
						>
							<div style={ { border: '1px solid black', padding: '5px', background: '#ddd' } }>outlet {key}:</div>
							{ element }
						</div>
					));
				}
			}
		}

		render((<div>{ content }</div>), this.uiRoot);

		return this;
	}
}
