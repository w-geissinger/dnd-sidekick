import { makeAutoObservable } from 'mobx';

export type ModalType = 'newCharacter' | 'spellSearch' | 'itemSearch' | null;
export type SheetTab = 'combat' | 'spells' | 'equipment' | 'features' | 'lore';

const SPELL_COLUMNS_KEY = 'dnd-sidekick-spell-columns';
const DEFAULT_SPELL_COLUMNS = ['level', 'castingTime', 'range', 'duration', 'components', 'concentration', 'ritual', 'damageType', 'save', 'classes'];

function loadSpellColumns(): string[] {
  try {
    const saved = localStorage.getItem(SPELL_COLUMNS_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return DEFAULT_SPELL_COLUMNS;
}

const THEME_KEY = 'dnd-sidekick-theme';
const DEFAULT_THEME = 'dark';

export const THEMES = [
  'light', 'dark', 'cupcake', 'bumblebee', 'emerald', 'corporate',
  'synthwave', 'retro', 'cyberpunk', 'valentine', 'halloween',
  'garden', 'forest', 'aqua', 'lofi', 'pastel', 'fantasy',
  'wireframe', 'black', 'luxury', 'dracula', 'cmyk', 'autumn',
  'business', 'acid', 'lemonade', 'night', 'coffee', 'winter',
  'dim', 'nord', 'sunset',
] as const;

function loadTheme(): string {
  try {
    const saved = localStorage.getItem(THEME_KEY);
    if (saved && (THEMES as readonly string[]).includes(saved)) return saved;
  } catch { /* ignore */ }
  return DEFAULT_THEME;
}

const ITEM_COLUMNS_KEY = 'dnd-sidekick-item-columns';
const DEFAULT_ITEM_COLUMNS = ['itemType', 'rarity', 'attunement', 'source'];

function loadItemColumns(): string[] {
  try {
    const saved = localStorage.getItem(ITEM_COLUMNS_KEY);
    if (saved) return JSON.parse(saved);
  } catch { /* ignore */ }
  return DEFAULT_ITEM_COLUMNS;
}

export class UIStore {
  activeModal: ModalType = null;
  activeCharacterSheetTab: SheetTab = 'combat';
  sidebarOpen: boolean = true;
  spellColumns: string[] = loadSpellColumns();
  itemColumns: string[] = loadItemColumns();
  theme: string = loadTheme();

  constructor() {
    makeAutoObservable(this);
    this.applyTheme(this.theme);
  }

  setTheme(theme: string) {
    this.theme = theme;
    this.applyTheme(theme);
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch (err) {
      console.error('[UIStore] Failed to save theme:', err);
    }
  }

  private applyTheme(theme: string) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  openModal(modal: ModalType) {
    this.activeModal = modal;
  }

  closeModal() {
    this.activeModal = null;
  }

  setActiveTab(tab: SheetTab) {
    this.activeCharacterSheetTab = tab;
  }

  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }

  toggleSpellColumn(key: string) {
    if (this.spellColumns.includes(key)) {
      this.spellColumns = this.spellColumns.filter((k) => k !== key);
    } else {
      this.spellColumns = [...this.spellColumns, key];
    }
    try {
      localStorage.setItem(SPELL_COLUMNS_KEY, JSON.stringify(this.spellColumns));
    } catch (err) {
      console.error('[UIStore] Failed to save spell columns:', err);
    }
  }

  toggleItemColumn(key: string) {
    if (this.itemColumns.includes(key)) {
      this.itemColumns = this.itemColumns.filter((k) => k !== key);
    } else {
      this.itemColumns = [...this.itemColumns, key];
    }
    try {
      localStorage.setItem(ITEM_COLUMNS_KEY, JSON.stringify(this.itemColumns));
    } catch (err) {
      console.error('[UIStore] Failed to save item columns:', err);
    }
  }
}
