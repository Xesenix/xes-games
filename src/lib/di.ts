import * as inversify from 'inversify';
import { interfaces as ii } from 'inversify';
import { helpers, interfaces as vi } from 'inversify-vanillajs-helpers';
import 'reflect-metadata';

type DependencyType = string | symbol | ii.Newable<any> | ii.Abstract<any> | vi.BasicInjection | vi.NamedInjection | vi.TaggedInjection;

/**
 * Annotate class with constructor dependency injection.
 */
export function inject(dependencies?: DependencyType[]): any {
	return (target, key, descriptor) => {
		if (process.env.DEBUG) {
			console.debug('annotation:inject', target.name, dependencies);
		}
		helpers.annotate(target, dependencies);
	};
}

/**
 * Annotate classes that can be injected as dependencies.
 */
export function injectable() {
	return (target, key, descriptor) => {
		if (process.env.DEBUG) {
			console.debug('annotation:injectable', target.name);
		}
		return inversify.decorate(inversify.injectable(), target);
	};
}
