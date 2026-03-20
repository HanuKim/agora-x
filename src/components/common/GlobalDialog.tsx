import React, { useEffect, useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';

export type DialogType = 'alert' | 'confirm' | 'prompt';

interface GlobalDialogProps {
  isOpen: boolean;
  type?: DialogType;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: (inputValue?: string) => void;
  onCancel: () => void;
  placeholder?: string;
  defaultValue?: string;
  isDestructive?: boolean;
}

export const GlobalDialog: React.FC<GlobalDialogProps> = ({
  isOpen,
  type = 'confirm',
  title,
  message,
  confirmText = '확인',
  cancelText = '취소',
  onConfirm,
  onCancel,
  placeholder,
  defaultValue = '',
  isDestructive = false,
}) => {
  const [inputValue, setInputValue] = useState(defaultValue);

  useEffect(() => {
    if (isOpen) {
      setInputValue(defaultValue);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, defaultValue]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onCancel();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={handleBackdropClick}
    >
      <Card
        className="w-full max-w-[400px] p-6 shadow-2xl animate-in zoom-in-95 duration-200 bg-surface border-border border"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <span className={`material-icons-round text-2xl! ${isDestructive ? 'text-danger' : 'text-primary'}`}>
              {type === 'alert' ? 'info' : type === 'confirm' ? 'check_circle_outline' : 'edit'}
            </span>
            <h2 className="text-xl font-bold text-text-primary">{title}</h2>
          </div>

          <div className="text-text-secondary leading-relaxed whitespace-pre-wrap">
            {message.split(/\n|\\n/g).map((line, i, arr) => (
              <React.Fragment key={i}>
                {line}
                {i !== arr.length - 1 && <br />}
              </React.Fragment>
            ))}
          </div>

          {type === 'prompt' && (
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              autoFocus
              className="w-full px-4 py-2 bg-bg border border-border rounded-lg text-text-primary focus:outline-none focus:border-primary transition-colors"
              onKeyDown={(e) => {
                if (e.key === 'Enter') onConfirm(inputValue);
              }}
            />
          )}

          <div className="flex items-center justify-end gap-3 mt-2">
            {type !== 'alert' && (
              <Button
                onClick={() => { onCancel(); }}
                variant="secondary"
              >
                {cancelText}
              </Button>
            )}
            <Button
              onClick={() => onConfirm(type === 'prompt' ? inputValue : undefined)}
              variant="primary"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
