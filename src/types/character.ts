export type AbilityScoreKey = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';

export type AbilityScores = Record<AbilityScoreKey, number>;

export interface SavingThrow {
  ability: AbilityScoreKey;
  proficient: boolean;
}

export interface CharacterSkill {
  index: string;
  name: string;
  ability: AbilityScoreKey;
  proficient: boolean;
  expertise: boolean;
}

export interface CharacterSpell {
  index: string;
  name: string;
  level: number;
  prepared: boolean;
}

export interface Attack {
  id: string;
  name: string;
  attackBonus: string;
  damageAndType: string;
  notes: string;
  spellIndex?: string;
  equipmentId?: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  quantity: number;
  weight?: number;
  description?: string;
  fromReference?: boolean;
  itemType?: string;
  rarity?: string;
  requiresAttunement?: boolean;
  value?: string;
}

export interface DeathSaves {
  successes: number; // 0-3
  failures: number;  // 0-3
}

export interface SpellSlot {
  total: number;
  used: number;
}

export type SpellSlots = Record<number, SpellSlot>; // keys 1-9

export interface Currency {
  cp: number;
  sp: number;
  ep: number;
  gp: number;
  pp: number;
}

export interface Character {
  id: string;
  name: string;
  class: string;
  level: number;
  background: string;
  race: string;
  alignment: string;
  experiencePoints: number;
  inspiration: boolean;

  abilityScores: AbilityScores;
  savingThrows: SavingThrow[];
  skills: CharacterSkill[];

  armorClass: number;
  initiative: number | null; // null = auto-calculate from dex
  speed: number;
  hitPointsMax: number;
  hitPointsCurrent: number;
  tempHitPoints: number;
  hitDice: string;
  hitDiceRemaining: number;
  deathSaves: DeathSaves;

  attacks: Attack[];
  equipment: EquipmentItem[];
  currency: Currency;

  spellcastingAbility: AbilityScoreKey | '';
  spellSaveDC: number | null;      // null = auto-calculate
  spellAttackBonus: number | null;  // null = auto-calculate
  maxPreparedSpells: number | null; // null = no limit set
  spellSlots: SpellSlots;
  spells: CharacterSpell[];

  proficienciesText: string;
  languagesText: string;
  featuresAndTraits: string;

  personalityTraits: string;
  ideals: string;
  bonds: string;
  flaws: string;
  appearance: string;
  alliesAndOrganizations: string;
  backstory: string;
  treasure: string;
  additionalNotes: string;

  createdAt: string;
  updatedAt: string;
}

export type NewCharacterDraft = Pick<
  Character,
  'name' | 'class' | 'race' | 'background' | 'alignment' | 'level'
>;
