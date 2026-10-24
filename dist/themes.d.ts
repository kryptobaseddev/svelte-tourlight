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
export type TourlightThemeInput = Partial<TourlightTheme> & {
    base?: 'light' | 'dark' | 'auto';
};
/** The `theme` prop: a built-in name or a custom theme. */
export type ThemeProp = 'light' | 'dark' | 'auto' | TourlightThemeInput;
/** The CSS variable name behind a theme token. */
export declare function themeVar(token: keyof TourlightTheme): string;
/** The base theme name for the `data-tourlight-theme` attribute. */
export declare function themeName(theme: ThemeProp | undefined): 'light' | 'dark' | 'auto';
/** Inline `style` declarations for a custom theme's overrides ('' for built-ins). */
export declare function themeStyle(theme: ThemeProp | undefined): string;
