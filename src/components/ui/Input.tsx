import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    fullWidth?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>((
    { label, error, fullWidth = false, className = '', ...props },
    ref
) => {
    const [isFocused, setIsFocused] = React.useState(false);

    const inputBorderClass = error
        ? 'border-danger'
        : isFocused
            ? 'border-primary'
            : 'border-border';

    return (
        <div className={['flex flex-col gap-xs font-sans', fullWidth ? 'w-full' : ''].join(' ')}>
            {label && (
                <label className="text-sm text-text-secondary">{label}</label>
            )}
            <input
                ref={ref}
                className={[
                    'w-full px-md py-sm',
                    'bg-bg border rounded-md',
                    'text-base text-text-primary font-sans',
                    'outline-none transition-all duration-200',
                    inputBorderClass,
                    className,
                ].join(' ')}
                onFocus={(e) => { setIsFocused(true); props.onFocus?.(e); }}
                onBlur={(e) => { setIsFocused(false); props.onBlur?.(e); }}
                {...props}
            />
            {error && <span className="text-sm text-danger">{error}</span>}
        </div>
    );
});

Input.displayName = 'Input';
