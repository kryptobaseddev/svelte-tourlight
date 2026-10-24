/**
 * Themes are sets of CSS custom properties on the tour's root element. The
 * built-in light and dark themes live in `styles.css`; a custom theme starts
 * from one of them and overrides any token.
 *
 * You can also skip the prop entirely and set the variables in your own CSS:
 *
 * ```css
 * .tourlight-root { --tourlight-primary: hotpink; }
 * ```
 */
export interface TourlightTheme {
	/** Backdrop colour, including alpha. */
	overlay: string;
	background: string;
	color: string;
	titleColor: string;
	mutedColor: string;
	border: string;
	radius: string;
	shadow: string;
	padding: string;
	maxWidth: string;
	fontFamily: string;
	titleSize: string;
	contentSize: string;
	primary: string;
	primaryColor: string;
	primaryHover: string;
	secondaryBorder: string;
	secondaryHover: string;
	progressTrack: string;
	progressFill: string;
	beacon: string;
	focusRing: string;
	/** Tooltip and overlay transition, for example `'250ms'`. */
	duration: string;
	zOverlay: string;
	zTooltip: string;
}

/** A custom theme: a base (default light) plus any tokens to override. */
export type TourlightThemeInput = Partial<TourlightTheme> & { base?: 'light' | 'dark' | 'auto' };

/** The `theme` prop: a built-in name or a custom theme. */
export type ThemeProp = 'light' | 'dark' | 'auto' | TourlightThemeInput;

const TOKEN_TO_VAR: Record<keyof TourlightTheme, string> = {
	overlay: '--tourlight-overlay',
	background: '--tourlight-bg',
	color: '--tourlight-fg',
	titleColor: '--tourlight-title',
	mutedColor: '--tourlight-muted',
	border: '--tourlight-border',
	radius: '--tourlight-radius',
	shadow: '--tourlight-shadow',
	padding: '--tourlight-padding',
	maxWidth: '--tourlight-max-width',
	fontFamily: '--tourlight-font',
	titleSize: '--tourlight-title-size',
	contentSize: '--tourlight-content-size',
	primary: '--tourlight-primary',
	primaryColor: '--tourlight-primary-fg',
	primaryHover: '--tourlight-primary-hover',
	secondaryBorder: '--tourlight-secondary-border',
	secondaryHover: '--tourlight-secondary-hover',
	progressTrack: '--tourlight-progress-track',
	progressFill: '--tourlight-progress-fill',
	beacon: '--tourlight-beacon',
	focusRing: '--tourlight-focus',
	duration: '--tourlight-duration',
	zOverlay: '--tourlight-z-overlay',
	zTooltip: '--tourlight-z-tooltip'
};

/** The CSS variable name behind a theme token. */
export function themeVar(token: keyof TourlightTheme): string {
	return TOKEN_TO_VAR[token];
}

/** The base theme name for the `data-theme` attribute. */
export function themeName(theme: ThemeProp | undefined): 'light' | 'dark' | 'auto' {
	if (!theme) return 'light';
	if (typeof theme === 'string') return theme;
	return theme.base ?? 'light';
}

/** Inline `style` declarations for a custom theme's overrides ('' for built-ins). */
export function themeStyle(theme: ThemeProp | undefined): string {
	if (!theme || typeof theme === 'string') return '';
	return Object.entries(theme)
		.filter(([key, value]) => key in TOKEN_TO_VAR && typeof value === 'string' && value)
		.map(
			([key, value]) =>
				`${TOKEN_TO_VAR[key as keyof TourlightTheme]}: ${String(value).replace(/[;{}]/g, '')}`
		)
		.join('; ');
}
