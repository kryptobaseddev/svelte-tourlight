const TOKEN_TO_VAR = {
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
export function themeVar(token) {
    return TOKEN_TO_VAR[token];
}
/** The base theme name for the `data-tourlight-theme` attribute. */
export function themeName(theme) {
    if (!theme)
        return 'light';
    if (typeof theme === 'string')
        return theme;
    return theme.base ?? 'light';
}
/** Inline `style` declarations for a custom theme's overrides ('' for built-ins). */
export function themeStyle(theme) {
    if (!theme || typeof theme === 'string')
        return '';
    return Object.entries(theme)
        .filter(([key, value]) => key in TOKEN_TO_VAR && typeof value === 'string' && value)
        .map(([key, value]) => `${TOKEN_TO_VAR[key]}: ${String(value).replace(/[;{}]/g, '')}`)
        .join('; ');
}
