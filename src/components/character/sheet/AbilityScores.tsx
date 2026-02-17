import React from 'react';
import { observer } from 'mobx-react-lite';
import { useCharacterStore } from '../../../stores/RootStore';
import { getAbilityModifier, formatModifier, ABILITY_SCORE_NAMES } from '../../../utils/characterUtils';
import type { AbilityScoreKey } from '../../../types/character';

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
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
      {ABILITIES.map((ability) => {
        const score = char.abilityScores[ability];
        const mod = getAbilityModifier(score);
        const modColor = mod > 0 ? 'text-success' : mod < 0 ? 'text-error' : 'text-base-content/60';
        return (
          <div
            key={ability}
            className="flex flex-col items-center p-3 bg-base-200 rounded-xl border border-base-300 hover:border-primary/30 transition-colors"
          >
            <span className="text-[10px] font-bold uppercase tracking-widest text-base-content/50">
              {ABILITY_SCORE_NAMES[ability]}
            </span>
            <span className={`text-2xl font-bold mt-1 ${modColor}`}>{formatModifier(mod)}</span>
            <div className="flex items-stretch mt-2 rounded-lg border border-base-300 overflow-hidden">
              <button
                className="px-2.5 py-1.5 bg-base-300 hover:bg-base-content/20 text-base font-bold leading-none"
                onClick={() => updateScore(ability, score - 1)}
              >
                −
              </button>
              <input
                type="number"
                min={1}
                max={30}
                value={score}
                onChange={(e) => {
                  const num = parseInt(e.target.value);
                  if (!isNaN(num)) updateScore(ability, num);
                }}
                className="w-12 text-center text-base font-semibold bg-base-100 border-x border-base-300 focus:outline-none py-1.5"
              />
              <button
                className="px-2.5 py-1.5 bg-base-300 hover:bg-base-content/20 text-base font-bold leading-none"
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
