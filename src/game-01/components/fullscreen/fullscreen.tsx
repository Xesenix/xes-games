import * as React from 'react';
import { hot } from 'react-hot-loader';

import { setFullscreen } from 'lib/fullscreen/fullscreen';

import './fullscreen.scss';

export interface IFullScreenProps {
	fullscreen: boolean;
}
export interface IFullScreenState { }

class FullScreenComponent extends React.Component<IFullScreenProps, IFullScreenState> {
	private fullScreenContainer?: HTMLDivElement;

	constructor(props) {
		super(props);
		this.state = {
			fullscreen: false,
		};
	}

	public componentDidUpdate(): void {
		if (!!this.fullScreenContainer) {
			console.log('fullScreenContainer', this.fullScreenContainer);
			setFullscreen(this.props.fullscreen, this.fullScreenContainer);
		}
	}

	public render(): any {
		return (<div className="full-screen-container" ref={(el: HTMLDivElement) => this.fullScreenContainer = el}>{ this.props.children }</div>);
	}
}

export default hot(module)(FullScreenComponent);
