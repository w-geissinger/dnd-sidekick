import React from 'react';
import { observer } from 'mobx-react-lite';
import { useCharacterStore } from '../../../stores/RootStore';
import { getAbilityModifier, getProficiencyBonus, formatModifier, ABILITY_SCORE_NAMES } from '../../../utils/characterUtils';
import { SectionCard } from '../../shared/SectionCard';

export const SavingThrows = observer(function SavingThrows() {
  const characterStore = useCharacterStore();
  const char = characterStore.activeCharacter!;
  const profBonus = getProficiencyBonus(char.level);

  function toggleProficiency(index: number) {
    const updated = char.savingThrows.map((st, i) =>
      i === index ? { ...st, proficient: !st.proficient } : st
    );
    characterStore.updateActiveCharacter({ savingThrows: updated });
  }

  return (
    <SectionCard title="Saving Throws">
      <div className="space-y-0.5">
        {char.savingThrows.map((st, index) => {
          const abilityMod = getAbilityModifier(char.abilityScores[st.ability]);
          const total = abilityMod + (st.proficient ? profBonus : 0);
          const modColor = total > 0 ? 'text-success' : total < 0 ? 'text-error' : 'text-base-content/60';
          return (
            <label
              key={st.ability}
              className={`flex items-center gap-2 cursor-pointer px-2 py-1.5 rounded transition-colors ${
                st.proficient ? 'bg-primary/10' : 'hover:bg-base-100'
              }`}
            >
              <input
                type="checkbox"
                checked={st.proficient}
                onChange={() => toggleProficiency(index)}
                className="checkbox checkbox-xs checkbox-primary"
              />
              <span className={`font-mono text-sm w-8 text-right font-bold ${modColor}`}>{formatModifier(total)}</span>
              <span className="text-sm">{ABILITY_SCORE_NAMES[st.ability]}</span>
            </label>
          );
        })}
      </div>
    </SectionCard>
  );
});
