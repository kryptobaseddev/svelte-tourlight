import type { RouteId } from '$app/types';

export interface NavItem {
	href: RouteId;
	label: string;
	blurb: string;
}

export const guides: NavItem[] = [
	{
		href: '/getting-started',
		label: 'Getting started',
		blurb: 'Install, provider, routing and persistence.'
	}
];

export const examples: NavItem[] = [
	{ href: '/examples/basic', label: 'Basic tour', blurb: 'Steps, buttons and starting at step N.' },
	{
		href: '/examples/multi-page',
		label: 'Multi-page tour',
		blurb: 'Follows you across routes and survives a reload.'
	},
	{
		href: '/examples/interactive',
		label: 'Interactive steps',
		blurb: 'Finish a step by using the real control.'
	},
	{
		href: '/examples/beacons',
		label: 'Beacons & highlights',
		blurb: 'Pulsing hint dots and one-off callouts.'
	},
	{
		href: '/examples/json',
		label: 'JSON tours',
		blurb: 'Tours as data, validated against a schema.'
	},
	{ href: '/examples/themes', label: 'Themes', blurb: 'Light, dark, auto and custom tokens.' },
	{
		href: '/examples/mobile',
		label: 'Phone bottom sheet',
		blurb: 'The tooltip becomes a sheet on small screens.'
	},
	{
		href: '/examples/accessibility',
		label: 'Keyboard & screen readers',
		blurb: 'Focus, keys, inert and announcements.'
	},
	{
		href: '/examples/reduced-motion',
		label: 'Reduced motion',
		blurb: 'No tweens, smooth scroll or pulse.'
	},
	{ href: '/examples/analytics', label: 'Analytics', blurb: 'One event stream with a live log.' },
	{
		href: '/examples/headless',
		label: 'Headless & custom UI',
		blurb: 'Custom tooltip snippet and the bare core.'
	}
];
