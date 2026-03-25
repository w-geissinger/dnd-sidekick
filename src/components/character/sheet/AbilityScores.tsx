import React from 'react';
import { observer } from 'mobx-react-lite';
import { useCharacterStore } from '../../../stores/RootStore';
import { getAbilityModifier, formatModifier, ABILITY_SCORE_NAMES, ABILITY_SCORE_ABBR } from '../../../utils/characterUtils';
import type { AbilityScoreKey } from '../../../types/character';
import { NumericInput } from '../../shared/NumericInput';

const ABILITIES: AbilityScoreKey[] = ['str', 'dex', 'con', 'int', 'wis', 'cha'];

export const AbilityScores = observer(function AbilityScores() {
  const characterStore = useCharacterStore();
  const char = characterStore.activeCharacter!;

  function updateScore(ability: AbilityScoreKey, value: number) {
    if (value < 1 || value > 30) return;
    characterStore.updateActiveCharacter({
      abilityScores: { ...char.abilityScores, [ability]: value },
    });
  }

  return (
    <div className="grid grid-cols-6 gap-1.5 sm:gap-3 mb-4">
      {ABILITIES.map((ability) => {
        const score = char.abilityScores[ability];
        const mod = getAbilityModifier(score);
        const modColor = mod > 0 ? 'text-success' : mod < 0 ? 'text-error' : 'text-base-content/60';
        return (
          <div
            key={ability}
            className="flex flex-col items-center py-2 px-1 sm:p-3 bg-base-200 rounded-xl border border-base-300 hover:border-primary/30 transition-colors group"
          >
            {/* Label: abbreviated on mobile, full name on sm+ */}
            <span className="font-bold uppercase text-base-content/50 sm:hidden text-[9px] tracking-wider">
              {ABILITY_SCORE_ABBR[ability]}
            </span>
            <span className="hidden sm:block text-[10px] font-bold uppercase tracking-widest text-base-content/50">
              {ABILITY_SCORE_NAMES[ability]}
            </span>

            {/* Modifier */}
            <span className={`text-base sm:text-2xl font-bold mt-0.5 sm:mt-1 ${modColor}`}>
              {formatModifier(mod)}
            </span>

            {/* Score: compact input on mobile, stepper on sm+ */}
            <div className="mt-1 sm:mt-2 flex items-stretch rounded-lg border border-transparent group-hover:border-base-300 overflow-hidden transition-colors">
              <button
                className="hidden sm:block px-2.5 py-1.5 bg-base-300 hover:bg-base-content/20 text-base font-bold leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => updateScore(ability, score - 1)}
              >
                −
              </button>
              <NumericInput
                value={score}
                onCommit={(v) => updateScore(ability, v ?? 10)}
                min={1}
                max={30}
                className="w-8 sm:w-12 text-center text-xs sm:text-base font-semibold bg-base-100 border-x border-transparent group-hover:border-base-300 focus:outline-none py-1 sm:py-1.5"
              />
              <button
                className="hidden sm:block px-2.5 py-1.5 bg-base-300 hover:bg-base-content/20 text-base font-bold leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => updateScore(ability, score + 1)}
              >
                +
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
});
