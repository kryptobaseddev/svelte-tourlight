import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
	webServer: {
		// Run vite directly: a package-manager wrapper can outlive Playwright's teardown.
		command: './node_modules/.bin/vite preview --port 4173 --strictPort',
		url: `http://localhost:4173${process.env.BASE_PATH ?? ''}/`,
		reuseExistingServer: !process.env.CI,
		stdout: 'pipe',
		timeout: 120_000
	},
	testDir: 'e2e',
	testMatch: '**/*.e2e.ts',
	timeout: 20_000,
	globalTimeout: 600_000,
	reporter: process.env.CI ? 'list' : 'line',
	// Matches the build: BASE_PATH=/svelte-tourlight reproduces GitHub Pages.
	use: {
		baseURL: `http://localhost:4173${process.env.BASE_PATH ?? ''}/`,
		trace: 'retain-on-failure'
	},
	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'] } },
		{
			name: 'phone',
			use: { ...devices['Pixel 7'] },
			grep: /survives a reload|interactive steps|beacon/
		}
	]
});
