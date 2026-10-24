import { page, userEvent } from 'vitest/browser';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { createMemoryStorage, type SpotlightStep, type TourEvent } from '../lib/index.js';
import Harness from './Harness.svelte';

const basic: SpotlightStep[] = [
	{ id: 'one', target: '#first', title: 'First thing', content: 'This is the first button.' },
	{ id: 'two', target: '#second', title: 'Second thing', content: 'And the second.' }
];

const dialog = () => page.getByRole('dialog');

beforeEach(async () => {
	await page.viewport(1280, 800);
});

afterEach(() => {
	document.body.querySelectorAll('.tourlight-portal').forEach((n) => n.remove());
});

describe('SpotlightProvider + SpotlightTour', () => {
	it('shows a spotlight dialog and walks the steps with buttons', async () => {
		const events: TourEvent[] = [];
		render(Harness, { props: { steps: basic, log: events } });
		await page.getByRole('button', { name: 'Start', exact: true }).click();

		await expect.element(dialog()).toBeVisible();
		await expect.element(page.getByRole('heading', { name: 'First thing' })).toBeVisible();
		await expect.element(page.getByText('Step 1 of 2', { exact: true })).toBeVisible();
		const overlay = document.querySelector<HTMLElement>('.tourlight-overlay')!;
		expect(overlay.style.clipPath).toContain('evenodd');

		await page.getByRole('button', { name: 'Next' }).click();
		await expect.element(page.getByRole('heading', { name: 'Second thing' })).toBeVisible();
		await page.getByRole('button', { name: 'Done' }).click();
		await expect.element(dialog()).not.toBeInTheDocument();
		expect(events.map((e) => e.type)).toEqual(['start', 'step', 'step', 'complete']);
	});

	it('announces each step in a live region', async () => {
		render(Harness, { props: { steps: basic } });
		await page.getByRole('button', { name: 'Start', exact: true }).click();
		await expect.element(dialog()).toBeVisible();
		const live = document.querySelector('[aria-live="polite"]');
		await expect.poll(() => live?.textContent).toBe('Step 1 of 2: First thing');
	});

	it('supports keyboard: arrows navigate, Escape skips and focus returns', async () => {
		const events: TourEvent[] = [];
		render(Harness, { props: { steps: basic, log: events } });
		const start = page.getByRole('button', { name: 'Start', exact: true });
		await start.click();
		await expect.element(page.getByRole('button', { name: 'Next' })).toHaveFocus();
		await userEvent.keyboard('{ArrowRight}');
		await expect.element(page.getByRole('heading', { name: 'Second thing' })).toBeVisible();
		await userEvent.keyboard('{ArrowLeft}');
		await expect.element(page.getByRole('heading', { name: 'First thing' })).toBeVisible();
		await userEvent.keyboard('{Escape}');
		await expect.element(dialog()).not.toBeInTheDocument();
		expect(events.at(-1)).toMatchObject({ type: 'skip', stepIndex: 0 });
		await expect.element(start).toHaveFocus();
	});

	it('makes the page inert while a step shows', async () => {
		render(Harness, { props: { steps: basic } });
		await page.getByRole('button', { name: 'Start', exact: true }).click();
		await expect.element(dialog()).toBeVisible();
		expect(document.querySelector('main')?.closest('[inert]')).not.toBeNull();
		await page.getByRole('button', { name: 'Close tour' }).click();
		await expect.poll(() => document.querySelector('[inert]')).toBeNull();
	});

	it('starts at step N', async () => {
		render(Harness, { props: { steps: basic } });
		await page.getByRole('button', { name: 'Start at 2' }).click();
		await expect.element(page.getByRole('heading', { name: 'Second thing' })).toBeVisible();
	});

	it('advances when the real target is clicked (advanceOn + pass-through)', async () => {
		const steps: SpotlightStep[] = [
			{
				id: 'click',
				target: '#second',
				title: 'Click it',
				content: 'Use the real button.',
				advanceOn: { event: 'click' }
			},
			{ id: 'after', target: '#first', title: 'Nice', content: 'It worked.' }
		];
		render(Harness, { props: { steps } });
		await page.getByRole('button', { name: 'Start', exact: true }).click();
		await expect.element(page.getByRole('heading', { name: 'Click it' })).toBeVisible();
		expect(document.querySelectorAll('.tourlight-blocker')).toHaveLength(4);
		// A real pointer click through the hole reaches the app's own handler.
		await page.getByRole('button', { name: /Second/ }).click();
		await expect.element(page.getByRole('heading', { name: 'Nice' })).toBeVisible();
		await expect.element(page.getByRole('button', { name: 'Second (1)' })).toBeInTheDocument();
	});

	it('renders a centered step when there is no target', async () => {
		render(Harness, {
			props: { steps: [{ id: 'hi', title: 'Welcome', content: 'No target here.' }] }
		});
		await page.getByRole('button', { name: 'Start', exact: true }).click();
		await expect.element(dialog()).toBeVisible();
		expect(document.querySelector('.tourlight-tooltip')?.hasAttribute('data-centered')).toBe(true);
	});

	it('skips a step whose target never appears and reports it', async () => {
		const events: TourEvent[] = [];
		const steps: SpotlightStep[] = [
			{ id: 'missing', target: '#nope', title: 'Ghost', content: '', timeout: 50 },
			basic[1]
		];
		render(Harness, { props: { steps, log: events } });
		await page.getByRole('button', { name: 'Start', exact: true }).click();
		await expect.element(page.getByRole('heading', { name: 'Second thing' })).toBeVisible();
		expect(events.some((e) => e.type === 'target-missing')).toBe(true);
	});

	it('persists progress and resumes after a remount (reload)', async () => {
		const storage = createMemoryStorage();
		const first = render(Harness, { props: { steps: basic, persist: storage } });
		await page.getByRole('button', { name: 'Start', exact: true }).click();
		await page.getByRole('button', { name: 'Next' }).click();
		await expect.element(page.getByRole('heading', { name: 'Second thing' })).toBeVisible();
		first.unmount();
		document.body.querySelectorAll('.tourlight-portal').forEach((n) => n.remove());

		render(Harness, { props: { steps: basic, persist: storage } });
		await expect.element(page.getByRole('heading', { name: 'Second thing' })).toBeVisible();
	});

	it('calls navigate for steps on another route', async () => {
		const visited: string[] = [];
		const steps: SpotlightStep[] = [
			{
				id: 'elsewhere',
				target: '#first',
				route: '/somewhere-else',
				title: 'Other page',
				content: '',
				timeout: 100
			}
		];
		render(Harness, { props: { steps, navigate: (path: string) => void visited.push(path) } });
		await page.getByRole('button', { name: 'Start', exact: true }).click();
		await expect.poll(() => visited).toEqual(['/somewhere-else']);
	});

	it('beacon starts the tour and hides while it runs', async () => {
		render(Harness, { props: { steps: basic, beacon: true } });
		const beacon = page.getByRole('button', { name: 'Show tips' });
		await expect.element(beacon).toBeVisible();
		const box = beacon.element().getBoundingClientRect();
		expect(box.width).toBeGreaterThanOrEqual(44);
		await beacon.click();
		await expect.element(dialog()).toBeVisible();
		await expect.element(beacon).not.toBeInTheDocument();
	});

	it('uses a bottom sheet on narrow screens', async () => {
		await page.viewport(375, 700);
		render(Harness, { props: { steps: basic } });
		await page.getByRole('button', { name: 'Start', exact: true }).click();
		await expect.element(dialog()).toBeVisible();
		const tooltip = document.querySelector<HTMLElement>('.tourlight-tooltip')!;
		expect(tooltip.hasAttribute('data-sheet')).toBe(true);
		// Wait for the slide-up transition to settle.
		await expect
			.poll(() => Math.round(tooltip.getBoundingClientRect().bottom))
			.toBe(window.innerHeight);
		const buttons = [...tooltip.querySelectorAll<HTMLElement>('button')];
		for (const b of buttons) expect(b.getBoundingClientRect().height).toBeGreaterThanOrEqual(44);
		await page.viewport(1280, 800);
	});

	it('applies a custom theme and forced reduced motion', async () => {
		render(Harness, {
			steps: basic,
			theme: { base: 'dark', primary: 'rgb(1, 2, 3)' },
			reducedMotion: true
		});
		await page.getByRole('button', { name: 'Start', exact: true }).click();
		await expect.element(dialog()).toBeVisible();
		const root = document.querySelector<HTMLElement>('.tourlight-root')!;
		expect(root.dataset.theme).toBe('dark');
		expect(root.hasAttribute('data-reduced-motion')).toBe(true);
		const next = page.getByRole('button', { name: 'Next' }).element();
		expect(getComputedStyle(next).backgroundColor).toBe('rgb(1, 2, 3)');
	});
});
