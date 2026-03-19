import React, { useRef, useEffect, useState } from 'react';

export interface SelectOption<T extends string = string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string = string> {
  value: T;
  options: SelectOption<T>[];
  onChange: (value: T) => void;
  'aria-label': string;
  className?: string;
}

/**
 * 페이지 디자인과 일관된 드롭다운 셀렉트. 열린 목록은 theme( surface, border ) 적용.
 */
export function Select<T extends string = string>({
  value,
  options,
  onChange,
  'aria-label': ariaLabel,
  className = '',
}: SelectProps<T>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const selected = options.find((o) => o.value === value);
  const displayLabel = selected?.label ?? value;

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((prev) => !prev)}
        className={[
          'inline-flex items-center justify-between gap-2 text-sm font-medium text-text-primary',
          'bg-surface border border-border rounded-lg pl-md py-xs pr-6',
          'hover:border-primary/50 focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer transition-colors',
        ].join(' ')}
      >
        <span className="truncate">{displayLabel}</span>
        <span
          className="pointer-events-none absolute right-3 flex items-center justify-center text-text-secondary"
          aria-hidden
        >
          <span className="material-icons-round text-lg">
            {open ? 'expand_less' : 'expand_more'}
          </span>
        </span>
      </button>

      {open && (
        <ul
          role="listbox"
          className={[
            'absolute z-50 mt-1 min-w-full rounded-lg border border-border shadow-lg overflow-hidden',
            'bg-surface text-text-primary',
            'py-xs max-h-60 overflow-y-auto',
          ].join(' ')}
          style={{ top: '100%', left: 0 }}
        >
          {options.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={opt.value === value}
              onClick={() => {
                onChange(opt.value as T);
                setOpen(false);
              }}
              className={[
                'px-md py-2 text-sm font-medium cursor-pointer transition-colors',
                opt.value === value
                  ? 'bg-primary/10 text-primary'
                  : 'hover:bg-bg text-text-primary',
              ].join(' ')}
            >
              {opt.label}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
