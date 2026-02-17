import { makeAutoObservable, toJS } from 'mobx';
import type { Attack, Character, CharacterSpell, NewCharacterDraft } from '../types/character';
import { buildDefaultCharacter, generateId } from '../utils/characterUtils';
import { buildSkillsForNewCharacter } from '../services/referenceData';

const STORAGE_KEY = 'dnd-sidekick-characters';

export class CharacterStore {
  characters: Character[] = [];
  activeCharacterId: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.loadFromStorage();
  }

  get activeCharacter(): Character | undefined {
    return this.characters.find((c) => c.id === this.activeCharacterId);
  }

  get sortedCharacters(): Character[] {
    return [...this.characters].sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  setActiveCharacter(id: string | null) {
    this.activeCharacterId = id;
  }

  createCharacter(draft: NewCharacterDraft): Character {
    const skills = buildSkillsForNewCharacter();
    const character = buildDefaultCharacter(draft, skills);
    this.characters.push(character);
    this.activeCharacterId = character.id;
    this.persist();
    return character;
  }

  updateCharacter(id: string, patch: Partial<Character>) {
    const index = this.characters.findIndex((c) => c.id === id);
    if (index === -1) return;
    this.characters[index] = {
      ...this.characters[index],
      ...patch,
      updatedAt: new Date().toISOString(),
    };
    this.persist();
  }

  updateActiveCharacter(patch: Partial<Character>) {
    if (this.activeCharacterId) {
      this.updateCharacter(this.activeCharacterId, patch);
    }
  }

  deleteCharacter(id: string) {
    this.characters = this.characters.filter((c) => c.id !== id);
    if (this.activeCharacterId === id) {
      this.activeCharacterId = null;
    }
    this.persist();
  }

  // Spell helpers
  addSpellToCharacter(spell: CharacterSpell) {
    const char = this.activeCharacter;
    if (!char) return;
    if (char.spells.some((s) => s.index === spell.index)) return;
    this.updateActiveCharacter({
      spells: [...char.spells, spell],
    });
  }

  toggleSpellPrepared(spellIndex: string) {
    const char = this.activeCharacter;
    if (!char) return;
    this.updateActiveCharacter({
      spells: char.spells.map((s) =>
        s.index === spellIndex ? { ...s, prepared: !s.prepared } : s
      ),
    });
  }

  addAttackFromSpell(spellName: string, attackBonus: string, spellIndex: string) {
    const char = this.activeCharacter;
    if (!char) return;
    const newAttack: Attack = {
      id: generateId(),
      name: spellName,
      attackBonus,
      damageAndType: '',
      notes: '',
      spellIndex,
    };
    this.updateActiveCharacter({
      attacks: [...char.attacks, newAttack],
    });
  }

  removeSpell(spellIndex: string) {
    const char = this.activeCharacter;
    if (!char) return;
    this.updateActiveCharacter({
      spells: char.spells.filter((s) => s.index !== spellIndex),
    });
  }

  getCharacterById(id: string): Character | undefined {
    return this.characters.find((c) => c.id === id);
  }

  exportCharacter(id: string): string {
    const char = this.characters.find((c) => c.id === id);
    if (!char) throw new Error('Character not found');
    return JSON.stringify(toJS(char), null, 2);
  }

  exportAllCharacters(): string {
    return JSON.stringify(toJS(this.characters), null, 2);
  }

  importCharacters(json: string): { added: number } {
    const parsed = JSON.parse(json);
    const entries: Character[] = Array.isArray(parsed) ? parsed : [parsed];
    let added = 0;
    for (const entry of entries) {
      if (!entry.name) continue;
      const now = new Date().toISOString();
      const character: Character = {
        ...entry,
        id: generateId(),
        createdAt: entry.createdAt ?? now,
        updatedAt: now,
      };
      this.characters.push(character);
      added++;
    }
    if (added > 0) this.persist();
    return { added };
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toJS(this.characters)));
    } catch (err) {
      console.error('[CharacterStore] Failed to save characters:', err);
    }
  }

  private loadFromStorage() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        this.characters = JSON.parse(data);
      }
    } catch (err) {
      console.error('[CharacterStore] Failed to load characters:', err);
    }
  }
}
