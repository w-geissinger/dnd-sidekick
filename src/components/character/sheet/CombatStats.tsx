import React from 'react';
import { observer } from 'mobx-react-lite';
import { useCharacterStore } from '../../../stores/RootStore';
import { getAbilityModifier, formatModifier } from '../../../utils/characterUtils';
import { SectionCard } from '../../shared/SectionCard';
import { NumericInput } from '../../shared/NumericInput';
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
      <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
        <div className="flex flex-col items-center p-2 sm:p-3 bg-base-100 rounded-xl border border-base-300 sm:w-28">
          <ShieldFill className="w-4 h-4 text-info mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/40">AC</span>
          <NumericInput
            value={char.armorClass}
            onCommit={(v) => update({ armorClass: v ?? 0 })}
            min={0}
            className="input input-bordered input-sm w-full sm:w-16 text-center text-lg font-bold mt-1"
          />
        </div>

        <div className="flex flex-col items-center p-2 sm:p-3 bg-base-100 rounded-xl border border-base-300 sm:w-28">
          <Lightning className="w-4 h-4 text-warning mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/40">Initiative</span>
          <NumericInput
            value={initiative}
            onCommit={(v) => update({ initiative: v })}
            allowEmpty
            className="input input-bordered input-sm w-full sm:w-16 text-center text-lg font-bold mt-1"
          />
          <span className="text-[10px] text-base-content/30">DEX {formatModifier(dexMod)}</span>
        </div>

        <div className="flex flex-col items-center p-2 sm:p-3 bg-base-100 rounded-xl border border-base-300 sm:w-28">
          <Speedometer2 className="w-4 h-4 text-accent mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/40">Speed</span>
          <NumericInput
            value={char.speed}
            onCommit={(v) => update({ speed: v ?? 0 })}
            min={0}
            className="input input-bordered input-sm w-full sm:w-16 text-center text-lg font-bold mt-1"
          />
          <span className="text-[10px] text-base-content/30">ft</span>
        </div>

        <div className="flex flex-col items-center p-2 sm:p-3 bg-base-100 rounded-xl border border-base-300 col-span-1 sm:w-32">
          <HeartFill className={`w-4 h-4 mb-1 ${hpColor}`} />
          <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/40">Hit Points</span>
          <div className="flex flex-col items-center gap-0.5 mt-1 w-full">
            <div className="relative w-full">
              <NumericInput
                value={char.hitPointsCurrent}
                onCommit={(v) => update({ hitPointsCurrent: v ?? 0 })}
                className="input input-bordered input-sm w-full text-center text-lg font-bold"
              />
              <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-base-content/30 uppercase pointer-events-none">Cur</span>
            </div>
            <div className="w-6 border-t border-base-300" />
            <div className="relative w-full">
              <NumericInput
                value={char.hitPointsMax}
                onCommit={(v) => update({ hitPointsMax: v ?? 0 })}
                min={0}
                className="input input-bordered input-xs w-full text-center text-base-content/60"
              />
              <span className="absolute right-1 top-1/2 -translate-y-1/2 text-[9px] text-base-content/30 uppercase pointer-events-none">Max</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center p-2 sm:p-3 bg-base-100 rounded-xl border border-base-300 sm:w-28">
          <ThermometerHalf className="w-4 h-4 text-secondary mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/40">Temp HP</span>
          <NumericInput
            value={char.tempHitPoints}
            onCommit={(v) => update({ tempHitPoints: v ?? 0 })}
            min={0}
            className="input input-bordered input-sm w-full sm:w-16 text-center text-lg font-bold mt-1"
          />
        </div>

        <div className="flex flex-col items-center p-2 sm:p-3 bg-base-100 rounded-xl border border-base-300 sm:w-28">
          <DiamondHalf className="w-4 h-4 text-primary mb-1" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-base-content/40">Hit Dice</span>
          <input
            type="text"
            value={char.hitDice}
            onChange={(e) => update({ hitDice: e.target.value })}
            className="input input-bordered input-sm w-full sm:w-16 text-center text-sm font-bold mt-1"
          />
          <span className="text-[10px] text-base-content/30">{char.hitDiceRemaining} left</span>
        </div>
      </div>
    </SectionCard>
  );
});
