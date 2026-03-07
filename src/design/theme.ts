/**
 * theme.ts — Component Variant Class Strings
 *
 * This is the ONLY place where Tailwind class combinations live.
 * Pages and features must NEVER define their own color/spacing classes.
 *
 * Usage:
 *   import { theme } from '../../design/theme';
 *   <button className={theme.button.primary}>...</button>
 */

export const theme = {
    // ─── Button ────────────────────────────────────────────────────────────
    button: {
        base: [
            'inline-flex items-center justify-center',
            'font-sans font-medium',
            'rounded-md cursor-pointer',
            'transition-all duration-200',
            'active:scale-[0.97]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
        ].join(' '),

        variants: {
            primary: 'bg-primary text-white hover:bg-primary-hover border-0',
            secondary: 'bg-surface text-text-primary hover:bg-border border-0',
            outline: 'bg-transparent text-text-primary border border-border hover:border-primary',
            ghost: 'bg-transparent text-text-primary hover:bg-surface border-0',
            glass: 'bg-surface/80 text-text-primary border border-border backdrop-blur-md hover:bg-white/80',
        },

        sizes: {
            sm: 'px-sm py-xs text-sm',
            md: 'px-md py-sm text-base',
            lg: 'px-xl py-md text-lg',
        },
    },

    // ─── Card ───────────────────────────────────────────────────────────────
    card: {
        base: 'rounded-lg text-text-primary font-sans shadow-md',
        variants: {
            default: 'bg-bg border border-border',
            glass: 'bg-surface/80 backdrop-blur-md border border-border',
        },
        padding: {
            xs: 'p-xs',
            sm: 'p-sm',
            md: 'p-md',
            lg: 'p-lg',
            xl: 'p-xl',
            xxl: 'p-xxl',
            none: 'p-0',
        },
    },

    // ─── Badge / Tag ─────────────────────────────────────────────────────────
    badge: {
        base: 'inline-flex items-center font-bold rounded-full text-xs px-[8px] py-[2px]',
        primary: 'bg-primary/10 text-primary',
        success: 'bg-success/10 text-success',
        danger: 'bg-danger/10 text-danger',
        warning: 'bg-warning/10 text-warning',
        muted: 'bg-surface text-text-secondary',
    },

    // ─── Section / Layout ────────────────────────────────────────────────────
    section: {
        container: 'max-w-[1200px] mx-auto px-xl',
        narrow: 'max-w-[800px] mx-auto px-xl',
        page: 'min-h-screen bg-bg font-sans',
    },

    // ─── NavLink active/inactive ───────────────────────────────────────────
    nav: {
        link: 'text-sm font-medium text-text-secondary transition-colors duration-200 hover:text-primary no-underline',
        active: 'text-sm font-bold text-primary',
    },
} as const;
