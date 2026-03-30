/**
 * Dark mode implementation note.
 * Dark mode is implemented via @media (prefers-color-scheme: dark) in globals.css.
 * CSS custom properties change between light and dark themes automatically.
 * TRACED:FD-UI-005
 */
export const DARK_MODE_STRATEGY = 'prefers-color-scheme' as const;
