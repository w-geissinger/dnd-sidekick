import { observer } from 'mobx-react-lite';
import { useCharacterStore, useUIStore } from '../../stores/RootStore';
import type { SheetTab } from '../../stores/UIStore';
import { CharacterHeader } from './sheet/CharacterHeader';
import { AbilityScores } from './sheet/AbilityScores';
import { SavingThrows } from './sheet/SavingThrows';
import { SkillsList } from './sheet/SkillsList';
import { CombatStats } from './sheet/CombatStats';
import { DeathSaves } from './sheet/DeathSaves';
import { AttacksSection } from './sheet/AttacksSection';
import { EquipmentSection } from './sheet/EquipmentSection';
import { SpellsSection } from './sheet/SpellsSection';
import { FeaturesSection } from './sheet/FeaturesSection';
import { CharacterDescription } from './sheet/CharacterDescription';

const TABS: { key: SheetTab; label: string }[] = [
  { key: 'combat', label: 'Combat' },
  { key: 'spells', label: 'Spells' },
  { key: 'equipment', label: 'Equipment' },
  { key: 'features', label: 'Features' },
  { key: 'lore', label: 'Lore' },
];

export const CharacterSheet = observer(function CharacterSheet() {
  const characterStore = useCharacterStore();
  const uiStore = useUIStore();
  const character = characterStore.activeCharacter;
  const tab = uiStore.activeCharacterSheetTab;
  const sidebarOpen = uiStore.sidebarOpen;

  if (!character) return null;

  return (
    <div className="flex flex-col h-full min-h-0 container mx-auto px-4 max-w-6xl">
      {/* Pinned header area */}
      <div className="shrink-0 pt-4">
        <CharacterHeader />
        <AbilityScores />
      </div>

      {/* Tab row spanning both sidebar and main content */}
      <div className={`flex shrink-0 ${sidebarOpen ? 'gap-4' : 'gap-0'}`}>
        {/* Skills tab — aligned above sidebar */}
        <div className={`shrink-0 transition-all duration-200 flex items-end ${sidebarOpen ? 'w-72' : 'w-auto'}`}>
          <button
            className={`side-tab ${sidebarOpen ? 'side-tab-active' : ''}`}
            onClick={() => uiStore.toggleSidebar()}
            title={sidebarOpen ? 'Hide skills' : 'Show skills'}
          >
            {sidebarOpen ? '◂' : '▸'} Skills
          </button>
        </div>

        {/* Main content tabs */}
        <div className="folder-tabs flex-1 min-w-0">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`folder-tab ${tab === t.key ? 'folder-tab-active' : ''}`}
              onClick={() => uiStore.setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar + folder content fill remaining height */}
      <div className={`flex min-h-0 flex-1 pb-4 transition-all duration-200 ${sidebarOpen ? 'gap-4' : 'gap-0'}`}>
        {/* Collapsible sidebar */}
        <div className={`shrink-0 transition-all duration-200 overflow-y-auto ${sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}`}>
          <div className="w-72 space-y-4">
            <SavingThrows />
            <SkillsList />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          <div className="folder-panel flex-1 min-h-0 overflow-y-auto">
            <div className="space-y-4">
              {tab === 'combat' && (
                <>
                  <div className="flex gap-4 items-stretch">
                    <div className="flex-1 min-w-0">
                      <CombatStats />
                    </div>
                    <div className="shrink-0">
                      <DeathSaves />
                    </div>
                  </div>
                  <AttacksSection />
                </>
              )}
              {tab === 'spells' && <SpellsSection />}
              {tab === 'equipment' && <EquipmentSection />}
              {tab === 'features' && <FeaturesSection />}
              {tab === 'lore' && <CharacterDescription />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});
