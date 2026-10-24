import type { SpotlightStep } from '#lib';

/** Registered in the root layout so it stays alive across navigations. */
export const multiPageSteps: SpotlightStep[] = [
	{
		id: 'mp-welcome',
		route: '/examples/multi-page',
		title: 'A tour that travels',
		content:
			'This tour spans two pages. The provider sits in the root layout, so it survives navigation.'
	},
	{
		id: 'mp-first',
		route: '/examples/multi-page',
		target: '[data-tour="mp-first"]',
		title: 'Page one',
		content: 'Press Next and the tour navigates to the second page for you.'
	},
	{
		id: 'mp-second',
		route: '/examples/multi-page/second',
		target: '[data-tour="mp-second"]',
		title: 'Page two',
		content:
			'We called navigate() with this step’s route. Now reload: progress is in sessionStorage.',
		placement: 'top'
	},
	{
		id: 'mp-back',
		route: '/examples/multi-page',
		target: '[data-tour="mp-done"]',
		title: 'And back again',
		content: 'Steps can point at any page, in any order.'
	}
];
