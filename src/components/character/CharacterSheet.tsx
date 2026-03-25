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
import { ShieldFill, Stars, Bag, Award, BookHalf, ListCheck } from 'react-bootstrap-icons';

const TABS: { key: SheetTab; label: string; icon: React.ElementType }[] = [
  { key: 'combat',    label: 'Combat',    icon: ShieldFill },
  { key: 'spells',    label: 'Spells',    icon: Stars      },
  { key: 'equipment', label: 'Equipment', icon: Bag        },
  { key: 'features',  label: 'Features',  icon: Award      },
  { key: 'lore',      label: 'Lore',      icon: BookHalf   },
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

      {/* Tab row — desktop only */}
      <div className={`hidden sm:flex shrink-0 ${sidebarOpen ? 'sm:gap-4' : ''}`}>
        {/* Skills tab — on desktop aligns above sidebar width */}
        <div className={`shrink-0 transition-all duration-200 flex items-end ${sidebarOpen ? 'sm:w-72' : 'w-auto'}`}>
          <button
            className={`side-tab ${sidebarOpen ? 'side-tab-active' : ''}`}
            onClick={() => uiStore.toggleSidebar()}
            title={sidebarOpen ? 'Hide skills' : 'Show skills'}
          >
            {sidebarOpen ? '◂' : '▸'} Skills
          </button>
        </div>

        {/* Main content tabs */}
        <div className="folder-tabs flex-1 min-w-0 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.key}
              className={`folder-tab whitespace-nowrap ${tab === t.key ? 'folder-tab-active' : ''}`}
              onClick={() => uiStore.setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sidebar + folder content fill remaining height */}
      <div className={`relative flex min-h-0 flex-1 pb-4 ${sidebarOpen ? 'sm:gap-4' : ''}`}>
        {/* Mobile backdrop — closes sidebar when tapping outside */}
        {sidebarOpen && (
          <div
            className="sm:hidden absolute inset-0 z-10 bg-black/30"
            onClick={() => uiStore.toggleSidebar()}
          />
        )}

        {/* Collapsible sidebar — mobile: absolute overlay, desktop: side panel */}
        <div className={`
          transition-all duration-200 overflow-y-auto
          absolute left-0 top-0 bottom-0 z-20 bg-base-100
          sm:static sm:bg-transparent sm:z-auto
          ${sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}
        `}>
          <div className="w-72 space-y-4 pt-1">
            <SavingThrows />
            <SkillsList />
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0 flex flex-col min-h-0">
          <div className="folder-panel flex-1 min-h-0 overflow-y-auto">
            <div className="space-y-4 pb-20 sm:pb-0">
              {tab === 'combat' && (
                <>
                  <div className="flex flex-col sm:flex-row gap-4 items-stretch">
                    <div className="flex-1 min-w-0">
                      <CombatStats />
                    </div>
                    <div className="sm:shrink-0">
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
      {/* Bottom nav — mobile only */}
      <nav className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-base-100 border-t border-base-300 flex" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <button
          className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${sidebarOpen ? 'text-primary' : 'text-base-content/40'}`}
          onClick={() => uiStore.toggleSidebar()}
        >
          <ListCheck className="w-5 h-5" />
          <span className="text-[9px] font-medium">Skills</span>
        </button>
        {TABS.map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${tab === key ? 'text-primary' : 'text-base-content/40'}`}
            onClick={() => uiStore.setActiveTab(key)}
          >
            <Icon className="w-5 h-5" />
            <span className="text-[9px] font-medium">{label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
});
