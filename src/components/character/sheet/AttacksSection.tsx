import { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useCharacterStore } from '../../../stores/RootStore';
import { generateId } from '../../../utils/characterUtils';
import { getSpellByName, getItemByName } from '../../../services/referenceData';
import type { Attack } from '../../../types/character';
import { SectionCard } from '../../shared/SectionCard';
import { SpellDetail } from '../SpellDetail';
import { ItemDetail } from '../ItemDetail';
import { XLg } from 'react-bootstrap-icons';

export const AttacksSection = observer(function AttacksSection() {
  const characterStore = useCharacterStore();
  const char = characterStore.activeCharacter!;
  const [expandedAttack, setExpandedAttack] = useState<string | null>(null);

  function addAttack() {
    const newAttack: Attack = {
      id: generateId(),
      name: '',
      attackBonus: '',
      damageAndType: '',
      notes: '',
    };
    characterStore.updateActiveCharacter({
      attacks: [...char.attacks, newAttack],
    });
  }

  function updateAttack(id: string, field: keyof Attack, value: string) {
    characterStore.updateActiveCharacter({
      attacks: char.attacks.map((a) =>
        a.id === id ? { ...a, [field]: value } : a
      ),
    });
  }

  function removeAttack(id: string) {
    characterStore.updateActiveCharacter({
      attacks: char.attacks.filter((a) => a.id !== id),
    });
    if (expandedAttack === id) setExpandedAttack(null);
  }

  function toggleExpand(id: string) {
    setExpandedAttack(expandedAttack === id ? null : id);
  }

  return (
    <SectionCard
      title="Attacks & Spellcasting"
      action={
        <button className="btn btn-primary btn-xs" onClick={addAttack}>
          + Add
        </button>
      }
    >
      {char.attacks.length === 0 ? (
        <p className="text-sm text-base-content/50">No attacks added yet.</p>
      ) : (
        <div className="space-y-1">
          {char.attacks.map((attack) => {
            const refSpell = attack.spellIndex ? getSpellByName(attack.name) : undefined;
            const refItem = attack.equipmentId ? getItemByName(attack.name) : undefined;
            const hasDetail = !!(refSpell || refItem);
            const isExpanded = expandedAttack === attack.id;
            return (
              <div key={attack.id}>
                <div
                  className="flex items-start gap-2 px-3 py-2.5 rounded-lg border border-base-300 bg-base-100 shadow-sm transition-colors cursor-pointer hover:border-primary/30 hover:bg-base-100"
                  onClick={(e) => {
                    if ((e.target as HTMLElement).closest('input, button')) return;
                    toggleExpand(attack.id);
                  }}
                >
                  <span className="text-xs pt-2 w-3 shrink-0 text-base-content/50">
                    {isExpanded ? '▾' : '▸'}
                  </span>

                  <div className="flex-1 min-w-0 flex flex-col gap-1">
                    {/* Collapsed: read-only */}
                    {!isExpanded && (
                      <>
                        <span className="text-sm font-medium truncate">{attack.name || '—'}</span>
                        <div className="flex items-center gap-1.5 text-xs">
                          <span className="font-mono text-base-content/70">{attack.attackBonus || '—'}</span>
                          <span className="text-base-content/30">•</span>
                          <span className="text-base-content/70">{attack.damageAndType || '—'}</span>
                          {attack.notes && (
                            <span className="text-base-content/40 truncate">{attack.notes}</span>
                          )}
                        </div>
                      </>
                    )}

                    {/* Expanded: editable inputs */}
                    {isExpanded && (
                      <>
                        {hasDetail ? (
                          <span className="text-sm font-medium truncate">{attack.name}</span>
                        ) : (
                          <input
                            type="text"
                            value={attack.name}
                            onChange={(e) => updateAttack(attack.id, 'name', e.target.value)}
                            className="input input-bordered input-xs w-full min-w-0"
                            placeholder="Weapon"
                          />
                        )}
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <input
                            type="text"
                            value={attack.attackBonus}
                            onChange={(e) => updateAttack(attack.id, 'attackBonus', e.target.value)}
                            className="input input-bordered input-xs w-14"
                            placeholder="+5"
                          />
                          <span className="text-base-content/30 text-xs">•</span>
                          <input
                            type="text"
                            value={attack.damageAndType}
                            onChange={(e) => updateAttack(attack.id, 'damageAndType', e.target.value)}
                            className="input input-bordered input-xs w-32"
                            placeholder="1d8+3 slashing"
                          />
                          <input
                            type="text"
                            value={attack.notes}
                            onChange={(e) => updateAttack(attack.id, 'notes', e.target.value)}
                            className="input input-bordered input-xs w-24"
                            placeholder="Notes"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <button
                    className="btn btn-ghost btn-xs text-error shrink-0 mt-0.5"
                    onClick={() => removeAttack(attack.id)}
                  >
                    <XLg />
                  </button>
                </div>

                {isExpanded && (refSpell || refItem) && (
                  <div className="mx-1 mb-1 p-3 bg-base-100 rounded-lg border border-base-300">
                    {refSpell ? <SpellDetail spell={refSpell} /> : refItem ? <ItemDetail item={refItem} /> : null}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </SectionCard>
  );
});
