import React from 'react';
import { observer } from 'mobx-react-lite';
import { useCharacterStore } from '../../../stores/RootStore';
import { getAbilityModifier, formatModifier } from '../../../utils/characterUtils';
import { SectionCard } from '../../shared/SectionCard';
import { ShieldFill, Lightning, HeartFill, Speedometer2, ThermometerHalf, DiamondHalf } from 'react-bootstrap-icons';

export const CombatStats = observer(function CombatStats() {
  const characterStore = useCharacterStore();
  const char = characterStore.activeCharacter!;
  const dexMod = getAbilityModifier(char.abilityScores.dex);
  const initiative = char.initiative !== null ? char.initiative : dexMod;
  const hpPercent = char.hitPointsMax > 0
    ? Math.round((char.hitPointsCurrent / char.hitPointsMax) * 100)
    : 0;
  const hpColor = hpPercent > 50 ? 'text-success' : hpPercent > 25 ? 'text-warning' : 'text-error';

  function update(patch: Record<string, unknown>) {
    characterStore.updateActiveCharacter(patch);
  }

  return (
    <SectionCard title="Combat">
      <div className="flex flex-wrap gap-3">
        <div className="flex flex-col items-center p-3 bg-base-100 rounded-xl border border-base-300 w-28">
          <ShieldFill className="w-4 h-4 text-info mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/40">AC</span>
          <input
            type="number"
            value={char.armorClass}
            onChange={(e) => update({ armorClass: parseInt(e.target.value) || 0 })}
            className="input input-bordered input-sm w-16 text-center text-lg font-bold mt-1"
          />
        </div>

        <div className="flex flex-col items-center p-3 bg-base-100 rounded-xl border border-base-300 w-28">
          <Lightning className="w-4 h-4 text-warning mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/40">Initiative</span>
          <input
            type="number"
            value={initiative}
            onChange={(e) => {
              const val = e.target.value === '' ? null : parseInt(e.target.value);
              update({ initiative: val });
            }}
            className="input input-bordered input-sm w-16 text-center text-lg font-bold mt-1"
          />
          <span className="text-[10px] text-base-content/30">DEX {formatModifier(dexMod)}</span>
        </div>

        <div className="flex flex-col items-center p-3 bg-base-100 rounded-xl border border-base-300 w-28">
          <Speedometer2 className="w-4 h-4 text-accent mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/40">Speed</span>
          <input
            type="number"
            value={char.speed}
            onChange={(e) => update({ speed: parseInt(e.target.value) || 0 })}
            className="input input-bordered input-sm w-16 text-center text-lg font-bold mt-1"
          />
          <span className="text-[10px] text-base-content/30">ft</span>
        </div>

        <div className="flex flex-col items-center p-3 bg-base-100 rounded-xl border border-base-300 w-32">
          <HeartFill className={`w-4 h-4 mb-1 ${hpColor}`} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/40">Hit Points</span>
          <div className="flex flex-col items-center gap-0.5 mt-1 w-full">
            <div className="relative w-full">
              <input
                type="number"
                value={char.hitPointsCurrent}
                onChange={(e) => update({ hitPointsCurrent: parseInt(e.target.value) || 0 })}
                className="input input-bordered input-sm w-full text-center text-lg font-bold"
              />
              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-base-content/30 uppercase pointer-events-none">Cur</span>
            </div>
            <div className="w-6 border-t border-base-300" />
            <div className="relative">
              <input
                type="number"
                value={char.hitPointsMax}
                onChange={(e) => update({ hitPointsMax: parseInt(e.target.value) || 0 })}
                className="input input-bordered input-xs w-16 text-center text-base-content/60"
              />
              <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-base-content/30 uppercase pointer-events-none">Max</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center p-3 bg-base-100 rounded-xl border border-base-300 w-28">
          <ThermometerHalf className="w-4 h-4 text-secondary mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/40">Temp HP</span>
          <input
            type="number"
            min={0}
            value={char.tempHitPoints}
            onChange={(e) => update({ tempHitPoints: parseInt(e.target.value) || 0 })}
            className="input input-bordered input-sm w-16 text-center text-lg font-bold mt-1"
          />
        </div>

        <div className="flex flex-col items-center p-3 bg-base-100 rounded-xl border border-base-300 w-28">
          <DiamondHalf className="w-4 h-4 text-primary mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/40">Hit Dice</span>
          <input
            type="text"
            value={char.hitDice}
            onChange={(e) => update({ hitDice: e.target.value })}
            className="input input-bordered input-sm w-16 text-center text-sm font-bold mt-1"
          />
          <span className="text-[10px] text-base-content/30">{char.hitDiceRemaining} left</span>
        </div>
      </div>
    </SectionCard>
  );
});
