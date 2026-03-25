import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useCharacterStore } from '../../../stores/RootStore';
import { getProficiencyBonus, formatModifier, ALIGNMENTS, CLASSES, RACES } from '../../../utils/characterUtils';
import { StarFill, Star } from 'react-bootstrap-icons';
import { NumericInput } from '../../shared/NumericInput';

export const CharacterHeader = observer(function CharacterHeader() {
  const characterStore = useCharacterStore();
  const char = characterStore.activeCharacter!;
  const profBonus = getProficiencyBonus(char.level);

  const [editingName, setEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(char.name);

  function saveName() {
    setEditingName(false);
    if (nameValue.trim() && nameValue !== char.name) {
      characterStore.updateActiveCharacter({ name: nameValue.trim() });
    } else {
      setNameValue(char.name);
    }
  }

  return (
    <div className="mb-4">
      {/* Character name row */}
      <div className="flex items-center gap-3 mb-3 min-w-0">
        {editingName ? (
          <input
            type="text"
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
            onBlur={saveName}
            onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
            autoFocus
            className="input input-bordered input-sm text-xl font-bold flex-1 min-w-0 max-w-64"
          />
        ) : (
          <h2
            className="text-xl sm:text-2xl font-bold cursor-pointer hover:text-primary transition-colors truncate min-w-0"
            onClick={() => { setNameValue(char.name); setEditingName(true); }}
            title="Click to edit name"
          >
            {char.name}
          </h2>
        )}
        <button
          className={`btn btn-sm btn-circle btn-ghost shrink-0 ${char.inspiration ? 'text-warning' : 'text-base-content/30'}`}
          onClick={() => characterStore.updateActiveCharacter({ inspiration: !char.inspiration })}
          title={char.inspiration ? 'Inspired!' : 'No inspiration'}
        >
          {char.inspiration ? <StarFill className="w-5 h-5" /> : <Star className="w-5 h-5" />}
        </button>
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <div className="badge badge-primary badge-lg font-bold gap-1">
            Prof {formatModifier(profBonus)}
          </div>
        </div>
      </div>

      {/* Character details row */}
      <div className="flex flex-wrap items-end gap-x-2 gap-y-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-base-content/40 mb-0.5">Class</span>
          <select
            value={char.class}
            onChange={(e) => characterStore.updateActiveCharacter({ class: e.target.value })}
            className="select select-bordered select-sm"
          >
            {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-base-content/40 mb-0.5">Level</span>
          <NumericInput
            value={char.level}
            onCommit={(v) => characterStore.updateActiveCharacter({ level: v ?? 1 })}
            min={1}
            max={20}
            className="input input-bordered input-sm w-18"
          />
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-base-content/40 mb-0.5">Race</span>
          <select
            value={char.race}
            onChange={(e) => characterStore.updateActiveCharacter({ race: e.target.value })}
            className="select select-bordered select-sm"
          >
            {RACES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-base-content/40 mb-0.5">Background</span>
          <input
            type="text"
            value={char.background}
            onChange={(e) => characterStore.updateActiveCharacter({ background: e.target.value })}
            className="input input-bordered input-sm w-32"
          />
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-base-content/40 mb-0.5">Alignment</span>
          <select
            value={char.alignment}
            onChange={(e) => characterStore.updateActiveCharacter({ alignment: e.target.value })}
            className="select select-bordered select-sm"
          >
            {ALIGNMENTS.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div className="flex flex-col">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-base-content/40 mb-0.5">XP</span>
          <NumericInput
            value={char.experiencePoints}
            onCommit={(v) => characterStore.updateActiveCharacter({ experiencePoints: v ?? 0 })}
            min={0}
            className="input input-bordered input-sm w-24"
          />
        </div>
      </div>
    </div>
  );
});
