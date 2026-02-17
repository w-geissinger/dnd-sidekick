export interface DndDataEntry {
  name: string;
  description: string;
  publisher: string;
  book: string;
  properties: Record<string, unknown>;
}

export interface SpellEntry extends DndDataEntry {
  properties: {
    Category: 'Spells';
    Level?: number;
    School?: string;
    Components?: string;
    'Casting Time'?: string;
    'data-RangeAoe'?: string;
    Save?: string;
    'Damage Type'?: string;
    [key: string]: unknown;
  };
}

export interface ItemEntry extends DndDataEntry {
  properties: {
    Category: 'Items';
    'Item Type'?: string;
    'Item Rarity'?: string;
    'Requires Attunement'?: string;
    [key: string]: unknown;
  };
}

export interface BackgroundEntry extends DndDataEntry {
  properties: {
    Category: 'Backgrounds';
    'data-Bonds'?: string;
    'data-Flaws'?: string;
    'data-Ideals'?: string;
    'data-Personality Traits'?: string;
    'data-Equipment'?: string;
    'data-Starting Gold'?: string;
    [key: string]: unknown;
  };
}

export interface SrdSkill {
  index: string;
  name: string;
  desc: string[];
  ability_score: {
    index: string;
    name: string;
    url: string;
  };
  url: string;
}

export interface SrdAbilityScore {
  index: string;
  name: string;
  full_name: string;
  desc: string[];
  skills: { index: string; name: string; url: string }[];
  url: string;
}

export interface SrdLanguage {
  index: string;
  name: string;
  type: string;
  typical_speakers: string[];
  script: string;
  desc: string;
  url: string;
}
