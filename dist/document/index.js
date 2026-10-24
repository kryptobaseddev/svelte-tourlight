/** Maximum UTF-8 size of a formatted document. */
export const MAX_TOUR_DOCUMENT_BYTES = 4_000_000;
/** The URL in a document's `$schema` field. */
export const TOUR_SCHEMA_URL = 'https://raw.githubusercontent.com/kryptobaseddev/svelte-tourlight/main/schema/tour.schema.json';
export class TourDocumentError extends Error {
    issues;
    constructor(issues) {
        super(issues.map((issue) => `${issue.path}: ${issue.message}`).join('\n'));
        this.name = 'TourDocumentError';
        this.issues = issues;
    }
}
const IDENTIFIER = /^[a-zA-Z0-9][a-zA-Z0-9._-]*$/;
const DOCUMENT_KEYS = ['$schema', 'schemaVersion', 'id', 'name', 'description', 'steps'];
const STEP_KEYS = [
    'id',
    'target',
    'title',
    'content',
    'placement',
    'route',
    'interactive',
    'advanceOn',
    'timeout',
    'spotlightPadding',
    'spotlightRadius',
    'disableOverlayClose',
    'action',
    'condition',
    'beforeShow',
    'beforeStep',
    'afterShow',
    'onHide'
];
const HOOK_KEYS = ['beforeShow', 'beforeStep', 'afterShow', 'onHide'];
const PLACEMENTS = ['top', 'bottom', 'left', 'right', 'auto'];
function byteLength(json) {
    return new TextEncoder().encode(json).byteLength;
}
function isPlainObject(value) {
    if (value === null || typeof value !== 'object' || Array.isArray(value))
        return false;
    const proto = Object.getPrototypeOf(value);
    return proto === Object.prototype || proto === null;
}
/** Check a value against the document format. Never touches the DOM or runs callbacks. */
export function validateTourDocument(input) {
    const issues = [];
    const error = (path, code, message) => issues.push({ path, code, message, severity: 'error' });
    const keys = (value, allowed, path) => {
        for (const key of Object.keys(value)) {
            if (!allowed.includes(key))
                error(`${path}.${key}`, 'unknown-field', `Unknown field "${key}".`);
        }
    };
    const string = (value, path, max, allowEmpty = false) => {
        if (typeof value !== 'string' || (!allowEmpty && !value.trim()) || [...value].length > max) {
            error(path, 'invalid-string', `Expected ${allowEmpty ? 'a' : 'a non-empty'} string of at most ${max} characters.`);
            return false;
        }
        return true;
    };
    const id = (value, path) => {
        if (string(value, path, 128) && !IDENTIFIER.test(value)) {
            error(path, 'invalid-id', 'Use letters, numbers, dots, underscores or hyphens, starting with a letter or number.');
        }
    };
    if (!isPlainObject(input)) {
        error('$', 'invalid-document', 'Expected a tour document object.');
        return { valid: false, issues };
    }
    keys(input, DOCUMENT_KEYS, '$');
    if (input.schemaVersion !== 1)
        error('$.schemaVersion', 'unsupported-version', 'Expected schemaVersion 1.');
    if (input.$schema !== undefined)
        string(input.$schema, '$.$schema', 2048);
    id(input.id, '$.id');
    string(input.name, '$.name', 200);
    if (input.description !== undefined)
        string(input.description, '$.description', 5000, true);
    if (!Array.isArray(input.steps) || input.steps.length < 1 || input.steps.length > 200) {
        error('$.steps', 'invalid-steps', 'Expected between 1 and 200 steps.');
        return { valid: false, issues };
    }
    const seen = new Set();
    for (let index = 0; index < input.steps.length; index++) {
        const path = `$.steps[${index}]`;
        if (!Object.hasOwn(input.steps, index)) {
            error(path, 'invalid-step', 'Sparse arrays are not valid tour documents.');
            continue;
        }
        const step = input.steps[index];
        if (!isPlainObject(step)) {
            error(path, 'invalid-step', 'Expected a step object.');
            continue;
        }
        keys(step, STEP_KEYS, path);
        id(step.id, `${path}.id`);
        if (typeof step.id === 'string') {
            if (seen.has(step.id))
                error(`${path}.id`, 'duplicate-id', `Step id "${step.id}" must be unique.`);
            seen.add(step.id);
        }
        if (step.target !== undefined)
            string(step.target, `${path}.target`, 2048);
        string(step.title, `${path}.title`, 300);
        string(step.content, `${path}.content`, 10000, true);
        if (step.placement !== undefined && !PLACEMENTS.includes(step.placement)) {
            error(`${path}.placement`, 'invalid-placement', `Expected one of: ${PLACEMENTS.join(', ')}.`);
        }
        if (step.route !== undefined && string(step.route, `${path}.route`, 2048)) {
            const route = step.route;
            if (!route.startsWith('/') ||
                route.startsWith('//') ||
                [...route].some((c) => c === '\\' || c.charCodeAt(0) <= 32)) {
                error(`${path}.route`, 'invalid-route', 'Use an app-relative path starting with a single /, with no whitespace or backslashes.');
            }
        }
        for (const key of ['interactive', 'disableOverlayClose']) {
            if (step[key] !== undefined && typeof step[key] !== 'boolean')
                error(`${path}.${key}`, 'invalid-boolean', 'Expected a boolean.');
        }
        for (const [key, max] of [
            ['timeout', 120000],
            ['spotlightPadding', 200],
            ['spotlightRadius', 1000]
        ]) {
            const value = step[key];
            if (value !== undefined &&
                (typeof value !== 'number' || !Number.isFinite(value) || value < 0 || value > max)) {
                error(`${path}.${key}`, 'invalid-number', `Expected a number between 0 and ${max}.`);
            }
        }
        for (const key of [...HOOK_KEYS, 'condition']) {
            if (step[key] !== undefined)
                id(step[key], `${path}.${key}`);
        }
        if (step.action !== undefined) {
            if (!isPlainObject(step.action))
                error(`${path}.action`, 'invalid-action', 'Expected { label, handler }.');
            else {
                keys(step.action, ['label', 'handler'], `${path}.action`);
                string(step.action.label, `${path}.action.label`, 100);
                id(step.action.handler, `${path}.action.handler`);
            }
        }
        if (step.advanceOn !== undefined) {
            if (!isPlainObject(step.advanceOn))
                error(`${path}.advanceOn`, 'invalid-event', 'Expected { event, selector? }.');
            else {
                keys(step.advanceOn, ['event', 'selector'], `${path}.advanceOn`);
                string(step.advanceOn.event, `${path}.advanceOn.event`, 128);
                if (step.advanceOn.selector !== undefined)
                    string(step.advanceOn.selector, `${path}.advanceOn.selector`, 2048);
                if (step.target === undefined)
                    error(`${path}.advanceOn`, 'advance-needs-target', 'advanceOn needs a target to listen on.');
            }
        }
        if (step.interactive === true && step.target === undefined) {
            error(`${path}.interactive`, 'interactive-needs-target', 'An interactive step needs a target.');
        }
        if (typeof step.target === 'string' && /:nth-(child|of-type)\(/.test(step.target)) {
            issues.push({
                path: `${path}.target`,
                code: 'fragile-target',
                message: 'Position-based selectors break when the layout changes. Prefer a data-tour attribute.',
                severity: 'warning'
            });
        }
    }
    if (!issues.some((issue) => issue.severity === 'error')) {
        if (byteLength(`${JSON.stringify(input, null, 2)}\n`) > MAX_TOUR_DOCUMENT_BYTES) {
            error('$', 'document-too-large', 'The formatted document is over the 4 MB limit. Split it into smaller tours.');
        }
    }
    return { valid: !issues.some((issue) => issue.severity === 'error'), issues };
}
/** Parse JSON text or check an object. Throws `TourDocumentError` with paths. Returns an owned copy. */
export function parseTourDocument(input) {
    let value = input;
    if (typeof input === 'string') {
        if (input.length > MAX_TOUR_DOCUMENT_BYTES || byteLength(input) > MAX_TOUR_DOCUMENT_BYTES) {
            throw new TourDocumentError([
                {
                    path: '$',
                    code: 'document-too-large',
                    message: 'Input is over the 4 MB limit.',
                    severity: 'error'
                }
            ]);
        }
        try {
            value = JSON.parse(input);
        }
        catch {
            throw new TourDocumentError([
                {
                    path: '$',
                    code: 'invalid-json',
                    message: 'Invalid JSON. Use double-quoted keys and no trailing commas.',
                    severity: 'error'
                }
            ]);
        }
    }
    const result = validateTourDocument(value);
    if (!result.valid)
        throw new TourDocumentError(result.issues);
    return JSON.parse(JSON.stringify(value));
}
/**
 * Turn a document into runtime steps for `<SpotlightTour steps>`. Handler
 * names resolve only against `registry`; a missing one throws.
 */
export function compileTourDocument(input, registry = {}) {
    const document = parseTourDocument(input);
    const issues = [];
    function resolve(map, name, path) {
        if (!map || !Object.hasOwn(map, name) || typeof map[name] !== 'function') {
            issues.push({
                path,
                code: 'missing-handler',
                message: `Register "${name}" before running this tour.`,
                severity: 'error'
            });
            return undefined;
        }
        return map[name];
    }
    const steps = document.steps.map((step, index) => {
        const { condition, beforeShow, beforeStep, afterShow, onHide, action, ...data } = step;
        const path = `$.steps[${index}]`;
        const result = { ...data };
        if (condition)
            result.when = resolve(registry.conditions, condition, `${path}.condition`);
        if (beforeShow)
            result.onBeforeShow = resolve(registry.actions, beforeShow, `${path}.beforeShow`);
        if (beforeStep)
            result.onBeforeStep = resolve(registry.actions, beforeStep, `${path}.beforeStep`);
        if (afterShow)
            result.onAfterShow = resolve(registry.actions, afterShow, `${path}.afterShow`);
        if (onHide)
            result.onHide = resolve(registry.actions, onHide, `${path}.onHide`);
        if (action) {
            const onClick = resolve(registry.actions, action.handler, `${path}.action.handler`);
            if (onClick)
                result.action = { label: action.label, onClick };
        }
        return result;
    });
    if (issues.length)
        throw new TourDocumentError(issues);
    return steps;
}
/** A small valid document to start editing from. */
export function createTourDocument(options = {}) {
    return parseTourDocument({
        $schema: TOUR_SCHEMA_URL,
        schemaVersion: 1,
        id: options.id ?? 'welcome',
        name: options.name ?? 'Welcome tour',
        steps: [
            {
                id: 'welcome',
                target: '[data-tour="welcome"]',
                title: 'Welcome aboard',
                content: 'Let’s take a quick look around.',
                placement: 'bottom'
            }
        ]
    });
}
/** Pretty-print with a canonical key order so diffs stay readable. */
export function formatTourDocument(input) {
    const document = parseTourDocument(input);
    const pick = (value, order) => Object.fromEntries(order
        .filter((key) => Object.hasOwn(value, key) && value[key] !== undefined)
        .map((key) => [key, value[key]]));
    const steps = document.steps.map((step) => ({
        ...pick(step, STEP_KEYS),
        ...(step.advanceOn ? { advanceOn: pick(step.advanceOn, ['event', 'selector']) } : {}),
        ...(step.action ? { action: pick(step.action, ['label', 'handler']) } : {})
    }));
    return `${JSON.stringify({ ...pick(document, DOCUMENT_KEYS), steps }, null, 2)}\n`;
}
/** A static summary for review tools: routes, handler names, targets and issues. */
export function inspectTourDocument(input) {
    const document = parseTourDocument(input);
    return {
        id: document.id,
        name: document.name,
        stepCount: document.steps.length,
        routes: [...new Set(document.steps.flatMap((step) => (step.route ? [step.route] : [])))],
        actions: [
            ...new Set(document.steps.flatMap((step) => [step.action?.handler, ...HOOK_KEYS.map((key) => step[key])].filter((value) => Boolean(value))))
        ],
        conditions: [
            ...new Set(document.steps.flatMap((step) => (step.condition ? [step.condition] : [])))
        ],
        targets: document.steps.map((step) => ({
            stepId: step.id,
            target: step.target ?? null,
            route: step.route ?? null
        })),
        issues: validateTourDocument(document).issues
    };
}
