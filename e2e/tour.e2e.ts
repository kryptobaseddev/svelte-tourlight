import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.goto('/');
	await page.evaluate(() => sessionStorage.clear());
	await page.reload();
});

test('JSON tour crosses pages, needs a real click and survives a reload', async ({ page }) => {
	await page.getByRole('button', { name: 'Start the tour' }).click();
	const dialog = page.getByRole('dialog');
	await expect(dialog.getByRole('heading', { name: 'Welcome to svelte-tourlight' })).toBeVisible();
	await dialog.getByRole('button', { name: 'Next' }).click();
	await expect(dialog.getByRole('heading', { name: 'Light, dark or auto' })).toBeVisible();
	await page.keyboard.press('ArrowRight');

	// Interactive step: the real counter button advances the tour.
	await expect(dialog.getByRole('heading', { name: 'Click the real button' })).toBeVisible();
	await page.getByRole('button', { name: /Clicked 0 times/ }).click();

	// The next step lives on /demo/settings; the provider navigates there.
	await expect(page).toHaveURL(/\/demo\/settings$/);
	await expect(
		dialog.getByRole('heading', { name: 'Steps follow you across pages' })
	).toBeVisible();

	await page.reload();
	await expect(
		page.getByRole('dialog').getByRole('heading', { name: 'Steps follow you across pages' })
	).toBeVisible();
	await page.getByRole('dialog').getByRole('button', { name: 'Next' }).click();
	await page.getByRole('dialog').getByRole('button', { name: 'Done' }).click();
	await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('no horizontal scroll and 44px controls while a step shows', async ({ page }) => {
	await page.getByRole('button', { name: 'Jump to step 4' }).click();
	const dialog = page.getByRole('dialog');
	await expect(dialog).toBeVisible();
	const overflow = await page.evaluate(
		() => document.documentElement.scrollWidth - window.innerWidth
	);
	expect(overflow).toBeLessThanOrEqual(0);
	for (const button of await dialog.getByRole('button').all()) {
		const box = await button.boundingBox();
		expect(box?.height ?? 0).toBeGreaterThanOrEqual(44);
	}
});

test('beacon opens a one-off highlight', async ({ page }) => {
	await page.getByRole('button', { name: 'What does Export do?' }).click();
	await expect(page.getByRole('dialog').getByRole('heading', { name: 'Export' })).toBeVisible();
	await page.keyboard.press('Escape');
	await expect(page.getByRole('dialog')).toHaveCount(0);
});

test('reduced motion is honoured', async ({ page }) => {
	await page.emulateMedia({ reducedMotion: 'reduce' });
	await page.getByRole('button', { name: 'Start the tour' }).click();
	const transition = await page
		.locator('.tourlight-tooltip')
		.evaluate((el) => getComputedStyle(el).transitionDuration);
	expect(transition.split(',').every((d) => parseFloat(d) === 0)).toBe(true);
});
