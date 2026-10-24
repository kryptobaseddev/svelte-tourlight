import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';
import {
	TourDocumentError,
	compileTourDocument,
	createTourDocument,
	formatTourDocument,
	inspectTourDocument,
	parseTourDocument,
	validateTourDocument,
	type TourDocument
} from '../lib/document/index.js';
import { themeName, themeStyle } from '../lib/themes.js';

const doc = (): TourDocument => ({
	schemaVersion: 1,
	id: 'onboarding',
	name: 'Onboarding',
	steps: [
		{ id: 'hello', title: 'Hello', content: 'A centered welcome step.' },
		{
			id: 'new',
			target: '[data-tour="new"]',
			title: 'Create',
			content: 'Click the real button.',
			route: '/projects',
			advanceOn: { event: 'click' }
		},
		{
			id: 'save',
			target: '#save',
			title: 'Save',
			content: '',
			action: { label: 'Do it', handler: 'save' },
			condition: 'canSave'
		}
	]
});

describe('validateTourDocument', () => {
	it('accepts a valid document, including a centered step with no target', () => {
		expect(validateTourDocument(doc())).toEqual({ valid: true, issues: [] });
	});

	it('reports paths for every problem', () => {
		const bad = {
			schemaVersion: 2,
			id: '-bad',
			name: '',
			extra: true,
			steps: [
				{ id: 'a', title: 'A', content: '', placement: 'middle', route: '//evil', timeout: -1 },
				{ id: 'a', title: 'B', content: '', interactive: true }
			]
		};
		const { valid, issues } = validateTourDocument(bad);
		expect(valid).toBe(false);
		const codes = issues.map((i) => `${i.path}:${i.code}`);
		expect(codes).toEqual(
			expect.arrayContaining([
				'$.extra:unknown-field',
				'$.schemaVersion:unsupported-version',
				'$.id:invalid-id',
				'$.name:invalid-string',
				'$.steps[0].placement:invalid-placement',
				'$.steps[0].route:invalid-route',
				'$.steps[0].timeout:invalid-number',
				'$.steps[1].id:duplicate-id',
				'$.steps[1].interactive:interactive-needs-target'
			])
		);
	});

	it('warns about position-based selectors without failing', () => {
		const d = doc();
		d.steps[1].target = 'ul > li:nth-child(2)';
		const result = validateTourDocument(d);
		expect(result.valid).toBe(true);
		expect(result.issues[0]).toMatchObject({ code: 'fragile-target', severity: 'warning' });
	});

	it('rejects non-objects and empty step lists', () => {
		expect(validateTourDocument(null).valid).toBe(false);
		expect(validateTourDocument({ ...doc(), steps: [] }).valid).toBe(false);
	});
});

describe('parse / compile / format', () => {
	it('parses JSON text and throws with paths on bad input', () => {
		expect(parseTourDocument(JSON.stringify(doc())).id).toBe('onboarding');
		expect(() => parseTourDocument('{oops')).toThrow(TourDocumentError);
		try {
			parseTourDocument({ ...doc(), id: '' });
		} catch (error) {
			expect((error as TourDocumentError).issues[0].path).toBe('$.id');
		}
	});

	it('compiles to steps and resolves handlers from the registry only', async () => {
		const save = vi.fn();
		const steps = compileTourDocument(doc(), {
			actions: { save },
			conditions: { canSave: () => true }
		});
		expect(steps).toHaveLength(3);
		expect(steps[0].target).toBeUndefined();
		expect(steps[1].advanceOn).toEqual({ event: 'click' });
		await steps[2].action?.onClick();
		expect(save).toHaveBeenCalled();
		expect(await steps[2].when?.()).toBe(true);
	});

	it('throws when a referenced handler is not registered', () => {
		expect(() => compileTourDocument(doc())).toThrow(/Register "save"/);
	});

	it('does not mutate the caller document', () => {
		const original = doc();
		const copy = structuredClone(original);
		compileTourDocument(original, {
			actions: { save: () => {} },
			conditions: { canSave: () => true }
		});
		expect(original).toEqual(copy);
	});

	it('formats with canonical key order', () => {
		const out = formatTourDocument({
			steps: doc().steps,
			name: 'Onboarding',
			id: 'onboarding',
			schemaVersion: 1
		});
		expect(Object.keys(JSON.parse(out))).toEqual(['schemaVersion', 'id', 'name', 'steps']);
		expect(out.endsWith('\n')).toBe(true);
	});

	it('creates a valid starter and inspects documents', () => {
		expect(validateTourDocument(createTourDocument()).valid).toBe(true);
		const info = inspectTourDocument(doc());
		expect(info).toMatchObject({
			stepCount: 3,
			routes: ['/projects'],
			actions: ['save'],
			conditions: ['canSave']
		});
		expect(info.targets[0].target).toBeNull();
	});
});

describe('JSON Schema', () => {
	const schema = JSON.parse(
		readFileSync(new URL('../../schema/tour.schema.json', import.meta.url), 'utf8')
	);

	it('lists the same step fields as the validator accepts', () => {
		const fields = Object.keys(schema.properties.steps.items.properties).sort();
		const allowed = Object.keys({
			...doc().steps[0],
			...doc().steps[1],
			...doc().steps[2]
		});
		for (const key of allowed) expect(fields).toContain(key);
		expect(schema.properties.steps.items.required).toEqual(['id', 'title', 'content']);
	});
});

describe('themes', () => {
	it('maps built-in names and custom tokens to CSS variables', () => {
		expect(themeName(undefined)).toBe('light');
		expect(themeName('dark')).toBe('dark');
		expect(themeName({ base: 'auto', primary: 'red' })).toBe('auto');
		expect(themeStyle('dark')).toBe('');
		expect(themeStyle({ primary: '#f0f', radius: '4px' })).toBe(
			'--tourlight-primary: #f0f; --tourlight-radius: 4px'
		);
	});

	it('strips characters that could break out of the declaration', () => {
		expect(themeStyle({ primary: 'red; } body { color: red' })).toBe(
			'--tourlight-primary: red  body  color: red'
		);
	});
});
