import React from 'react';
import { observer } from 'mobx-react-lite';
import { useCharacterStore } from '../../../stores/RootStore';
import { getAbilityModifier, getProficiencyBonus, formatModifier } from '../../../utils/characterUtils';
import { SectionCard } from '../../shared/SectionCard';

export const SkillsList = observer(function SkillsList() {
  const characterStore = useCharacterStore();
  const char = characterStore.activeCharacter!;
  const profBonus = getProficiencyBonus(char.level);

  function toggleProficiency(index: number) {
    const updated = char.skills.map((skill, i) =>
      i === index ? { ...skill, proficient: !skill.proficient, expertise: !skill.proficient ? skill.expertise : false } : skill
    );
    characterStore.updateActiveCharacter({ skills: updated });
  }

  function toggleExpertise(index: number) {
    const updated = char.skills.map((skill, i) =>
      i === index ? { ...skill, expertise: !skill.expertise, proficient: !skill.expertise ? true : skill.proficient } : skill
    );
    characterStore.updateActiveCharacter({ skills: updated });
  }

  return (
    <SectionCard title="Skills">
      <div>
        <div className="flex items-center gap-3 px-2 pb-1 mb-1 border-b border-base-300">
          <span className="text-xs font-semibold text-base-content/50 w-5 text-center">Prof</span>
          <span className="text-xs font-semibold text-base-content/50 w-5 text-center">Exp</span>
          <span className="text-xs font-semibold text-base-content/50 w-8 text-right">Mod</span>
          <span className="text-xs font-semibold text-base-content/50">Skill</span>
        </div>
        {char.skills.map((skill, index) => {
          const abilityMod = getAbilityModifier(char.abilityScores[skill.ability]);
          const profValue = skill.expertise ? profBonus * 2 : skill.proficient ? profBonus : 0;
          const total = abilityMod + profValue;
          const modColor = total > 0 ? 'text-success' : total < 0 ? 'text-error' : 'text-base-content/60';
          const rowBg = skill.expertise
            ? 'bg-secondary/10'
            : skill.proficient
              ? 'bg-primary/10'
              : index % 2 === 0
                ? 'bg-base-100'
                : '';
          return (
            <div
              key={skill.index}
              className={`flex items-center gap-3 px-2 py-1.5 rounded transition-colors hover:bg-base-300/50 ${rowBg}`}
            >
              <input
                type="checkbox"
                checked={skill.proficient}
                onChange={() => toggleProficiency(index)}
                className="checkbox checkbox-xs checkbox-primary"
                title="Proficiency"
              />
              <input
                type="checkbox"
                checked={skill.expertise}
                onChange={() => toggleExpertise(index)}
                className="checkbox checkbox-xs checkbox-secondary"
                title="Expertise"
              />
              <span className={`font-mono text-sm w-8 text-right font-bold ${modColor}`}>{formatModifier(total)}</span>
              <span className="text-sm">
                {skill.name}{' '}
                <span className="text-base-content/40 text-[10px] uppercase">{skill.ability}</span>
              </span>
            </div>
          );
        })}
      </div>
    </SectionCard>
  );
});
