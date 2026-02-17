import React from 'react';
import type { SpellEntry } from '../../types/dnd-data';

interface SpellDetailProps {
  spell: SpellEntry;
}

const DETAIL_FIELDS: { key: string; label: string }[] = [
  { key: 'School', label: 'School' },
  { key: 'Casting Time', label: 'Casting Time' },
  { key: 'data-RangeAoe', label: 'Range' },
  { key: 'Components', label: 'Components' },
  { key: 'Duration', label: 'Duration' },
  { key: 'Target', label: 'Target' },
  { key: 'Save', label: 'Save' },
  { key: 'Damage Type', label: 'Damage Type' },
  { key: 'Damage', label: 'Damage' },
  { key: 'Healing', label: 'Healing' },
  { key: 'Classes', label: 'Classes' },
];

export function SpellDetail({ spell }: SpellDetailProps) {
  const props = spell.properties;
  const isConcentration = props.Concentration === 'Yes' || props['filter-Concentration'] === 'Yes';
  const isRitual = props.Ritual === 'Yes' || props['filter-Ritual'] === 'Yes';
  const higherLevel = (props['Higher Spell Slot Desc'] as string | undefined);

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        <span className="badge badge-sm">
          {props.Level === 0 ? 'Cantrip' : `Level ${props.Level}`}
        </span>
        {props.School && (
          <span className="badge badge-sm badge-secondary">{props.School as string}</span>
        )}
        {isConcentration && (
          <span className="badge badge-sm badge-warning">Concentration</span>
        )}
        {isRitual && (
          <span className="badge badge-sm badge-info">Ritual</span>
        )}
      </div>

      <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
        {DETAIL_FIELDS.map(({ key, label }) => {
          const value = props[key];
          if (!value) return null;
          return (
            <React.Fragment key={key}>
              <dt className="text-base-content/50 font-medium">{label}</dt>
              <dd>{String(value)}</dd>
            </React.Fragment>
          );
        })}
      </dl>

      {(props['data-description'] || spell.description) && (
        <p className="text-sm whitespace-pre-wrap border-t border-base-300 pt-2 mt-2">
          {(props['data-description'] as string) || spell.description}
        </p>
      )}

      {higherLevel && (
        <p className="text-sm italic text-base-content/70">
          <span className="font-semibold not-italic">At Higher Levels: </span>
          {higherLevel}
        </p>
      )}

      <p className="text-xs text-base-content/40">{spell.book} — {spell.publisher}</p>
    </div>
  );
}
