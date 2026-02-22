import { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useCharacterStore, useUIStore } from '../../../stores/RootStore';
import { getAbilityModifier, getProficiencyBonus, formatModifier, ABILITY_SCORE_NAMES } from '../../../utils/characterUtils';
import { getSpellByName } from '../../../services/referenceData';
import type { AbilityScoreKey } from '../../../types/character';
import type { SpellViewMode } from '../../../stores/UIStore';
import { SectionCard } from '../../shared/SectionCard';
import { NumericInput } from '../../shared/NumericInput';
import { SpellDetail } from '../SpellDetail';
import { SpellSearchModal } from '../SpellSearchModal';
import { ALL_SPELL_COLUMNS } from '../SpellTable';
import { Crosshair2, XLg, CardList, ListUl, Grid3x3GapFill } from 'react-bootstrap-icons';

const SPELL_LEVEL_LABELS: Record<number, string> = {
  0: 'Cantrips',
  1: '1st Level',
  2: '2nd Level',
  3: '3rd Level',
  4: '4th Level',
  5: '5th Level',
  6: '6th Level',
  7: '7th Level',
  8: '8th Level',
  9: '9th Level',
};

const ABILITY_OPTIONS: AbilityScoreKey[] = ['int', 'wis', 'cha'];

const SPELL_VIEWS: { mode: SpellViewMode; icon: React.ElementType; label: string }[] = [
  { mode: 'accordion', icon: CardList, label: 'Grouped' },
  { mode: 'list', icon: ListUl, label: 'List' },
  { mode: 'cards', icon: Grid3x3GapFill, label: 'Cards' },
];

function levelBadge(level: number) {
  const label = level === 0 ? 'Cantrip' : `Lvl ${level}`;
  const cls =
    level === 0 ? 'badge-ghost' :
    level <= 3  ? 'badge-primary' :
    level <= 6  ? 'badge-secondary' :
                  'badge-warning';
  return <span className={`badge badge-xs ${cls} shrink-0`}>{label}</span>;
}

export const SpellsSection = observer(function SpellsSection() {
  const characterStore = useCharacterStore();
  const uiStore = useUIStore();
  const char = characterStore.activeCharacter!;
  const profBonus = getProficiencyBonus(char.level);
  const [addingForLevel, setAddingForLevel] = useState<number | null>(null);
  const [expandedSpell, setExpandedSpell] = useState<string | null>(null);

  const spellAbilityMod = char.spellcastingAbility
    ? getAbilityModifier(char.abilityScores[char.spellcastingAbility])
    : 0;

  const autoSaveDC = 8 + profBonus + spellAbilityMod;
  const autoAttackBonus = profBonus + spellAbilityMod;
  const displaySaveDC = char.spellSaveDC !== null ? char.spellSaveDC : autoSaveDC;
  const displayAttackBonus = char.spellAttackBonus !== null ? char.spellAttackBonus : autoAttackBonus;

  const preparedCount = char.spells.filter((s) => s.level > 0 && s.prepared).length;

  const spellsByLevel = useMemo(() => {
    const map = new Map<number, typeof char.spells>();
    char.spells.forEach((spell) => {
      const list = map.get(spell.level) ?? [];
      list.push(spell);
      map.set(spell.level, list);
    });
    return map;
  }, [char.spells]);

  const allSpellsSorted = useMemo(() => {
    return [...char.spells].sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  }, [char.spells]);

  const visibleCols = ALL_SPELL_COLUMNS.filter(
    (c) => uiStore.spellColumns.includes(c.key) && c.key !== 'level'
  );

  function toggleExpanded(index: string) {
    setExpandedSpell((prev) => (prev === index ? null : index));
  }

  return (
    <>
      {/* Spellcasting stats + spell slots (merged) */}
      <SectionCard title="Spellcasting">
        <div className="flex flex-wrap gap-2">
          <div className="flex flex-col items-center p-2 bg-base-100 rounded-lg border border-base-300 w-40">
            <span className="text-xs font-semibold uppercase text-base-content/60">Ability</span>
            <select
              value={char.spellcastingAbility}
              onChange={(e) =>
                characterStore.updateActiveCharacter({
                  spellcastingAbility: e.target.value as AbilityScoreKey | '',
                })
              }
              className="select select-bordered select-sm w-full text-center font-bold mt-1"
            >
              <option value="">None</option>
              {ABILITY_OPTIONS.map((a) => (
                <option key={a} value={a}>{ABILITY_SCORE_NAMES[a]}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col items-center p-2 bg-base-100 rounded-lg border border-base-300 w-32 group">
            <span className="text-xs font-semibold uppercase text-base-content/60">Save DC</span>
            <div className="flex items-stretch mt-1 rounded-lg border border-transparent group-hover:border-base-300 overflow-hidden transition-colors">
              <button
                className="px-2 py-1 bg-base-300 hover:bg-base-content/20 text-sm font-bold leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => characterStore.updateActiveCharacter({ spellSaveDC: displaySaveDC - 1 })}
              >−</button>
              <NumericInput
                value={displaySaveDC}
                onCommit={(v) => characterStore.updateActiveCharacter({ spellSaveDC: v })}
                allowEmpty
                className="w-10 text-center text-sm font-semibold bg-base-100 border-x border-transparent group-hover:border-base-300 focus:outline-none py-1"
              />
              <button
                className="px-2 py-1 bg-base-300 hover:bg-base-content/20 text-sm font-bold leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => characterStore.updateActiveCharacter({ spellSaveDC: displaySaveDC + 1 })}
              >+</button>
            </div>
          </div>

          <div className="flex flex-col items-center p-2 bg-base-100 rounded-lg border border-base-300 w-32 group">
            <span className="text-xs font-semibold uppercase text-base-content/60">Atk Bonus</span>
            <div className="flex items-stretch mt-1 rounded-lg border border-transparent group-hover:border-base-300 overflow-hidden transition-colors">
              <button
                className="px-2 py-1 bg-base-300 hover:bg-base-content/20 text-sm font-bold leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => characterStore.updateActiveCharacter({ spellAttackBonus: displayAttackBonus - 1 })}
              >−</button>
              <NumericInput
                value={displayAttackBonus}
                onCommit={(v) => characterStore.updateActiveCharacter({ spellAttackBonus: v })}
                allowEmpty
                className="w-10 text-center text-sm font-semibold bg-base-100 border-x border-transparent group-hover:border-base-300 focus:outline-none py-1"
              />
              <button
                className="px-2 py-1 bg-base-300 hover:bg-base-content/20 text-sm font-bold leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => characterStore.updateActiveCharacter({ spellAttackBonus: displayAttackBonus + 1 })}
              >+</button>
            </div>
          </div>

          <div className="flex flex-col items-center p-2 bg-base-100 rounded-lg border border-base-300 w-32 group">
            <span className="text-xs font-semibold uppercase text-base-content/60">Max Prepared</span>
            <div className="flex items-stretch mt-1 rounded-lg border border-transparent group-hover:border-base-300 overflow-hidden transition-colors">
              <button
                className="px-2 py-1 bg-base-300 hover:bg-base-content/20 text-sm font-bold leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  const current = char.maxPreparedSpells ?? 0;
                  characterStore.updateActiveCharacter({ maxPreparedSpells: Math.max(0, current - 1) });
                }}
              >−</button>
              <NumericInput
                value={char.maxPreparedSpells}
                onCommit={(v) => characterStore.updateActiveCharacter({ maxPreparedSpells: v })}
                allowEmpty
                min={0}
                placeholder="—"
                className="w-10 text-center text-sm font-semibold bg-base-100 border-x border-transparent group-hover:border-base-300 focus:outline-none py-1"
              />
              <button
                className="px-2 py-1 bg-base-300 hover:bg-base-content/20 text-sm font-bold leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => {
                  const current = char.maxPreparedSpells ?? 0;
                  characterStore.updateActiveCharacter({ maxPreparedSpells: current + 1 });
                }}
              >+</button>
            </div>
          </div>

          <div className={`flex flex-col items-center p-2 rounded-lg border w-32 ${
            char.maxPreparedSpells != null && preparedCount > char.maxPreparedSpells
              ? 'bg-error/10 border-error text-error'
              : 'bg-base-100 border-base-300'
          }`}>
            <span className="text-xs font-semibold uppercase text-base-content/60">Prepared</span>
            <span className="text-2xl font-bold mt-0.5">{preparedCount}</span>
            {char.maxPreparedSpells != null && (
              <span className="text-xs text-base-content/40">of {char.maxPreparedSpells}</span>
            )}
          </div>
        </div>

        {/* Spell slots */}
        <div className="flex items-center gap-2 mt-3 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/40">Spell Slots</span>
          <div className="flex-1 border-t border-base-300" />
        </div>
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
            const slot = char.spellSlots[level] ?? { total: 0, used: 0 };
            const updateSlot = (patch: { used?: number; total?: number }) => {
              const next = { ...slot, ...patch };
              next.used = Math.min(next.used, next.total);
              characterStore.updateActiveCharacter({
                spellSlots: { ...char.spellSlots, [level]: next },
              });
            };
            return (
              <div key={level} className="flex flex-col items-center p-1.5 bg-base-100 rounded-lg border border-base-300 w-20 group">
                <span className="text-[10px] font-semibold uppercase text-base-content/60">{SPELL_LEVEL_LABELS[level]}</span>
                <div className="flex items-stretch mt-1 rounded border border-transparent group-hover:border-base-300 overflow-hidden transition-colors">
                  <button
                    className="px-1 py-0.5 bg-base-300 hover:bg-base-content/20 text-xs font-bold leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => updateSlot({ used: Math.max(0, slot.used - 1) })}
                  >−</button>
                  <NumericInput
                    value={slot.used}
                    onCommit={(v) => updateSlot({ used: v ?? 0 })}
                    min={0}
                    className="w-7 text-center text-sm font-semibold bg-base-100 border-x border-transparent group-hover:border-base-300 focus:outline-none py-0.5"
                  />
                  <button
                    className="px-1 py-0.5 bg-base-300 hover:bg-base-content/20 text-xs font-bold leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => updateSlot({ used: slot.used + 1 })}
                  >+</button>
                </div>
                <div className="w-4 border-t border-base-300 my-0.5" />
                <NumericInput
                  value={slot.total}
                  onCommit={(v) => updateSlot({ total: v ?? 0 })}
                  min={0}
                  className="input input-bordered input-xs w-10 text-center text-xs text-base-content/60"
                />
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* View picker */}
      <div className="flex items-center justify-between">
        <div className="join">
          {SPELL_VIEWS.map(({ mode, icon: Icon, label }) => (
            <button
              key={mode}
              className={`btn btn-sm join-item gap-1.5 ${uiStore.spellViewMode === mode ? 'btn-active' : ''}`}
              onClick={() => uiStore.setSpellViewMode(mode)}
              title={label}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
        {uiStore.spellViewMode !== 'accordion' && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => { setAddingForLevel(null); uiStore.openModal('spellSearch'); }}
          >
            + Add Spell
          </button>
        )}
      </div>

      {/* ── Accordion view (default) ───────────────────────── */}
      {uiStore.spellViewMode === 'accordion' && (
        <>
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((level) => {
            const spellsAtLevel = spellsByLevel.get(level) ?? [];
            return (
              <SectionCard
                key={level}
                title={SPELL_LEVEL_LABELS[level]}
                collapsible
                defaultOpen={spellsAtLevel.length > 0}
                action={
                  <button
                    className="btn btn-primary btn-xs"
                    onClick={() => { setAddingForLevel(level); uiStore.openModal('spellSearch'); }}
                  >
                    + Add
                  </button>
                }
              >
                {spellsAtLevel.length === 0 ? (
                  <p className="text-sm text-base-content/50">No spells at this level.</p>
                ) : (
                  <div className="space-y-1">
                    {spellsAtLevel.map((spell) => {
                      const isExpanded = expandedSpell === spell.index;
                      const refSpell = getSpellByName(spell.name);
                      return (
                        <div key={spell.index}>
                          <div
                            className="flex items-center gap-2 rounded px-1 -mx-1 hover:bg-base-300/50 hover:text-primary cursor-pointer transition-colors"
                            onClick={(e) => {
                              if ((e.target as HTMLElement).closest('input, button')) return;
                              toggleExpanded(spell.index);
                            }}
                          >
                            {level > 0 && (
                              <input
                                type="checkbox"
                                checked={spell.prepared}
                                onChange={() => characterStore.toggleSpellPrepared(spell.index)}
                                className="checkbox checkbox-xs checkbox-primary"
                                title="Prepared"
                              />
                            )}
                            <span className="text-sm font-medium shrink-0">
                              {isExpanded ? '▾' : '▸'} {spell.name}
                            </span>
                            {refSpell && visibleCols.length > 0 && (
                              <span className="flex gap-2 flex-1 min-w-0 overflow-hidden">
                                {visibleCols.map((col) => (
                                  <span key={col.key} className="text-xs text-base-content/50 truncate">
                                    {col.getValue(refSpell)}
                                  </span>
                                ))}
                              </span>
                            )}
                            {!refSpell && <span className="flex-1" />}
                            <button
                              className="btn btn-ghost btn-xs text-info shrink-0 tooltip tooltip-left"
                              data-tip="Add to attacks"
                              onClick={() =>
                                characterStore.addAttackFromSpell(spell.name, formatModifier(displayAttackBonus), spell.index)
                              }
                            >
                              <Crosshair2 />
                            </button>
                            <button
                              className="btn btn-ghost btn-xs text-error shrink-0 tooltip tooltip-left"
                              data-tip="Remove spell"
                              onClick={() => characterStore.removeSpell(spell.index)}
                            >
                              <XLg />
                            </button>
                          </div>
                          {isExpanded && refSpell && (
                            <div className="ml-6 mt-1 mb-2 p-3 bg-base-100 rounded-lg border border-base-300">
                              <SpellDetail spell={refSpell} />
                            </div>
                          )}
                          {isExpanded && !refSpell && (
                            <div className="ml-6 mt-1 mb-2 p-3 text-sm text-base-content/50 italic">
                              No additional details available for this spell.
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </SectionCard>
            );
          })}
        </>
      )}

      {/* ── List view ─────────────────────────────────────── */}
      {uiStore.spellViewMode === 'list' && (
        <SectionCard title="All Spells">
          {char.spells.length === 0 ? (
            <p className="text-sm text-base-content/50">No spells added yet.</p>
          ) : (
            <div className="space-y-0.5">
              {allSpellsSorted.map((spell, idx) => {
                const prevLevel = idx > 0 ? allSpellsSorted[idx - 1].level : undefined;
                const showDivider = prevLevel !== undefined && spell.level !== prevLevel;
                const isExpanded = expandedSpell === spell.index;
                const refSpell = getSpellByName(spell.name);
                return (
                  <div key={spell.index}>
                    {showDivider && <div className="border-t border-base-300 my-2" />}
                    <div
                      className="flex items-center gap-2 rounded px-1 -mx-1 hover:bg-base-300/50 hover:text-primary cursor-pointer transition-colors"
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('input, button')) return;
                        toggleExpanded(spell.index);
                      }}
                    >
                      {spell.level > 0 && (
                        <input
                          type="checkbox"
                          checked={spell.prepared}
                          onChange={() => characterStore.toggleSpellPrepared(spell.index)}
                          className="checkbox checkbox-xs checkbox-primary"
                          title="Prepared"
                        />
                      )}
                      {levelBadge(spell.level)}
                      <span className="text-sm font-medium shrink-0">
                        {isExpanded ? '▾' : '▸'} {spell.name}
                      </span>
                      {refSpell && visibleCols.length > 0 && (
                        <span className="flex gap-2 flex-1 min-w-0 overflow-hidden">
                          {visibleCols.map((col) => (
                            <span key={col.key} className="text-xs text-base-content/50 truncate">
                              {col.getValue(refSpell)}
                            </span>
                          ))}
                        </span>
                      )}
                      {!refSpell && <span className="flex-1" />}
                      <button
                        className="btn btn-ghost btn-xs text-info shrink-0 tooltip tooltip-left"
                        data-tip="Add to attacks"
                        onClick={() =>
                          characterStore.addAttackFromSpell(spell.name, formatModifier(displayAttackBonus), spell.index)
                        }
                      >
                        <Crosshair2 />
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-error shrink-0 tooltip tooltip-left"
                        data-tip="Remove spell"
                        onClick={() => characterStore.removeSpell(spell.index)}
                      >
                        <XLg />
                      </button>
                    </div>
                    {isExpanded && refSpell && (
                      <div className="ml-6 mt-1 mb-2 p-3 bg-base-100 rounded-lg border border-base-300">
                        <SpellDetail spell={refSpell} />
                      </div>
                    )}
                    {isExpanded && !refSpell && (
                      <div className="ml-6 mt-1 mb-2 p-3 text-sm text-base-content/50 italic">
                        No additional details available for this spell.
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      )}

      {/* ── Cards view ────────────────────────────────────── */}
      {uiStore.spellViewMode === 'cards' && (
        <SectionCard title="All Spells">
          {char.spells.length === 0 ? (
            <p className="text-sm text-base-content/50">No spells added yet.</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
              {allSpellsSorted.map((spell) => {
                const refSpell = getSpellByName(spell.name);
                const school = refSpell ? refSpell.properties.School as string : null;
                const castingTime = refSpell ? refSpell.properties['Casting Time'] as string : null;
                const range = refSpell
                  ? ((refSpell.properties['data-RangeAoe'] as string) ?? (refSpell.properties.Range as string))
                  : null;
                const concentration = refSpell
                  ? (refSpell.properties.Concentration === 'Yes' || refSpell.properties['filter-Concentration'] === 'Yes')
                  : false;
                const ritual = refSpell
                  ? (refSpell.properties.Ritual === 'Yes' || refSpell.properties['filter-Ritual'] === 'Yes')
                  : false;
                const isExpanded = expandedSpell === spell.index;
                return (
                  <div
                    key={spell.index}
                    className="bg-base-100 border border-base-300 rounded-lg p-3 flex flex-col gap-1.5 group shadow-sm hover:border-primary/50 hover:shadow-md transition-all cursor-pointer"
                    onClick={() => toggleExpanded(spell.index)}
                  >
                    {/* Top row: level badge + actions */}
                    <div className="flex items-start justify-between gap-1">
                      <div className="flex items-center gap-1.5">
                        {spell.level > 0 && (
                          <input
                            type="checkbox"
                            checked={spell.prepared}
                            onChange={() => characterStore.toggleSpellPrepared(spell.index)}
                            onClick={(e) => e.stopPropagation()}
                            className="checkbox checkbox-xs checkbox-primary"
                            title="Prepared"
                          />
                        )}
                        {levelBadge(spell.level)}
                      </div>
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          className="btn btn-ghost btn-xs text-info opacity-0 group-hover:opacity-100 transition-opacity tooltip tooltip-left"
                          data-tip="Add to attacks"
                          onClick={(e) => { e.stopPropagation(); characterStore.addAttackFromSpell(spell.name, formatModifier(displayAttackBonus), spell.index); }}
                        >
                          <Crosshair2 className="w-3 h-3" />
                        </button>
                        <button
                          className="btn btn-ghost btn-xs text-error opacity-0 group-hover:opacity-100 transition-opacity tooltip tooltip-left"
                          data-tip="Remove spell"
                          onClick={(e) => { e.stopPropagation(); characterStore.removeSpell(spell.index); }}
                        >
                          <XLg className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Spell name */}
                    <span
                      className="font-semibold text-sm leading-tight hover:text-primary"
                    >
                      {isExpanded ? '▾' : '▸'} {spell.name}
                    </span>

                    {/* School */}
                    {school && (
                      <span className="text-xs text-base-content/50 italic">{school}</span>
                    )}

                    {/* Key stats */}
                    <div className="flex flex-wrap gap-x-2 gap-y-0.5 text-xs text-base-content/60">
                      {castingTime && <span>{castingTime}</span>}
                      {range && <span>{range}</span>}
                      {concentration && <span className="text-warning font-medium">Conc.</span>}
                      {ritual && <span className="text-info font-medium">Ritual</span>}
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="mt-1 pt-2 border-t border-base-300">
                        {refSpell
                          ? <SpellDetail spell={refSpell} />
                          : <p className="text-xs text-base-content/50 italic">No additional details available.</p>
                        }
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </SectionCard>
      )}

      <SpellSearchModal levelFilter={addingForLevel} />
    </>
  );
});
