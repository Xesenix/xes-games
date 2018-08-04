import * as React from 'react';

import { Container } from 'inversify';

// tslint:disable:max-classes-per-file

export const DIContext = React.createContext<Container | null>(null);
export function connectToDI<T>(Consumer) {
	class DIConsumer extends React.Component<T, {}> {
		public render() {
			return <DIContext.Consumer>{ (container: Container | null) => <Consumer {...this.props} di={container}/> }</DIContext.Consumer>;
		}
	}

	return DIConsumer;
}

export function inject<T>(Consumer, select: { [key: string]: { name: string, value: (value: any) => Promise<any> } }) {
	class DIInjector extends React.Component<T & { di: Container }, {}> {
		public componentDidMount() {
			const { di } = this.props;

			if (!!di) {
				const keys = Object.keys(select);
				const configs = Object.values(select);

				Promise.all(
					keys.map((key) => select[key].value(di.get(key))),
				).then((values: any[]) => {
					const state = values.reduce((result, value, index) => {
						result[configs[index].name] = value;
						return result;
					}, {});
					this.setState(state);
				});
			}
		}

		public render() {
			if (!!this.state) {
				return <Consumer {...this.props} {...this.state}/>;
			}

			return <>Loading...</>;
		}
	}

	return connectToDI<T>(DIInjector);
}
