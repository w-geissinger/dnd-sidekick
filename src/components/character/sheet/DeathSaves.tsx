import React from 'react';
import { observer } from 'mobx-react-lite';
import { useCharacterStore } from '../../../stores/RootStore';
import { SectionCard } from '../../shared/SectionCard';
import { HeartFill, XCircleFill } from 'react-bootstrap-icons';

export const DeathSaves = observer(function DeathSaves() {
  const characterStore = useCharacterStore();
  const char = characterStore.activeCharacter!;

  function setSuccesses(count: number) {
    characterStore.updateActiveCharacter({
      deathSaves: { ...char.deathSaves, successes: count },
    });
  }

  function setFailures(count: number) {
    characterStore.updateActiveCharacter({
      deathSaves: { ...char.deathSaves, failures: count },
    });
  }

  return (
    <SectionCard title="Death Saves">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <HeartFill className="w-3.5 h-3.5 text-success" />
          <span className="text-xs font-bold uppercase tracking-wider text-success w-16">Pass</span>
          {[1, 2, 3].map((n) => (
            <input
              key={n}
              type="checkbox"
              checked={char.deathSaves.successes >= n}
              onChange={() => setSuccesses(char.deathSaves.successes >= n ? n - 1 : n)}
              className="checkbox checkbox-sm checkbox-success"
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <XCircleFill className="w-3.5 h-3.5 text-error" />
          <span className="text-xs font-bold uppercase tracking-wider text-error w-16">Fail</span>
          {[1, 2, 3].map((n) => (
            <input
              key={n}
              type="checkbox"
              checked={char.deathSaves.failures >= n}
              onChange={() => setFailures(char.deathSaves.failures >= n ? n - 1 : n)}
              className="checkbox checkbox-sm checkbox-error"
            />
          ))}
        </div>
      </div>
    </SectionCard>
  );
});
