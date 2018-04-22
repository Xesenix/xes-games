import * as React from 'react';
import { hot } from 'react-hot-loader';

export interface IOutletProps {
}

export interface IOutletState {
}

class OutletComponent extends React.Component<IOutletProps, IOutletState> {
	public render(): any {
		return (<>{ this.props.children }</>);
	}
}

export default hot(module)(OutletComponent);
