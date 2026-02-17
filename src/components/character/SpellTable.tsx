import React, { useState, useMemo, useCallback, useRef } from 'react';
import type { SpellEntry } from '../../types/dnd-data';
import { SortIcon } from '../shared/SortIcon';

export interface SpellColumnDef {
  key: string;
  label: string;
  shortLabel: string;
  defaultWidth: number;
  getValue: (spell: SpellEntry) => string | number;
  defaultVisible: boolean;
}

export const ALL_SPELL_COLUMNS: SpellColumnDef[] = [
  { key: 'level', label: 'Level', shortLabel: 'Lvl', defaultWidth: 50, defaultVisible: true,
    getValue: (s) => s.properties.Level === 0 ? 'C' : (s.properties.Level as number) ?? '—' },
  { key: 'school', label: 'School', shortLabel: 'School', defaultWidth: 100, defaultVisible: false,
    getValue: (s) => (s.properties.School as string) ?? '—' },
  { key: 'castingTime', label: 'Casting Time', shortLabel: 'Time', defaultWidth: 100, defaultVisible: true,
    getValue: (s) => (s.properties['Casting Time'] as string) ?? '—' },
  { key: 'range', label: 'Range', shortLabel: 'Range', defaultWidth: 90, defaultVisible: true,
    getValue: (s) => (s.properties['data-RangeAoe'] as string) ?? (s.properties.Range as string) ?? '—' },
  { key: 'duration', label: 'Duration', shortLabel: 'Duration', defaultWidth: 100, defaultVisible: true,
    getValue: (s) => (s.properties.Duration as string) ?? '—' },
  { key: 'components', label: 'Components', shortLabel: 'Comp', defaultWidth: 70, defaultVisible: true,
    getValue: (s) => (s.properties.Components as string) ?? '—' },
  { key: 'concentration', label: 'Concentration', shortLabel: 'Conc', defaultWidth: 60, defaultVisible: true,
    getValue: (s) => (s.properties.Concentration === 'Yes' || s.properties['filter-Concentration'] === 'Yes') ? 'Yes' : 'No' },
  { key: 'ritual', label: 'Ritual', shortLabel: 'Ritual', defaultWidth: 60, defaultVisible: true,
    getValue: (s) => (s.properties.Ritual === 'Yes' || s.properties['filter-Ritual'] === 'Yes') ? 'Yes' : 'No' },
  { key: 'damageType', label: 'Damage Type', shortLabel: 'Dmg Type', defaultWidth: 90, defaultVisible: true,
    getValue: (s) => (s.properties['Damage Type'] as string) ?? '—' },
  { key: 'save', label: 'Save', shortLabel: 'Save', defaultWidth: 80, defaultVisible: true,
    getValue: (s) => (s.properties.Save as string) ?? '—' },
  { key: 'classes', label: 'Classes', shortLabel: 'Classes', defaultWidth: 140, defaultVisible: true,
    getValue: (s) => (s.properties.Classes as string) ?? '—' },
  { key: 'source', label: 'Source', shortLabel: 'Source', defaultWidth: 120, defaultVisible: false,
    getValue: (s) => s.book },
];

export const DEFAULT_VISIBLE_COLUMNS = ALL_SPELL_COLUMNS
  .filter((c) => c.defaultVisible)
  .map((c) => c.key);

type SortDir = 'asc' | 'desc';

interface SpellTableProps {
  spells: SpellEntry[];
  visibleColumns: string[];
  onToggleColumn: (key: string) => void;
  onClickSpell: (spell: SpellEntry) => void;
  renderActions?: (spell: SpellEntry) => React.ReactNode;
  compact?: boolean;
}

export function SpellTable({
  spells,
  visibleColumns,
  onToggleColumn,
  onClickSpell,
  renderActions,
  compact,
}: SpellTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const widths: Record<string, number> = { _name: 180 };
    ALL_SPELL_COLUMNS.forEach((c) => { widths[c.key] = c.defaultWidth; });
    return widths;
  });

  const resizingRef = useRef<{ key: string; startX: number; startWidth: number } | null>(null);

  const columns = useMemo(
    () => ALL_SPELL_COLUMNS.filter((c) => visibleColumns.includes(c.key)),
    [visibleColumns]
  );

  const sorted = useMemo(() => {
    if (!sortKey) return spells;
    const col = ALL_SPELL_COLUMNS.find((c) => c.key === sortKey);
    if (!col) return spells;
    return [...spells].sort((a, b) => {
      const av = col.getValue(a);
      const bv = col.getValue(b);
      const cmp = typeof av === 'number' && typeof bv === 'number'
        ? av - bv
        : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [spells, sortKey, sortDir]);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDir('asc');
    }
  }

  function renderSortIcon(key: string) {
    return <SortIcon active={sortKey === key} ascending={sortDir === 'asc'} />;
  }

  const onResizeStart = useCallback((key: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const startX = e.clientX;
    const startWidth = columnWidths[key] ?? 100;
    resizingRef.current = { key, startX, startWidth };

    function onMouseMove(ev: MouseEvent) {
      if (!resizingRef.current) return;
      const delta = ev.clientX - resizingRef.current.startX;
      const newWidth = Math.max(40, resizingRef.current.startWidth + delta);
      setColumnWidths((prev) => ({ ...prev, [resizingRef.current!.key]: newWidth }));
    }

    function onMouseUp() {
      resizingRef.current = null;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    }

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [columnWidths]);

  return (
    <div>
      {/* Column picker */}
      <div className="relative mb-2">
        <button
          className="btn btn-ghost btn-xs"
          onClick={() => setShowColumnPicker(!showColumnPicker)}
        >
          Columns {showColumnPicker ? '▾' : '▸'}
        </button>
        {showColumnPicker && (
          <div className="absolute z-10 mt-1 p-2 bg-base-200 rounded-lg border border-base-300 shadow-lg flex flex-wrap gap-2 max-w-md">
            {ALL_SPELL_COLUMNS.map((col) => (
              <label key={col.key} className="flex items-center gap-1.5 cursor-pointer text-xs">
                <input
                  type="checkbox"
                  checked={visibleColumns.includes(col.key)}
                  onChange={() => onToggleColumn(col.key)}
                  className="checkbox checkbox-xs"
                />
                {col.label}
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="overflow-x-auto">
        <table
          className={`table ${compact ? 'table-xs' : 'table-sm'}`}
          style={{ tableLayout: 'fixed', width: 'max-content', minWidth: '100%' }}
        >
          <thead>
            <tr>
              <th
                className="relative select-none overflow-visible"
                style={{ width: columnWidths._name }}
              >
                Name
                <span
                  className="absolute -right-1 top-0 bottom-0 w-3 cursor-col-resize hover:bg-primary/30 z-10"
                  onMouseDown={(e) => onResizeStart('_name', e)}
                />
              </th>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className="relative select-none whitespace-nowrap overflow-visible"
                  style={{ width: columnWidths[col.key] }}
                >
                  <span
                    className="cursor-pointer"
                    onClick={() => handleSort(col.key)}
                  >
                    {col.shortLabel}{renderSortIcon(col.key)}
                  </span>
                  <span
                    className="absolute -right-1 top-0 bottom-0 w-3 cursor-col-resize hover:bg-primary/30 z-10"
                    onMouseDown={(e) => onResizeStart(col.key, e)}
                  />
                </th>
              ))}
              {renderActions && <th style={{ width: 64 }}></th>}
            </tr>
          </thead>
          <tbody>
            {sorted.map((spell, i) => (
              <tr
                key={i}
                className="cursor-pointer transition-colors hover:bg-base-300/50 h-12"
                title="Click for full description"
                onClick={() => onClickSpell(spell)}
              >
                <td className="font-medium overflow-hidden">
                  <span className="line-clamp-2">{spell.name}</span>
                </td>
                {columns.map((col) => (
                  <td key={col.key} className="text-xs overflow-hidden truncate">
                    {col.getValue(spell)}
                  </td>
                ))}
                {renderActions && (
                  <td onClick={(e) => e.stopPropagation()}>
                    {renderActions(spell)}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
