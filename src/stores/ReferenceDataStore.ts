import { makeAutoObservable } from 'mobx';
import type { SpellEntry, ItemEntry, BackgroundEntry } from '../types/dnd-data';
import type { CharacterSkill } from '../types/character';
import {
  searchSpells,
  searchItems,
  searchBackgrounds,
  getSrdSkills,
  buildSkillsForNewCharacter,
} from '../services/referenceData';

export class ReferenceDataStore {
  spellResults: SpellEntry[] = [];
  itemResults: ItemEntry[] = [];
  backgroundResults: BackgroundEntry[] = [];

  constructor() {
    makeAutoObservable(this);
  }

  get skills() {
    return getSrdSkills();
  }

  searchSpells(query: string, level?: number) {
    this.spellResults = searchSpells(query, level);
  }

  searchItems(query: string, type?: string) {
    this.itemResults = searchItems(query, type);
  }

  searchBackgrounds(query: string) {
    this.backgroundResults = searchBackgrounds(query);
  }

  skillsForNewCharacter(): CharacterSkill[] {
    return buildSkillsForNewCharacter();
  }
}
