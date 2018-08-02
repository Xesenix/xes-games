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

export function inject<T>(Consumer, select: { [key: string]: (value: any) => Promise<any> }) {
	class Inject extends React.Component<T, {}> {
		public componentDidMount() {
			const { di } = this.props;

			if (!!di) {
				const keys = Object.keys(select);

				Promise.all(
					keys.map((key) => select[key](di.get(key))),
				).then((values: any[]) => {
					const state = values.reduce((result, value, index) => {
						// TODO: finish mapping to properties
						result[keys[index]] = value;
						return result;
					}, {});
					this.setState(state);
				});
			}
		}

		public render() {
			return (<DIContext.Consumer>{
				(container: Container | null) => (
					<Consumer
						{...this.props}
						{...this.state}
					/>)
			}</DIContext.Consumer>);
		}
	}

	return connectToDI<T>(Inject);
}
