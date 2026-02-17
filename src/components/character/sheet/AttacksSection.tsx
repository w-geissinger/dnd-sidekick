import React, { useState } from 'react';
import { observer } from 'mobx-react-lite';
import { useCharacterStore } from '../../../stores/RootStore';
import { generateId } from '../../../utils/characterUtils';
import { getSpellByName } from '../../../services/referenceData';
import type { Attack } from '../../../types/character';
import { SectionCard } from '../../shared/SectionCard';
import { SpellDetail } from '../SpellDetail';
import { EyeFill, XLg } from 'react-bootstrap-icons';

export const AttacksSection = observer(function AttacksSection() {
  const characterStore = useCharacterStore();
  const char = characterStore.activeCharacter!;
  const [expandedSpellAttack, setExpandedSpellAttack] = useState<string | null>(null);

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
        <div className="overflow-x-auto">
          <table className="table table-xs">
            <thead>
              <tr>
                <th>Name</th>
                <th>Atk Bonus</th>
                <th>Damage/Type</th>
                <th>Notes</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {char.attacks.map((attack) => {
                const refSpell = attack.spellIndex ? getSpellByName(attack.name) : undefined;
                const isExpanded = expandedSpellAttack === attack.id;
                return (
                  <React.Fragment key={attack.id}>
                    <tr>
                      <td>
                        <input
                          type="text"
                          value={attack.name}
                          onChange={(e) => updateAttack(attack.id, 'name', e.target.value)}
                          className="input input-bordered input-xs w-28"
                          placeholder="Weapon"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={attack.attackBonus}
                          onChange={(e) => updateAttack(attack.id, 'attackBonus', e.target.value)}
                          className="input input-bordered input-xs w-16"
                          placeholder="+5"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={attack.damageAndType}
                          onChange={(e) => updateAttack(attack.id, 'damageAndType', e.target.value)}
                          className="input input-bordered input-xs w-28"
                          placeholder="1d8+3 slashing"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={attack.notes}
                          onChange={(e) => updateAttack(attack.id, 'notes', e.target.value)}
                          className="input input-bordered input-xs w-24"
                        />
                      </td>
                      <td>
                        <div className="flex items-center justify-end gap-0.5">
                          {refSpell && (
                            <button
                              className={`btn btn-ghost btn-xs${isExpanded ? ' text-primary' : ' text-info'}`}
                              title="View spell details"
                              onClick={() => setExpandedSpellAttack(isExpanded ? null : attack.id)}
                            >
                              <EyeFill />
                            </button>
                          )}
                          <button
                            className="btn btn-ghost btn-xs text-error"
                            onClick={() => removeAttack(attack.id)}
                          >
                            <XLg />
                          </button>
                        </div>
                      </td>
                    </tr>
                    {isExpanded && refSpell && (
                      <tr>
                        <td colSpan={5} className="p-0">
                          <div className="mx-2 my-1 p-3 bg-base-100 rounded-lg border border-base-300">
                            <SpellDetail spell={refSpell} />
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </SectionCard>
  );
});
