import React from 'react';
import { theme } from '../../design/theme';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: keyof typeof theme.card.variants;
    padding?: keyof typeof theme.card.padding;
}

export const Card: React.FC<CardProps> = ({
    children,
    variant = 'default',
    padding = 'lg',
    className = '',
    ...props
}) => {
    const classes = [
        theme.card.base,
        theme.card.variants[variant],
        theme.card.padding[padding],
        className,
    ]
        .filter(Boolean)
        .join(' ');

    return (
        <div className={classes} {...props}>
            {children}
        </div>
    );
};
