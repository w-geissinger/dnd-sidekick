import { observer } from 'mobx-react-lite';
import { useCharacterStore } from '../../../stores/RootStore';
import { SectionCard } from '../../shared/SectionCard';

type DescriptionKey = 'personalityTraits' | 'ideals' | 'bonds' | 'flaws' | 'appearance' | 'alliesAndOrganizations' | 'backstory' | 'treasure' | 'additionalNotes';

const FIELDS: { key: DescriptionKey; label: string; placeholder: string; minHeight: string }[] = [
  { key: 'personalityTraits', label: 'Personality Traits', placeholder: 'I am always polite and respectful...', minHeight: 'min-h-20' },
  { key: 'ideals', label: 'Ideals', placeholder: 'Respect. People deserve to be treated with dignity...', minHeight: 'min-h-20' },
  { key: 'bonds', label: 'Bonds', placeholder: 'I will do anything to protect the temple where I served...', minHeight: 'min-h-20' },
  { key: 'flaws', label: 'Flaws', placeholder: 'I judge others harshly, and myself even more so...', minHeight: 'min-h-20' },
  { key: 'appearance', label: 'Character Appearance', placeholder: 'Describe your character\'s appearance...', minHeight: 'min-h-24' },
  { key: 'alliesAndOrganizations', label: 'Allies & Organizations', placeholder: 'Organizations, factions, allies...', minHeight: 'min-h-24' },
  { key: 'backstory', label: 'Backstory', placeholder: 'Your character\'s history and background...', minHeight: 'min-h-40' },
  { key: 'treasure', label: 'Treasure', placeholder: 'Special items, heirlooms, treasures...', minHeight: 'min-h-20' },
  { key: 'additionalNotes', label: 'Additional Notes', placeholder: 'Any other notes about your character...', minHeight: 'min-h-24' },
];

export const CharacterDescription = observer(function CharacterDescription() {
  const characterStore = useCharacterStore();
  const char = characterStore.activeCharacter!;

  return (
    <>
      {FIELDS.map((field) => (
        <SectionCard key={field.key} title={field.label} collapsible defaultOpen={true}>
          <textarea
            value={char[field.key]}
            onChange={(e) => characterStore.updateActiveCharacter({ [field.key]: e.target.value })}
            className={`textarea textarea-bordered w-full bg-base-100 focus:border-primary/50 ${field.minHeight}`}
            placeholder={field.placeholder}
          />
        </SectionCard>
      ))}
    </>
  );
});
