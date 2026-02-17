import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useCharacterStore, useUIStore } from '../../../stores/RootStore';
import { getAbilityModifier, getProficiencyBonus, formatModifier, ABILITY_SCORE_NAMES } from '../../../utils/characterUtils';
import { getSpellByName } from '../../../services/referenceData';
import type { AbilityScoreKey } from '../../../types/character';
import { SectionCard } from '../../shared/SectionCard';
import { SpellDetail } from '../SpellDetail';
import { SpellSearchModal } from '../SpellSearchModal';
import { ALL_SPELL_COLUMNS } from '../SpellTable';
import { BoxArrowUpRight, XLg } from 'react-bootstrap-icons';

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

  // Count prepared spells (non-cantrips only)
  const preparedCount = char.spells.filter((s) => s.level > 0 && s.prepared).length;

  // Group spells by level
  const spellsByLevel = new Map<number, typeof char.spells>();
  char.spells.forEach((spell) => {
    const list = spellsByLevel.get(spell.level) ?? [];
    list.push(spell);
    spellsByLevel.set(spell.level, list);
  });

  return (
    <>
      <SectionCard title="Spellcasting">
        <div className="flex flex-wrap gap-3">
          <div className="flex flex-col items-center p-3 bg-base-100 rounded-lg border border-base-300 w-42">
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

          <div className="flex flex-col items-center p-3 bg-base-100 rounded-lg border border-base-300 w-32">
            <span className="text-xs font-semibold uppercase text-base-content/60">Save DC</span>
            <div className="flex items-stretch mt-2 rounded-lg border border-base-300 overflow-hidden">
              <button
                className="px-2.5 py-1.5 bg-base-300 hover:bg-base-content/20 text-base font-bold leading-none"
                onClick={() => characterStore.updateActiveCharacter({ spellSaveDC: displaySaveDC - 1 })}
              >
                −
              </button>
              <input
                type="number"
                value={displaySaveDC}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) characterStore.updateActiveCharacter({ spellSaveDC: val });
                }}
                className="w-12 text-center text-base font-semibold bg-base-100 border-x border-base-300 focus:outline-none py-1.5"
              />
              <button
                className="px-2.5 py-1.5 bg-base-300 hover:bg-base-content/20 text-base font-bold leading-none"
                onClick={() => characterStore.updateActiveCharacter({ spellSaveDC: displaySaveDC + 1 })}
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center p-3 bg-base-100 rounded-lg border border-base-300 w-32">
            <span className="text-xs font-semibold uppercase text-base-content/60">Atk Bonus</span>
            <div className="flex items-stretch mt-2 rounded-lg border border-base-300 overflow-hidden">
              <button
                className="px-2.5 py-1.5 bg-base-300 hover:bg-base-content/20 text-base font-bold leading-none"
                onClick={() => characterStore.updateActiveCharacter({ spellAttackBonus: displayAttackBonus - 1 })}
              >
                −
              </button>
              <input
                type="number"
                value={displayAttackBonus}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) characterStore.updateActiveCharacter({ spellAttackBonus: val });
                }}
                className="w-12 text-center text-base font-semibold bg-base-100 border-x border-base-300 focus:outline-none py-1.5"
              />
              <button
                className="px-2.5 py-1.5 bg-base-300 hover:bg-base-content/20 text-base font-bold leading-none"
                onClick={() => characterStore.updateActiveCharacter({ spellAttackBonus: displayAttackBonus + 1 })}
              >
                +
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center p-3 bg-base-100 rounded-lg border border-base-300 w-32">
            <span className="text-xs font-semibold uppercase text-base-content/60">Max Prepared</span>
            <div className="flex items-stretch mt-2 rounded-lg border border-base-300 overflow-hidden">
              <button
                className="px-2.5 py-1.5 bg-base-300 hover:bg-base-content/20 text-base font-bold leading-none"
                onClick={() => {
                  const current = char.maxPreparedSpells ?? 0;
                  characterStore.updateActiveCharacter({ maxPreparedSpells: Math.max(0, current - 1) });
                }}
              >
                −
              </button>
              <input
                type="number"
                min={0}
                value={char.maxPreparedSpells ?? ''}
                onChange={(e) => {
                  const val = e.target.value === '' ? null : (parseInt(e.target.value) || 0);
                  characterStore.updateActiveCharacter({ maxPreparedSpells: val });
                }}
                placeholder="—"
                className="w-12 text-center text-base font-semibold bg-base-100 border-x border-base-300 focus:outline-none py-1.5"
              />
              <button
                className="px-2.5 py-1.5 bg-base-300 hover:bg-base-content/20 text-base font-bold leading-none"
                onClick={() => {
                  const current = char.maxPreparedSpells ?? 0;
                  characterStore.updateActiveCharacter({ maxPreparedSpells: current + 1 });
                }}
              >
                +
              </button>
            </div>
          </div>

          <div className={`flex flex-col items-center p-3 rounded-lg border w-32 ${
            char.maxPreparedSpells != null && preparedCount > char.maxPreparedSpells
              ? 'bg-error/10 border-error text-error'
              : 'bg-base-100 border-base-300'
          }`}>
            <span className="text-xs font-semibold uppercase text-base-content/60">Prepared</span>
            <span className="text-2xl font-bold mt-1">{preparedCount}</span>
            {char.maxPreparedSpells != null && (
              <span className="text-xs text-base-content/40">of {char.maxPreparedSpells}</span>
            )}
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Spell Slots">
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
              <div key={level} className="flex flex-col items-center p-1.5 bg-base-100 rounded-lg border border-base-300 w-20">
                <span className="text-[10px] font-semibold uppercase text-base-content/60">{SPELL_LEVEL_LABELS[level]}</span>
                <div className="flex items-stretch mt-1 rounded border border-base-300 overflow-hidden">
                  <button
                    className="px-1 py-0.5 bg-base-300 hover:bg-base-content/20 text-xs font-bold leading-none"
                    onClick={() => updateSlot({ used: Math.max(0, slot.used - 1) })}
                  >
                    −
                  </button>
                  <input
                    type="number"
                    min={0}
                    value={slot.used}
                    onChange={(e) => updateSlot({ used: parseInt(e.target.value) || 0 })}
                    className="w-7 text-center text-sm font-semibold bg-base-100 border-x border-base-300 focus:outline-none py-0.5"
                  />
                  <button
                    className="px-1 py-0.5 bg-base-300 hover:bg-base-content/20 text-xs font-bold leading-none"
                    onClick={() => updateSlot({ used: slot.used + 1 })}
                  >
                    +
                  </button>
                </div>
                <div className="w-4 border-t border-base-300 my-0.5" />
                <input
                  type="number"
                  min={0}
                  value={slot.total}
                  onChange={(e) => updateSlot({ total: parseInt(e.target.value) || 0 })}
                  className="input input-bordered input-xs w-10 text-center text-xs text-base-content/60"
                />
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Spells grouped by level */}
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
                  const visibleCols = ALL_SPELL_COLUMNS.filter(
                    (c) => uiStore.spellColumns.includes(c.key) && c.key !== 'level'
                  );
                  return (
                    <div key={spell.index}>
                      <div className="flex items-center gap-2 rounded px-1 -mx-1 hover:bg-base-300/50 transition-colors">
                        {level > 0 && (
                          <input
                            type="checkbox"
                            checked={spell.prepared}
                            onChange={() => characterStore.toggleSpellPrepared(spell.index)}
                            className="checkbox checkbox-xs checkbox-primary"
                            title="Prepared"
                          />
                        )}
                        <span
                          className="text-sm font-medium cursor-pointer hover:text-primary shrink-0"
                          title="Click for full description"
                          onClick={() => setExpandedSpell(isExpanded ? null : spell.index)}
                        >
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
                          className="btn btn-ghost btn-xs text-info shrink-0"
                          title="Add to Attacks"
                          onClick={() =>
                            characterStore.addAttackFromSpell(
                              spell.name,
                              formatModifier(displayAttackBonus),
                              spell.index
                            )
                          }
                        >
                          <BoxArrowUpRight />
                        </button>
                        <button
                          className="btn btn-ghost btn-xs text-error shrink-0"
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

      <SpellSearchModal levelFilter={addingForLevel} />
    </>
  );
});
