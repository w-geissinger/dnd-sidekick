import { useState, useMemo, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { useCharacterStore, useUIStore } from '../../stores/RootStore';
import { searchSpells } from '../../services/referenceData';
import { toSlugIndex } from '../../utils/characterUtils';
import type { SpellEntry } from '../../types/dnd-data';
import { SpellDetail } from './SpellDetail';
import { SpellTable } from './SpellTable';

interface SpellSearchModalProps {
  levelFilter?: number | null;
}

export const SpellSearchModal = observer(function SpellSearchModal({ levelFilter }: SpellSearchModalProps) {
  const uiStore = useUIStore();
  const characterStore = useCharacterStore();
  const char = characterStore.activeCharacter;
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<number | undefined>(levelFilter ?? undefined);
  const [classFilter, setClassFilter] = useState(true);
  const [selectedSpell, setSelectedSpell] = useState<SpellEntry | null>(null);

  const charClass = char?.class ?? '';

  // Sync level filter when modal opens with a specific level
  useEffect(() => {
    if (uiStore.activeModal === 'spellSearch' && levelFilter !== null && levelFilter !== undefined) {
      setLevel(levelFilter);
    }
  }, [uiStore.activeModal, levelFilter]);

  const results = useMemo(() => {
    if (!query && level === undefined && !(classFilter && charClass)) return [];
    const cls = classFilter && charClass ? charClass : undefined;
    return searchSpells(query, level, cls).slice(0, 100);
  }, [query, level, classFilter, charClass]);

  if (uiStore.activeModal !== 'spellSearch') return null;

  const knownSpellIndices = new Set(char?.spells.map((s) => s.index) ?? []);

  function addSpell(spell: SpellEntry) {
    const spellLevel = spell.properties.Level ?? 0;
    characterStore.addSpellToCharacter({
      index: toSlugIndex(spell.name),
      name: spell.name,
      level: spellLevel,
      prepared: spellLevel === 0,
    });
  }

  function close() {
    uiStore.closeModal();
    setQuery('');
    setSelectedSpell(null);
    setClassFilter(true);
  }

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-5xl h-[70vh] flex flex-col">
        <h3 className="font-bold text-lg mb-3 shrink-0">Search Spells</h3>

        <div className="flex gap-2 mb-3 shrink-0">
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedSpell(null); }}
            className="input input-bordered flex-1"
            placeholder="Search spells by name..."
            autoFocus
          />
          <select
            value={level ?? ''}
            onChange={(e) => setLevel(e.target.value === '' ? undefined : parseInt(e.target.value))}
            className="select select-bordered"
          >
            <option value="">All Levels</option>
            <option value="0">Cantrip</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => (
              <option key={l} value={l}>Level {l}</option>
            ))}
          </select>
        </div>
        {charClass && (
          <label className="flex items-center gap-2 mb-3 cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={classFilter}
              onChange={(e) => setClassFilter(e.target.checked)}
              className="checkbox checkbox-sm checkbox-primary"
            />
            <span className="text-sm">{charClass} spells only</span>
          </label>
        )}

        <div className="flex-1 min-h-0 overflow-y-auto">
          {selectedSpell ? (
            <div className="space-y-3">
              <button className="btn btn-ghost btn-xs" onClick={() => setSelectedSpell(null)}>
                &larr; Back to results
              </button>
              <h4 className="font-bold text-lg">{selectedSpell.name}</h4>
              <SpellDetail spell={selectedSpell} />
              {knownSpellIndices.has(
                toSlugIndex(selectedSpell.name)
              ) ? (
                <span className="badge badge-success">Already Known</span>
              ) : (
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => { addSpell(selectedSpell); close(); }}
                >
                  Add to Spells
                </button>
              )}
            </div>
          ) : (
            <div>
              {results.length === 0 && !query && level === undefined ? (
                <p className="text-sm text-base-content/50">Type to search, or select a level filter.</p>
              ) : results.length === 0 ? (
                <p className="text-sm text-base-content/50">No spells found.</p>
              ) : (
                <SpellTable
                  spells={results}
                  visibleColumns={uiStore.spellColumns}
                  onToggleColumn={(key) => uiStore.toggleSpellColumn(key)}
                  onClickSpell={setSelectedSpell}
                  compact
                  renderActions={(spell) => {
                    const idx = toSlugIndex(spell.name);
                    const known = knownSpellIndices.has(idx);
                    return known ? (
                      <span className="badge badge-xs badge-success">Added</span>
                    ) : (
                      <button
                        className="btn btn-primary btn-xs"
                        onClick={() => addSpell(spell)}
                      >
                        Add
                      </button>
                    );
                  }}
                />
              )}
            </div>
          )}
        </div>

        <div className="modal-action shrink-0">
          <button className="btn" onClick={close}>Close</button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={close} />
    </dialog>
  );
});
