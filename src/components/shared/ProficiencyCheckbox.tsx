import React from 'react';

interface ProficiencyCheckboxProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  title?: string;
}

export function ProficiencyCheckbox({ checked, onChange, label, title }: ProficiencyCheckboxProps) {
  return (
    <label className="flex items-center gap-1 cursor-pointer" title={title}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="checkbox checkbox-xs checkbox-primary"
      />
      {label && <span className="text-xs">{label}</span>}
    </label>
  );
}
