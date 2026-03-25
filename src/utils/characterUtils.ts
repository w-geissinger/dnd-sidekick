import type { AbilityScoreKey, Character, CharacterSkill, NewCharacterDraft, SpellSlots } from '../types/character';

export function generateId(): string {
  return crypto.randomUUID();
}

export function toSlugIndex(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

export function getAbilityModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

export function getProficiencyBonus(level: number): number {
  return Math.ceil(level / 4) + 1;
}

export function formatModifier(mod: number): string {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

const defaultSpellSlots: SpellSlots = {
  1: { total: 0, used: 0 },
  2: { total: 0, used: 0 },
  3: { total: 0, used: 0 },
  4: { total: 0, used: 0 },
  5: { total: 0, used: 0 },
  6: { total: 0, used: 0 },
  7: { total: 0, used: 0 },
  8: { total: 0, used: 0 },
  9: { total: 0, used: 0 },
};

export function buildDefaultCharacter(draft: NewCharacterDraft, skills: CharacterSkill[]): Character {
  const now = new Date().toISOString();
  return {
    id: generateId(),
    name: draft.name,
    class: draft.class,
    level: draft.level,
    background: draft.background,
    race: draft.race,
    alignment: draft.alignment,
    experiencePoints: 0,
    inspiration: false,

    abilityScores: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
    savingThrows: (
      ['str', 'dex', 'con', 'int', 'wis', 'cha'] as AbilityScoreKey[]
    ).map((ability) => ({ ability, proficient: false })),
    skills,

    armorClass: 10,
    initiative: null,
    speed: 30,
    hitPointsMax: 10,
    hitPointsCurrent: 10,
    tempHitPoints: 0,
    hitDice: `1d${draft.class === 'Barbarian' ? 12 : draft.class === 'Fighter' || draft.class === 'Paladin' || draft.class === 'Ranger' ? 10 : draft.class === 'Sorcerer' || draft.class === 'Wizard' ? 6 : 8}`,
    hitDiceRemaining: draft.level,
    deathSaves: { successes: 0, failures: 0 },

    attacks: [],
    equipment: [],
    currency: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 },

    spellcastingAbility: '',
    spellSaveDC: null,
    spellAttackBonus: null,
    maxPreparedSpells: null,
    spellSlots: { ...defaultSpellSlots },
    spells: [],

    proficienciesText: '',
    languagesText: 'Common',
    featuresAndTraits: '',

    personalityTraits: '',
    ideals: '',
    bonds: '',
    flaws: '',
    appearance: '',
    alliesAndOrganizations: '',
    backstory: '',
    treasure: '',
    additionalNotes: '',

    createdAt: now,
    updatedAt: now,
  };
}

export const ABILITY_SCORE_NAMES: Record<AbilityScoreKey, string> = {
  str: 'Strength',
  dex: 'Dexterity',
  con: 'Constitution',
  int: 'Intelligence',
  wis: 'Wisdom',
  cha: 'Charisma',
};

export const ABILITY_SCORE_ABBR: Record<AbilityScoreKey, string> = {
  str: 'STR',
  dex: 'DEX',
  con: 'CON',
  int: 'INT',
  wis: 'WIS',
  cha: 'CHA',
};

export const ALIGNMENTS = [
  'Lawful Good', 'Neutral Good', 'Chaotic Good',
  'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
  'Lawful Evil', 'Neutral Evil', 'Chaotic Evil',
];

export const CLASSES = [
  'Artificer', 'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter',
  'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer',
  'Warlock', 'Wizard',
];

export const RACES = [
  'Human', 'Elf', 'Dwarf', 'Halfling', 'Gnome',
  'Half-Elf', 'Half-Orc', 'Tiefling', 'Dragonborn',
];
