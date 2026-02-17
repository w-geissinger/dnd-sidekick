import React, { useState } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { observer } from 'mobx-react-lite';
import { useCharacterStore, useUIStore } from '../stores/RootStore';
import { CharacterCard } from '../components/landing/CharacterCard';
import { NewCharacterModal } from '../components/landing/NewCharacterModal';
import { downloadJson, pickAndReadJsonFile } from '../utils/importExport';
import { getProficiencyBonus, formatModifier } from '../utils/characterUtils';
import { Grid3x3GapFill, ListUl, Table, Download, Trash } from 'react-bootstrap-icons';
import { SortIcon } from '../components/shared/SortIcon';
import type { Character } from '../types/character';

type ViewMode = 'grid' | 'list' | 'table';

const HomeComponent = observer(function HomeComponent() {
  const characterStore = useCharacterStore();
  const uiStore = useUIStore();
  const navigate = useNavigate();
  const allCharacters = characterStore.sortedCharacters;
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [search, setSearch] = useState('');

  const characters = search
    ? allCharacters.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()))
    : allCharacters;

  async function handleImport() {
    try {
      const json = await pickAndReadJsonFile();
      const { added } = characterStore.importCharacters(json);
      alert(`Imported ${added} character${added !== 1 ? 's' : ''}.`);
    } catch {
      // user cancelled or bad file
    }
  }

  function handleExport(id: string, name: string) {
    const json = characterStore.exportCharacter(id);
    const slug = name.replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();
    downloadJson(json, `${slug}.json`);
  }

  function goToCharacter(id: string) {
    navigate({ to: '/character/$characterId', params: { characterId: id } });
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Your Characters</h1>
        <div className="flex gap-2">
          <button
            className="btn btn-primary"
            onClick={() => uiStore.openModal('newCharacter')}
          >
            + New Character
          </button>
          <button
            className="btn btn-secondary"
            onClick={handleImport}
          >
            Import
          </button>
        </div>
      </div>

      {allCharacters.length === 0 ? (
        <div className="text-center py-24">
          <p className="text-5xl mb-4">&#9876;&#65039;</p>
          <p className="text-xl font-semibold mb-2">No adventurers yet</p>
          <p className="text-base-content/50 mb-6">
            Create your first character or import an existing one.
          </p>
          <div className="flex gap-3 justify-center">
            <button
              className="btn btn-primary btn-lg"
              onClick={() => uiStore.openModal('newCharacter')}
            >
              Create Character
            </button>
            <button
              className="btn btn-secondary btn-lg"
              onClick={handleImport}
            >
              Import
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Search + View mode picker */}
          <div className="flex items-center justify-between mb-4 gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search characters..."
              className="input input-bordered input-sm w-60"
            />
            <div className="join">
              {([
                { mode: 'grid' as ViewMode, icon: Grid3x3GapFill, label: 'Grid' },
                { mode: 'list' as ViewMode, icon: ListUl, label: 'List' },
                { mode: 'table' as ViewMode, icon: Table, label: 'Table' },
              ]).map(({ mode, icon: Icon, label }) => (
                <button
                  key={mode}
                  className={`btn btn-sm join-item gap-1.5 ${viewMode === mode ? 'btn-active' : ''}`}
                  onClick={() => setViewMode(mode)}
                  title={label}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {characters.length === 0 && search && (
            <p className="text-center text-base-content/50 py-8">No characters matching "{search}".</p>
          )}

          {viewMode === 'grid' && characters.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {characters.map((char) => (
                <CharacterCard
                  key={char.id}
                  character={char}
                  onDelete={(id) => characterStore.deleteCharacter(id)}
                  onExport={(id) => handleExport(id, char.name)}
                />
              ))}
            </div>
          )}

          {viewMode === 'list' && characters.length > 0 && (
            <div className="flex flex-col gap-2">
              {characters.map((char) => (
                <CharacterListRow
                  key={char.id}
                  character={char}
                  onClick={() => goToCharacter(char.id)}
                  onDelete={() => characterStore.deleteCharacter(char.id)}
                  onExport={() => handleExport(char.id, char.name)}
                />
              ))}
            </div>
          )}

          {viewMode === 'table' && characters.length > 0 && (
            <CharacterTable
              characters={characters}
              onClick={goToCharacter}
              onDelete={(id) => characterStore.deleteCharacter(id)}
              onExport={(id) => {
                const char = characters.find((c) => c.id === id);
                if (char) handleExport(id, char.name);
              }}
            />
          )}
        </>
      )}

      <NewCharacterModal />
    </div>
  );
});

/* ── List Row ─────────────────────────────────────────────── */

function CharacterListRow({
  character,
  onClick,
  onDelete,
  onExport,
}: {
  character: Character;
  onClick: () => void;
  onDelete: () => void;
  onExport: () => void;
}) {
  const hpPercent = character.hitPointsMax > 0
    ? Math.round((character.hitPointsCurrent / character.hitPointsMax) * 100)
    : 0;

  return (
    <div
      className="flex items-center gap-4 px-4 py-3 bg-base-200 rounded-lg border border-base-300 hover:bg-base-300/50 cursor-pointer transition-colors group"
      onClick={onClick}
    >
      <div className="flex-1 min-w-0">
        <span className="font-semibold">{character.name}</span>
        <span className="text-sm text-base-content/50 ml-2">
          Lvl {character.level} {character.race} {character.class}
        </span>
      </div>

      <div className="flex items-center gap-3 shrink-0 text-xs">
        <span className="font-bold" title="Armor Class">AC {character.armorClass}</span>
        <div className="flex items-center gap-1.5" title="Hit Points">
          <span className="font-semibold">{character.hitPointsCurrent}/{character.hitPointsMax}</span>
          <div className="w-16 bg-base-300 rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${
                hpPercent > 50 ? 'bg-success' : hpPercent > 25 ? 'bg-warning' : 'bg-error'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, hpPercent))}%` }}
            />
          </div>
        </div>
        <span title="Speed">{character.speed} ft</span>
      </div>

      <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          className="btn btn-ghost btn-xs"
          onClick={(e) => { e.stopPropagation(); onExport(); }}
          title="Export"
        >
          <Download className="w-3 h-3" />
        </button>
        <button
          className="btn btn-ghost btn-xs text-error"
          onClick={(e) => { e.stopPropagation(); onDelete(); }}
          title="Delete"
        >
          <Trash className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

/* ── Table View ───────────────────────────────────────────── */

function CharacterTable({
  characters,
  onClick,
  onDelete,
  onExport,
}: {
  characters: Character[];
  onClick: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
}) {
  const [sortKey, setSortKey] = useState<string>('name');
  const [sortAsc, setSortAsc] = useState(true);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(key);
      setSortAsc(true);
    }
  }

  function renderSortIcon(key: string) {
    return <SortIcon active={sortKey === key} ascending={sortAsc} />;
  }

  const sorted = [...characters].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'name': cmp = a.name.localeCompare(b.name); break;
      case 'class': cmp = a.class.localeCompare(b.class); break;
      case 'race': cmp = a.race.localeCompare(b.race); break;
      case 'level': cmp = a.level - b.level; break;
      case 'ac': cmp = a.armorClass - b.armorClass; break;
      case 'hp': cmp = a.hitPointsCurrent - b.hitPointsCurrent; break;
      case 'speed': cmp = a.speed - b.speed; break;
    }
    return sortAsc ? cmp : -cmp;
  });

  const cols: { key: string; label: string; width?: string }[] = [
    { key: 'name', label: 'Name' },
    { key: 'class', label: 'Class' },
    { key: 'race', label: 'Race' },
    { key: 'level', label: 'Lvl', width: '60px' },
    { key: 'ac', label: 'AC', width: '60px' },
    { key: 'hp', label: 'HP', width: '90px' },
    { key: 'speed', label: 'Speed', width: '70px' },
  ];

  return (
    <div className="overflow-x-auto bg-base-200 rounded-lg border border-base-300">
      <table className="table table-sm">
        <thead>
          <tr>
            {cols.map((col) => (
              <th
                key={col.key}
                className="cursor-pointer select-none whitespace-nowrap"
                style={col.width ? { width: col.width } : undefined}
                onClick={() => handleSort(col.key)}
              >
                {col.label}{renderSortIcon(col.key)}
              </th>
            ))}
            <th style={{ width: '80px' }}></th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((char) => (
            <tr
              key={char.id}
              className="hover cursor-pointer"
              onClick={() => onClick(char.id)}
            >
              <td className="font-semibold">{char.name}</td>
              <td>{char.class}</td>
              <td>{char.race}</td>
              <td>{char.level}</td>
              <td>{char.armorClass}</td>
              <td>{char.hitPointsCurrent}/{char.hitPointsMax}</td>
              <td>{char.speed} ft</td>
              <td>
                <div className="flex gap-1">
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={(e) => { e.stopPropagation(); onExport(char.id); }}
                    title="Export"
                  >
                    <Download className="w-3 h-3" />
                  </button>
                  <button
                    className="btn btn-ghost btn-xs text-error"
                    onClick={(e) => { e.stopPropagation(); onDelete(char.id); }}
                    title="Delete"
                  >
                    <Trash className="w-3 h-3" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export const Route = createFileRoute('/')({
  component: HomeComponent,
});
