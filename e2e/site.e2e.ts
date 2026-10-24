import { expect, test, type Page } from '@playwright/test';

const pages = [
	'./',
	'./getting-started',
	'./examples/basic',
	'./examples/multi-page',
	'./examples/multi-page/second',
	'./examples/interactive',
	'./examples/beacons',
	'./examples/json',
	'./examples/themes',
	'./examples/mobile',
	'./examples/accessibility',
	'./examples/reduced-motion',
	'./examples/analytics',
	'./examples/headless'
];

async function fresh(page: Page, path: string) {
	await page.goto(path);
	await page.evaluate(() => sessionStorage.clear());
	await page.reload();
}

const dialog = (page: Page) => page.getByRole('dialog');

test('multi-page tour navigates and survives a reload', async ({ page }) => {
	await fresh(page, './examples/multi-page');
	await page.getByRole('button', { name: 'Start multi-page tour' }).click();
	await expect(dialog(page).getByRole('heading', { name: 'A tour that travels' })).toBeVisible();
	await page.keyboard.press('ArrowRight');
	await expect(dialog(page).getByRole('heading', { name: 'Page one' })).toBeVisible();
	await dialog(page).getByRole('button', { name: 'Next' }).click();
	await expect(page).toHaveURL(/\/examples\/multi-page\/second$/);
	await expect(dialog(page).getByRole('heading', { name: 'Page two' })).toBeVisible();
	await page.reload();
	await expect(dialog(page).getByRole('heading', { name: 'Page two' })).toBeVisible();
	await dialog(page).getByRole('button', { name: 'Next' }).click();
	await expect(page).toHaveURL(/\/examples\/multi-page$/);
	await expect(dialog(page).getByRole('heading', { name: 'And back again' })).toBeVisible();
	await dialog(page).getByRole('button', { name: 'Done' }).click();
	await expect(dialog(page)).toHaveCount(0);
});

test('interactive steps advance on the real click and submit', async ({ page }) => {
	await fresh(page, './examples/interactive');
	await page.getByRole('button', { name: 'Start interactive tour' }).click();
	await expect(dialog(page).getByRole('heading', { name: 'Add your first item' })).toBeVisible();
	await page.getByRole('button', { name: 'Add item' }).click();
	await expect(dialog(page).getByRole('heading', { name: 'Name it' })).toBeVisible();
	await page.getByLabel('Item name').fill('Escape room');
	await page.getByLabel('Item name').press('Enter');
	await expect(dialog(page).getByRole('heading', { name: 'Play freely' })).toBeVisible();
	await expect(page.locator('.list')).toContainText('Escape room');
	await page.getByRole('button', { name: /Clicked 0/ }).click();
	await expect(page.getByRole('button', { name: /Clicked 1/ })).toBeVisible();
});

test('JSON page shows validation errors and runs a valid document', async ({ page }) => {
	await fresh(page, './examples/json');
	await page.getByRole('button', { name: 'Load a broken document' }).click();
	await expect(page.getByRole('status').filter({ hasText: 'errors' })).toBeVisible();
	await expect(page.getByLabel('Validation issues')).toContainText('$.steps[1].id');
	await expect(page.getByRole('button', { name: 'Run this tour' })).toBeDisabled();
	await page.getByRole('button', { name: 'Reset' }).click();
	await page.getByRole('button', { name: 'Run this tour' }).click();
	await expect(dialog(page).getByRole('heading', { name: 'From JSON' })).toBeVisible();
});

test('beacon opens a highlight, Escape closes it and focus returns', async ({ page }) => {
	await fresh(page, './examples/beacons');
	const beacon = page.getByRole('button', { name: 'What does Export do?' });
	await beacon.click();
	await expect(dialog(page).getByRole('heading', { name: 'Export' })).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(dialog(page)).toHaveCount(0);
	await expect(beacon).toBeVisible();
});

test('keyboard tour announces steps and returns focus', async ({ page }) => {
	await fresh(page, './examples/accessibility');
	const start = page.getByRole('button', { name: 'Start with the keyboard' });
	await start.click();
	await expect(dialog(page).getByRole('button', { name: 'Next' })).toBeFocused();
	await expect(page.locator('.tourlight-portal [aria-live]')).toHaveText(
		'Step 1 of 3: Use the keyboard'
	);
	await page.keyboard.press('ArrowRight');
	await expect(page.locator('.tourlight-portal [aria-live]')).toHaveText(
		'Step 2 of 3: Focus is managed'
	);
	await page.keyboard.press('Escape');
	await expect(start).toBeFocused();
});

test('analytics log records events including target-missing', async ({ page }) => {
	await fresh(page, './examples/analytics');
	await page.getByRole('button', { name: 'Start tour' }).click();
	await dialog(page).getByRole('button', { name: 'Next' }).click();
	await expect(dialog(page).getByRole('heading', { name: 'Missing targets' })).toBeVisible();
	await expect(page.locator('.log')).toContainText('target-missing');
});

test('forced reduced motion removes the tooltip transition', async ({ page }) => {
	await fresh(page, './examples/reduced-motion');
	await page.getByRole('radio', { name: 'On' }).check({ force: true });
	await page.getByRole('button', { name: 'Start tour' }).click();
	const duration = await page
		.locator('.tourlight-tooltip')
		.evaluate((el) => getComputedStyle(el).transitionDuration);
	expect(duration.split(',').every((d) => parseFloat(d) === 0)).toBe(true);
});

test('phone sheet docks at the top for a fixed tab bar, or as forced', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 760 });
	for (const [mode, expected] of [
		['auto', 'top'],
		['bottom', 'bottom']
	] as const) {
		await fresh(page, `./examples/mobile/frame?sheet=${mode}`);
		await page.getByRole('button', { name: 'Start phone tour' }).click();
		await page.keyboard.press('ArrowRight');
		await page.keyboard.press('ArrowRight');
		await expect(dialog(page).getByRole('heading', { name: 'A fixed tab bar' })).toBeVisible();
		await expect(page.locator('.tourlight-tooltip')).toHaveAttribute('data-sheet', expected);
		if (expected === 'top') {
			const sheet = (await page.locator('.tourlight-tooltip').boundingBox())!;
			const bar = (await page.getByRole('navigation', { name: 'App sections' }).boundingBox())!;
			expect(sheet.y + sheet.height).toBeLessThanOrEqual(bar.y);
		}
	}
});

test('overlay uses a scoped theme attribute (daisyUI-safe)', async ({ page }) => {
	await fresh(page, './examples/themes');
	await page.getByRole('radio', { name: 'Dark' }).check({ force: true });
	await page.getByRole('button', { name: 'Preview theme' }).click();
	const root = page.locator('.tourlight-root').first();
	await expect(root).toHaveAttribute('data-tourlight-theme', 'dark');
	expect(await root.getAttribute('data-theme')).toBeNull();
});

for (const width of [320, 390, 768, 1280]) {
	test(`every page fits at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 800 });
		for (const path of pages) {
			await page.goto(path);
			await expect(page.locator('h1').first()).toBeVisible();
			const overflow = await page.evaluate(
				() => document.documentElement.scrollWidth - window.innerWidth
			);
			expect(overflow, `${path} overflows at ${width}px`).toBeLessThanOrEqual(0);
		}
	});

	test(`tour step fits and has 44px controls at ${width}px`, async ({ page }) => {
		await page.setViewportSize({ width, height: 800 });
		await fresh(page, './examples/basic');
		await page.getByRole('button', { name: 'Start at step 3' }).click();
		const tooltip = page.locator('.tourlight-tooltip');
		await expect(tooltip).toBeVisible();
		await expect(tooltip).toHaveAttribute('data-shown', '');
		const box = await tooltip.boundingBox();
		expect(box!.x).toBeGreaterThanOrEqual(0);
		expect(box!.x + box!.width).toBeLessThanOrEqual(width + 0.5);
		expect(await tooltip.evaluate((el) => el.hasAttribute('data-sheet'))).toBe(width < 640);
		for (const button of await tooltip.getByRole('button').all()) {
			expect((await button.boundingBox())!.height).toBeGreaterThanOrEqual(44);
		}
	});
}
