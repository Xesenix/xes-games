import { of } from 'rxjs/observable/of';
import { ObservableDictionary } from './observable-dictionary';

describe('ObservableDictionary', () => {
	describe('get', () => {
		it('should return defaultValue if key item isn\'t set', () => {
			const dictionary = new ObservableDictionary(of({}));
			expect(dictionary.get('key', 'default')).toEqual('default');
		});

		it('should return value if key item is set', () => {
			const dictionary = new ObservableDictionary(of({ key: 'value' }));

			expect(dictionary.get('key', 'default')).toEqual('value');
		});
	});

	describe('set', () => {
		it('should set value for key item', () => {
			const dictionary = new ObservableDictionary(of({}));

			dictionary.set('key1', 'value1');

			expect(dictionary.get('key1', 'default')).toEqual('value1', 'should set value on not existing key');

			dictionary.set('key1', 'value2');

			expect(dictionary.get('key1', 'default')).toEqual('value2', 'should replace value on existing key');

			dictionary.set('key2', 'value3');

			expect(dictionary.get('key1', 'default')).toEqual('value2', 'should not loose value if other key is set');
			expect(dictionary.get('key2', 'default')).toEqual('value3', 'should be able to handle multiple values');
		});
	});
});
