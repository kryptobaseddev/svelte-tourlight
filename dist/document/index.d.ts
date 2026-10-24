/**
 * svelte-tourlight/document: tours as plain JSON. Validate, parse, format and
 * compile documents into runtime steps. No DOM, no Svelte runtime, so it is
 * safe on the server and in build scripts.
 *
 * Documents never execute code. Actions and conditions are names that only
 * resolve against a registry your application passes to `compileTourDocument`.
 */
import type { AdvanceOn, Placement, SpotlightStep } from '../core/types.js';
/** Maximum UTF-8 size of a formatted document. */
export declare const MAX_TOUR_DOCUMENT_BYTES = 4000000;
/** The URL in a document's `$schema` field. */
export declare const TOUR_SCHEMA_URL = "https://raw.githubusercontent.com/kryptobaseddev/svelte-tourlight/main/schema/tour.schema.json";
export interface TourDocument {
    $schema?: string;
    schemaVersion: 1;
    id: string;
    name: string;
    description?: string;
    steps: TourDocumentStep[];
}
export interface TourDocumentStep {
    id: string;
    /** CSS selector. Leave it out for a centered step. */
    target?: string;
    title: string;
    /** Plain text. HTML is never rendered. */
    content: string;
    placement?: Placement;
    route?: string;
    interactive?: boolean;
    advanceOn?: AdvanceOn;
    timeout?: number;
    spotlightPadding?: number;
    spotlightRadius?: number;
    disableOverlayClose?: boolean;
    action?: {
        label: string;
        handler: string;
    };
    condition?: string;
    beforeShow?: string;
    beforeStep?: string;
    afterShow?: string;
    onHide?: string;
}
/** Named handlers a document may refer to. */
export interface TourRegistry {
    actions?: Record<string, () => void | Promise<void>>;
    conditions?: Record<string, () => boolean | Promise<boolean>>;
}
export interface TourDocumentIssue {
    /** JSON path, for example `$.steps[2].target`. */
    path: string;
    code: string;
    message: string;
    severity: 'error' | 'warning';
}
export interface TourDocumentValidation {
    valid: boolean;
    issues: TourDocumentIssue[];
}
export declare class TourDocumentError extends Error {
    readonly issues: TourDocumentIssue[];
    constructor(issues: TourDocumentIssue[]);
}
/** Check a value against the document format. Never touches the DOM or runs callbacks. */
export declare function validateTourDocument(input: unknown): TourDocumentValidation;
/** Parse JSON text or check an object. Throws `TourDocumentError` with paths. Returns an owned copy. */
export declare function parseTourDocument(input: string | unknown): TourDocument;
/**
 * Turn a document into runtime steps for `<SpotlightTour steps>`. Handler
 * names resolve only against `registry`; a missing one throws.
 */
export declare function compileTourDocument(input: TourDocument | string, registry?: TourRegistry): SpotlightStep[];
/** A small valid document to start editing from. */
export declare function createTourDocument(options?: {
    id?: string;
    name?: string;
}): TourDocument;
/** Pretty-print with a canonical key order so diffs stay readable. */
export declare function formatTourDocument(input: TourDocument | string): string;
/** A static summary for review tools: routes, handler names, targets and issues. */
export declare function inspectTourDocument(input: TourDocument | string): {
    id: string;
    name: string;
    stepCount: number;
    routes: string[];
    actions: string[];
    conditions: string[];
    targets: {
        stepId: string;
        target: string | null;
        route: string | null;
    }[];
    issues: TourDocumentIssue[];
};
