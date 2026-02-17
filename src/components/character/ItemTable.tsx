import React, { useState, useMemo, useCallback, useRef } from 'react';
import type { ItemEntry } from '../../types/dnd-data';
import { SortIcon } from '../shared/SortIcon';

export interface ItemColumnDef {
  key: string;
  label: string;
  shortLabel: string;
  defaultWidth: number;
  getValue: (item: ItemEntry) => string;
  defaultVisible: boolean;
}

export const ALL_ITEM_COLUMNS: ItemColumnDef[] = [
  { key: 'itemType', label: 'Item Type', shortLabel: 'Type', defaultWidth: 110, defaultVisible: true,
    getValue: (i) => (i.properties['Item Type'] as string) ?? '—' },
  { key: 'rarity', label: 'Rarity', shortLabel: 'Rarity', defaultWidth: 100, defaultVisible: true,
    getValue: (i) => (i.properties['Item Rarity'] as string) ?? '—' },
  { key: 'attunement', label: 'Attunement', shortLabel: 'Attune', defaultWidth: 80, defaultVisible: true,
    getValue: (i) => (i.properties['Requires Attunement'] as string) ? 'Yes' : 'No' },
  { key: 'source', label: 'Source', shortLabel: 'Source', defaultWidth: 120, defaultVisible: true,
    getValue: (i) => i.book },
];

export const DEFAULT_VISIBLE_ITEM_COLUMNS = ALL_ITEM_COLUMNS
  .filter((c) => c.defaultVisible)
  .map((c) => c.key);

type SortDir = 'asc' | 'desc';

interface ItemTableProps {
  items: ItemEntry[];
  visibleColumns: string[];
  onToggleColumn: (key: string) => void;
  onClickItem: (item: ItemEntry) => void;
  renderActions?: (item: ItemEntry) => React.ReactNode;
  compact?: boolean;
}

export function ItemTable({
  items,
  visibleColumns,
  onToggleColumn,
  onClickItem,
  renderActions,
  compact,
}: ItemTableProps) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>(() => {
    const widths: Record<string, number> = { _name: 180 };
    ALL_ITEM_COLUMNS.forEach((c) => { widths[c.key] = c.defaultWidth; });
    return widths;
  });

  const resizingRef = useRef<{ key: string; startX: number; startWidth: number } | null>(null);

  const columns = useMemo(
    () => ALL_ITEM_COLUMNS.filter((c) => visibleColumns.includes(c.key)),
    [visibleColumns]
  );

  const sorted = useMemo(() => {
    if (!sortKey) return items;
    const col = ALL_ITEM_COLUMNS.find((c) => c.key === sortKey);
    if (!col) return items;
    return [...items].sort((a, b) => {
      const av = col.getValue(a);
      const bv = col.getValue(b);
      const cmp = String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }, [items, sortKey, sortDir]);

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
            {ALL_ITEM_COLUMNS.map((col) => (
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
            {sorted.map((item, i) => (
              <tr
                key={i}
                className="cursor-pointer transition-colors hover:bg-base-300/50 h-12"
                title="Click for full description"
                onClick={() => onClickItem(item)}
              >
                <td className="font-medium overflow-hidden">
                  <span className="line-clamp-2">{item.name}</span>
                </td>
                {columns.map((col) => (
                  <td key={col.key} className="text-xs overflow-hidden truncate">
                    {col.getValue(item)}
                  </td>
                ))}
                {renderActions && (
                  <td onClick={(e) => e.stopPropagation()}>
                    {renderActions(item)}
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
