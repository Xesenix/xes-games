import * as React from 'react';
import { hot } from 'react-hot-loader';

import { setFullscreen } from 'lib/fullscreen/fullscreen';

import './fullscreen.scss';

export interface IFullScreenProps {
	fullscreen: boolean;
}
export interface IFullScreenState { }

class FullScreenComponent extends React.PureComponent<IFullScreenProps, IFullScreenState> {
	private fullScreenContainer?: HTMLElement;

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
		return (<div className="full-screen-container" ref={() => this.fullScreenContainer = window.document.body}>{ this.props.children }</div>);
	}
}

export default hot(module)(FullScreenComponent);
