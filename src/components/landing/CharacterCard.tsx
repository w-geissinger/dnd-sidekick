import React from 'react';
import { useNavigate } from '@tanstack/react-router';
import type { Character } from '../../types/character';
import { getProficiencyBonus, formatModifier } from '../../utils/characterUtils';
import { ShieldFill, HeartFill, Lightning, BookFill, Backpack, Download, Trash } from 'react-bootstrap-icons';

interface CharacterCardProps {
  character: Character;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
}

export function CharacterCard({ character, onDelete, onExport }: CharacterCardProps) {
  const navigate = useNavigate();
  const profBonus = getProficiencyBonus(character.level);
  const spellCount = character.spells.length;
  const equipCount = character.equipment.length;
  const hpPercent = character.hitPointsMax > 0
    ? Math.round((character.hitPointsCurrent / character.hitPointsMax) * 100)
    : 0;

  return (
    <div
      className="card bg-base-200 border border-base-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 cursor-pointer group"
      onClick={() => navigate({ to: '/character/$characterId', params: { characterId: character.id } })}
    >
      <div className="card-body p-5 gap-3">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="card-title text-lg leading-tight">{character.name}</h2>
            <p className="text-sm text-base-content/60 mt-0.5">
              Level {character.level} {character.race} {character.class}
            </p>
          </div>
          <span className="badge badge-sm badge-primary font-mono">
            {formatModifier(profBonus)} Prof
          </span>
        </div>

        {/* HP bar */}
        <div>
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="flex items-center gap-1 text-base-content/60">
              <HeartFill className="w-3 h-3 text-error" /> HP
            </span>
            <span className="font-semibold">{character.hitPointsCurrent} / {character.hitPointsMax}</span>
          </div>
          <div className="w-full bg-base-300 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                hpPercent > 50 ? 'bg-success' : hpPercent > 25 ? 'bg-warning' : 'bg-error'
              }`}
              style={{ width: `${Math.min(100, Math.max(0, hpPercent))}%` }}
            />
          </div>
        </div>

        {/* Stats row */}
        <div className="flex flex-wrap gap-1.5">
          <div className="flex items-center gap-1 bg-base-100 rounded px-2 py-1 border border-base-300" title="Armor Class">
            <ShieldFill className="w-3 h-3 text-info" />
            <span className="font-bold text-xs">{character.armorClass}</span>
          </div>
          <div className="flex items-center gap-1 bg-base-100 rounded px-2 py-1 border border-base-300" title="Speed">
            <Lightning className="w-3 h-3 text-warning" />
            <span className="font-bold text-xs">{character.speed} ft</span>
          </div>
          {spellCount > 0 && (
            <div className="flex items-center gap-1 bg-base-100 rounded px-2 py-1 border border-base-300" title="Spells">
              <BookFill className="w-3 h-3 text-secondary" />
              <span className="font-bold text-xs">{spellCount}</span>
            </div>
          )}
          {equipCount > 0 && (
            <div className="flex items-center gap-1 bg-base-100 rounded px-2 py-1 border border-base-300" title="Equipment">
              <Backpack className="w-3 h-3 text-accent" />
              <span className="font-bold text-xs">{equipCount}</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="card-actions justify-end pt-1 border-t border-base-300 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            className="btn btn-ghost btn-xs gap-1"
            onClick={(e) => { e.stopPropagation(); onExport(character.id); }}
          >
            <Download className="w-3 h-3" /> Export
          </button>
          <button
            className="btn btn-ghost btn-xs gap-1 text-error"
            onClick={(e) => { e.stopPropagation(); onDelete(character.id); }}
          >
            <Trash className="w-3 h-3" /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
