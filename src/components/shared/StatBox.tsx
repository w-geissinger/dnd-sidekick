import React, { useState } from 'react';

interface StatBoxProps {
  label: string;
  value: string | number;
  onSave: (value: string) => void;
  type?: 'text' | 'number';
  className?: string;
}

export function StatBox({ label, value, onSave, type = 'number', className = '' }: StatBoxProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  function handleBlur() {
    setEditing(false);
    if (draft !== String(value)) {
      onSave(draft);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      (e.target as HTMLInputElement).blur();
    } else if (e.key === 'Escape') {
      setDraft(String(value));
      setEditing(false);
    }
  }

  if (editing) {
    return (
      <div className={`flex flex-col items-center ${className}`}>
        <input
          type={type}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          autoFocus
          className="input input-bordered input-sm w-16 text-center"
        />
        <span className="text-xs mt-1 text-base-content/60">{label}</span>
      </div>
    );
  }

  return (
    <div
      className={`flex flex-col items-center cursor-pointer ${className}`}
      onClick={() => { setDraft(String(value)); setEditing(true); }}
    >
      <span className="text-lg font-bold">{value}</span>
      <span className="text-xs text-base-content/60">{label}</span>
    </div>
  );
}
