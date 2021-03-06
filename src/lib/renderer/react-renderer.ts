import { inject } from 'lib/di';
import * as React from 'react';
import { render } from 'react-dom';

// TODO: decouple interface from implementation
export interface IRenderer {
	setOutlet(component: any, outlet?: string): IRenderer;
	render(): IRenderer;
}

@inject(['ui:root', 'ui:outlet-component'])
export class ReactRenderer implements IRenderer {
	private outlets: { [key: string]: any } = {};

	constructor(
		private uiRoot: HTMLElement,
		private outletFactory: React.ComponentFactory<any, any>,

	) {
		this.uiRoot = uiRoot;
		this.outletFactory = outletFactory;
	}

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
					content.push(this.outletFactory({ key }, element));
				}
			}
		}

		render(content, this.uiRoot);

		return this;
	}
}
