import * as React from 'react';
import { hot } from 'react-hot-loader';

import { IAppDataState, IPreloadState } from 'app/reducer';
import { DataStore } from 'lib/data-store/data-store';

export interface IOutletProps {
}

export interface IOutletState {
}

class Outlet extends React.Component<IOutletProps, IOutletState> {
	public render(): any {
		return (<>{this.props.children}</>);
	}
}

export default hot(module)(Outlet);
