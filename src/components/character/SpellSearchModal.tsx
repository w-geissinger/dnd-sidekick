import { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useCharacterStore, useUIStore } from '../../stores/RootStore';
import { searchSpells } from '../../services/referenceData';
import { toSlugIndex } from '../../utils/characterUtils';
import type { SpellEntry } from '../../types/dnd-data';
import { SpellDetail } from './SpellDetail';
import { ALL_SPELL_COLUMNS } from './SpellTable';

function levelBadge(level: number) {
  const label = level === 0 ? 'Cantrip' : `Lvl ${level}`;
  const cls =
    level === 0 ? 'badge-ghost' :
    level <= 3  ? 'badge-primary' :
    level <= 6  ? 'badge-secondary' :
                  'badge-warning';
  return <span className={`badge badge-xs ${cls} shrink-0`}>{label}</span>;
}

export const SpellSearchModal = observer(function SpellSearchModal() {
  const uiStore = useUIStore();
  const characterStore = useCharacterStore();
  const char = characterStore.activeCharacter;
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<number | undefined>(undefined);
  const [classFilter, setClassFilter] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFieldPicker, setShowFieldPicker] = useState(false);

  const charClass = char?.class ?? '';

  const results = useMemo(() => {
    if (!query && level === undefined && !(classFilter && charClass)) return [];
    const cls = classFilter && charClass ? charClass : undefined;
    return searchSpells(query, level, cls).slice(0, 100);
  }, [query, level, classFilter, charClass]);

  if (uiStore.activeModal !== 'spellSearch') return null;

  const knownSpellIndices = new Set(char?.spells.map((s) => s.index) ?? []);

  const summaryColumns = ALL_SPELL_COLUMNS.filter(
    (c) => uiStore.spellColumns.includes(c.key) && c.key !== 'level'
  );

  function addSpell(spell: SpellEntry) {
    const spellLevel = (spell.properties.Level as number) ?? 0;
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
    setExpandedId(null);
    setClassFilter(true);
    setLevel(undefined);
    setShowFieldPicker(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-fade-in" onClick={close} />

      {/* Panel — drawer on mobile, centered modal on desktop */}
      <div className="relative w-full sm:max-w-3xl bg-base-100 rounded-t-2xl sm:rounded-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col shadow-2xl drawer-slide-up">
        {/* Top spacing — mobile only */}
        <div className="sm:hidden pt-3 shrink-0" />

        {/* Header */}
        <div className="px-4 sm:px-6 pt-2 sm:pt-4 pb-2 shrink-0 flex items-center justify-between">
          <h3 className="font-bold text-lg">Search Spells</h3>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={close}>✕</button>
        </div>

        {/* Filters */}
        <div className="px-4 sm:px-6 pb-3 shrink-0 space-y-2">
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setExpandedId(null); }}
              className="input input-bordered input-sm flex-1 min-w-40"
              placeholder="Search spells..."
              autoFocus
            />
            <select
              value={level ?? ''}
              onChange={(e) => setLevel(e.target.value === '' ? undefined : parseInt(e.target.value))}
              className="select select-bordered select-sm"
            >
              <option value="">All Levels</option>
              <option value="0">Cantrip</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => (
                <option key={l} value={l}>Level {l}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {charClass && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={classFilter}
                  onChange={(e) => setClassFilter(e.target.checked)}
                  className="checkbox checkbox-xs checkbox-primary"
                />
                <span className="text-sm">{charClass} only</span>
              </label>
            )}
            <button
              className="btn btn-ghost btn-xs gap-1 ml-auto"
              onClick={() => setShowFieldPicker(!showFieldPicker)}
            >
              Summary Fields {showFieldPicker ? '▾' : '▸'}
            </button>
          </div>
          {showFieldPicker && (
            <div className="p-3 bg-base-200 rounded-lg border border-base-300 flex flex-wrap gap-x-5 gap-y-2.5">
              {ALL_SPELL_COLUMNS.filter((c) => c.key !== 'level').map((col) => (
                <label key={col.key} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={uiStore.spellColumns.includes(col.key)}
                    onChange={() => uiStore.toggleSpellColumn(col.key)}
                    className="checkbox checkbox-xs"
                  />
                  {col.label}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 pb-8 sm:pb-6">
          {results.length === 0 && !query && level === undefined ? (
            <p className="text-sm text-base-content/50 py-8 text-center">
              Type to search, or select a level filter.
            </p>
          ) : results.length === 0 ? (
            <p className="text-sm text-base-content/50 py-8 text-center">No spells found.</p>
          ) : (
            <div className="space-y-1.5">
              {results.map((spell) => {
                const id = toSlugIndex(spell.name);
                const isExpanded = expandedId === id;
                const known = knownSpellIndices.has(id);
                const spellLevel = (spell.properties.Level as number) ?? 0;
                return (
                  <div key={id} className="rounded-lg border border-base-300 bg-base-100 shadow-sm overflow-hidden">
                    {/* Collapsed header */}
                    <div
                      className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-base-200/50 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : id)}
                    >
                      <span className="text-xs w-3 shrink-0 text-base-content/50">
                        {isExpanded ? '▾' : '▸'}
                      </span>
                      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                        <div className="flex items-center gap-2 min-w-0">
                          {levelBadge(spellLevel)}
                          <span className="font-medium text-sm min-w-0 truncate">{spell.name}</span>
                        </div>
                        {summaryColumns.length > 0 && (
                          <div className="flex items-center gap-x-3 gap-y-0.5 flex-wrap">
                            {summaryColumns.map((col) => {
                              const val = String(col.getValue(spell));
                              if (!val || val === '—' || val === 'No') return null;
                              return (
                                <span key={col.key} className="text-xs text-base-content/50 truncate">
                                  {val}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      {known ? (
                        <button className="btn btn-success btn-xs w-16 shrink-0" disabled>Added</button>
                      ) : (
                        <button
                          className="btn btn-primary btn-xs w-16 shrink-0"
                          onClick={(e) => { e.stopPropagation(); addSpell(spell); }}
                        >
                          Add
                        </button>
                      )}
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="px-4 py-3 border-t border-base-300 bg-base-200/30">
                        <SpellDetail spell={spell} />
                        <button
                          className={`btn btn-sm mt-3 ${known ? 'btn-success' : 'btn-primary'}`}
                          disabled={known}
                          onClick={() => { if (!known) { addSpell(spell); close(); } }}
                        >
                          {known ? 'Added' : 'Add to Spells'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
