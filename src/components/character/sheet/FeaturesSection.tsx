import React from 'react';
import { observer } from 'mobx-react-lite';
import { useCharacterStore } from '../../../stores/RootStore';
import { SectionCard } from '../../shared/SectionCard';

export const FeaturesSection = observer(function FeaturesSection() {
  const characterStore = useCharacterStore();
  const char = characterStore.activeCharacter!;

  return (
    <>
      <SectionCard title="Features & Traits" collapsible defaultOpen={true}>
        <textarea
          value={char.featuresAndTraits}
          onChange={(e) => characterStore.updateActiveCharacter({ featuresAndTraits: e.target.value })}
          className="textarea textarea-bordered w-full min-h-40 bg-base-100 focus:border-primary/50"
          placeholder="Class features, racial traits, feats..."
        />
      </SectionCard>

      <SectionCard title="Proficiencies" collapsible defaultOpen={true}>
        <textarea
          value={char.proficienciesText}
          onChange={(e) => characterStore.updateActiveCharacter({ proficienciesText: e.target.value })}
          className="textarea textarea-bordered w-full min-h-24 bg-base-100 focus:border-primary/50"
          placeholder="Armor, weapon, tool proficiencies..."
        />
      </SectionCard>

      <SectionCard title="Languages" collapsible defaultOpen={true}>
        <textarea
          value={char.languagesText}
          onChange={(e) => characterStore.updateActiveCharacter({ languagesText: e.target.value })}
          className="textarea textarea-bordered w-full min-h-16 bg-base-100 focus:border-primary/50"
          placeholder="Common, Elvish..."
        />
      </SectionCard>
    </>
  );
});
