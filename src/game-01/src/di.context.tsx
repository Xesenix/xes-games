import * as React from 'react';

import { Container } from 'inversify';

export const DIContext = React.createContext<Container | null>(null);
export function connectToDI<T>(Consumer) {
	class DIConsumer extends React.Component<T, {}> {
		public render() {
			return <DIContext.Consumer>{ (container: Container | null) => <Consumer {...this.props} di={container}/> }</DIContext.Consumer>;
		}
	}

	return DIConsumer;
}
