import React, { useState, useCallback } from 'react';

interface NumericInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'value' | 'onChange' | 'onBlur' | 'onFocus' | 'type'
  > {
  value: number | null;
  onCommit: (value: number | null) => void;
  allowEmpty?: boolean;
  integer?: boolean;
  min?: number;
  max?: number;
}

export function NumericInput({
  value,
  onCommit,
  allowEmpty = false,
  integer = true,
  min,
  max,
  ...inputProps
}: NumericInputProps) {
  const [localValue, setLocalValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const displayValue = isFocused
    ? localValue
    : value === null
      ? ''
      : String(value);

  const handleFocus = useCallback(
    (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      setLocalValue(value === null ? '' : String(value));
      e.target.select();
    },
    [value],
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalValue(e.target.value);
    },
    [],
  );

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    const trimmed = localValue.trim();

    if (trimmed === '') {
      if (allowEmpty) {
        onCommit(null);
      }
      return;
    }

    const parsed = integer ? parseInt(trimmed, 10) : parseFloat(trimmed);
    if (isNaN(parsed)) return;

    let clamped = parsed;
    if (min !== undefined) clamped = Math.max(min, clamped);
    if (max !== undefined) clamped = Math.min(max, clamped);

    onCommit(clamped);
  }, [localValue, allowEmpty, integer, min, max, onCommit]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.currentTarget.blur();
      }
    },
    [],
  );

  return (
    <input
      {...inputProps}
      type="text"
      inputMode={integer ? 'numeric' : 'decimal'}
      value={displayValue}
      onFocus={handleFocus}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    />
  );
}
