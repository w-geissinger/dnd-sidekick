import type { SpellEntry, ItemEntry, BackgroundEntry, SrdSkill, SrdAbilityScore } from '../types/dnd-data';
import type { AbilityScoreKey, CharacterSkill } from '../types/character';

// Import dnd-data datasets (these are JSON arrays)
import spellsData from 'dnd-data/spells';
import itemsData from 'dnd-data/items';
import backgroundsData from 'dnd-data/backgrounds';

// Import SRD data
import srdSkills from '../data/srd/skills.json';
import srdAbilityScores from '../data/srd/ability-scores.json';
import srdLanguages from '../data/srd/languages.json';

// Deduplicate by name, keeping first occurrence
function deduplicateByName<T extends { name: string }>(entries: T[]): T[] {
  const seen = new Set<string>();
  return entries.filter((entry) => {
    const lower = entry.name.toLowerCase();
    if (seen.has(lower)) return false;
    seen.add(lower);
    return true;
  });
}

const spells = deduplicateByName(spellsData as SpellEntry[]);
const items = deduplicateByName(itemsData as ItemEntry[]);
const backgrounds = deduplicateByName(backgroundsData as BackgroundEntry[]);

export function getSpells(): SpellEntry[] {
  return spells;
}

export function getItems(): ItemEntry[] {
  return items;
}

export function getBackgrounds(): BackgroundEntry[] {
  return backgrounds;
}

export function getSrdSkills(): SrdSkill[] {
  return srdSkills as SrdSkill[];
}

export function getSrdAbilityScores(): SrdAbilityScore[] {
  return srdAbilityScores as SrdAbilityScore[];
}

export function getSrdLanguages() {
  return srdLanguages;
}

// Lookup by name (for showing details of known spells)
const spellsByName = new Map<string, SpellEntry>();
for (const spell of spells) {
  spellsByName.set(spell.name.toLowerCase(), spell);
}

export function getSpellByName(name: string): SpellEntry | undefined {
  return spellsByName.get(name.toLowerCase());
}

// Lookup items by name
const itemsByName = new Map<string, ItemEntry>();
for (const item of items) {
  itemsByName.set(item.name.toLowerCase(), item);
}

export function getItemByName(name: string): ItemEntry | undefined {
  return itemsByName.get(name.toLowerCase());
}

// Sort results so exact matches come first, then "starts with", then the rest
function sortByRelevance<T extends { name: string }>(results: T[], query: string): T[] {
  if (!query) return results;
  const q = query.toLowerCase();
  return results.sort((a, b) => {
    const aName = a.name.toLowerCase();
    const bName = b.name.toLowerCase();
    const aExact = aName === q;
    const bExact = bName === q;
    if (aExact !== bExact) return aExact ? -1 : 1;
    const aStarts = aName.startsWith(q);
    const bStarts = bName.startsWith(q);
    if (aStarts !== bStarts) return aStarts ? -1 : 1;
    return 0;
  });
}

// Search functions
export function searchSpells(query: string, level?: number, className?: string): SpellEntry[] {
  const q = query.toLowerCase();
  const filtered = spells.filter((s) => {
    if (level !== undefined && s.properties.Level !== level) return false;
    if (className) {
      const classes = (s.properties.Classes as string | undefined) ?? '';
      if (!classes.toLowerCase().includes(className.toLowerCase())) return false;
    }
    return s.name.toLowerCase().includes(q);
  });
  return sortByRelevance(filtered, query);
}

export function searchItems(query: string, type?: string): ItemEntry[] {
  const q = query.toLowerCase();
  const filtered = items.filter((item) => {
    if (type && item.properties['Item Type'] !== type) return false;
    return item.name.toLowerCase().includes(q);
  });
  return sortByRelevance(filtered, query);
}

export function searchBackgrounds(query: string): BackgroundEntry[] {
  const q = query.toLowerCase();
  const filtered = backgrounds.filter((bg) => bg.name.toLowerCase().includes(q));
  return sortByRelevance(filtered, query);
}

// Map SRD ability index to our AbilityScoreKey
const abilityIndexMap: Record<string, AbilityScoreKey> = {
  str: 'str',
  dex: 'dex',
  con: 'con',
  int: 'int',
  wis: 'wis',
  cha: 'cha',
};

export function buildSkillsForNewCharacter(): CharacterSkill[] {
  return (srdSkills as SrdSkill[]).map((skill) => ({
    index: skill.index,
    name: skill.name,
    ability: abilityIndexMap[skill.ability_score.index] ?? 'str',
    proficient: false,
    expertise: false,
  }));
}
