import { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useCharacterStore, useUIStore } from '../../stores/RootStore';
import { searchItems } from '../../services/referenceData';
import { generateId } from '../../utils/characterUtils';
import type { ItemEntry } from '../../types/dnd-data';
import { ItemDetail } from './ItemDetail';
import { ALL_ITEM_COLUMNS } from './ItemTable';

export const ItemSearchModal = observer(function ItemSearchModal() {
  const uiStore = useUIStore();
  const characterStore = useCharacterStore();
  const char = characterStore.activeCharacter;
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showFieldPicker, setShowFieldPicker] = useState(false);

  const results = useMemo(() => {
    return searchItems(query, typeFilter || undefined).slice(0, 100);
  }, [query, typeFilter]);

  if (uiStore.activeModal !== 'itemSearch') return null;

  const equipmentNames = new Set(char?.equipment.map((e) => e.name.toLowerCase()) ?? []);

  const summaryColumns = ALL_ITEM_COLUMNS.filter(
    (c) => uiStore.itemColumns.includes(c.key)
  );

  function addItem(item: ItemEntry) {
    if (!char) return;
    characterStore.updateActiveCharacter({
      equipment: [
        ...char.equipment,
        { id: generateId(), name: item.name, quantity: 1, fromReference: true },
      ],
    });
  }

  function close() {
    uiStore.closeModal();
    setQuery('');
    setTypeFilter('');
    setExpandedId(null);
    setShowFieldPicker(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col justify-end sm:items-center sm:justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-fade-in" onClick={close} />

      {/* Panel — drawer on mobile, centered modal on desktop */}
      <div className="relative w-full sm:max-w-3xl bg-base-100 rounded-t-2xl sm:rounded-2xl max-h-[92vh] sm:max-h-[85vh] flex flex-col shadow-2xl drawer-slide-up">
        {/* Top spacing — mobile only */}
        <div className="sm:hidden pt-3 shrink-0" />

        {/* Header */}
        <div className="px-4 sm:px-6 pt-2 sm:pt-4 pb-2 shrink-0 flex items-center justify-between">
          <h3 className="font-bold text-lg">Search Items</h3>
          <button className="btn btn-ghost btn-sm btn-circle" onClick={close}>✕</button>
        </div>

        {/* Filters */}
        <div className="px-4 sm:px-6 pb-3 shrink-0 space-y-2">
          <div className="flex gap-2 flex-wrap">
            <input
              type="text"
              value={query}
              onChange={(e) => { setQuery(e.target.value); setExpandedId(null); }}
              className="input input-bordered input-sm flex-1 min-w-40"
              placeholder="Search items..."
              autoFocus
            />
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="select select-bordered select-sm"
            >
              <option value="">All Types</option>
              <option value="Weapon">Weapon</option>
              <option value="Armor">Armor</option>
              <option value="Scroll">Scroll</option>
              <option value="Potion">Potion</option>
              <option value="Wondrous Item">Wondrous Item</option>
              <option value="Ring">Ring</option>
              <option value="Staff">Staff</option>
              <option value="Wand">Wand</option>
              <option value="Rod">Rod</option>
            </select>
          </div>
          <div className="flex items-center">
            <button
              className="btn btn-ghost btn-xs gap-1 ml-auto"
              onClick={() => setShowFieldPicker(!showFieldPicker)}
            >
              Summary Fields {showFieldPicker ? '▾' : '▸'}
            </button>
          </div>
          {showFieldPicker && (
            <div className="p-3 bg-base-200 rounded-lg border border-base-300 flex flex-wrap gap-x-5 gap-y-2.5">
              {ALL_ITEM_COLUMNS.map((col) => (
                <label key={col.key} className="flex items-center gap-2 cursor-pointer text-sm">
                  <input
                    type="checkbox"
                    checked={uiStore.itemColumns.includes(col.key)}
                    onChange={() => uiStore.toggleItemColumn(col.key)}
                    className="checkbox checkbox-xs"
                  />
                  {col.label}
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Results */}
        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-6 pb-8 sm:pb-6">
          {results.length === 0 ? (
            <p className="text-sm text-base-content/50 py-8 text-center">No items found.</p>
          ) : (
            <div className="space-y-1.5">
              {results.map((item) => {
                const id = item.name.toLowerCase();
                const isExpanded = expandedId === id;
                const added = equipmentNames.has(id);
                const itemType = item.properties['Item Type'] as string | undefined;
                const rarity = item.properties['Item Rarity'] as string | undefined;
                const attunement = !!(item.properties['Requires Attunement'] as string | undefined);
                return (
                  <div key={id} className="rounded-lg border border-base-300 bg-base-100 shadow-sm overflow-hidden">
                    {/* Collapsed header */}
                    <div
                      className="flex items-center gap-2 px-3 py-2.5 cursor-pointer hover:bg-base-200/50 transition-colors"
                      onClick={() => setExpandedId(isExpanded ? null : id)}
                    >
                      <span className="text-xs w-3 shrink-0 text-base-content/50">
                        {isExpanded ? '▾' : '▸'}
                      </span>
                      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                        <span className="font-medium text-sm truncate">{item.name}</span>
                        {summaryColumns.length > 0 && (
                          <div className="flex items-center gap-x-3 gap-y-0.5 flex-wrap">
                            {summaryColumns.map((col) => {
                              const val = col.getValue(item);
                              if (!val || val === '—' || val === 'No') return null;
                              const isAttune = col.key === 'attunement' && val === 'Yes';
                              return (
                                <span key={col.key} className="text-xs text-base-content/50 truncate">
                                  {isAttune ? 'Requires Attunement' : val}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                      {added ? (
                        <button className="btn btn-success btn-xs w-16 shrink-0" disabled>Added</button>
                      ) : (
                        <button
                          className="btn btn-primary btn-xs w-16 shrink-0"
                          disabled={!char}
                          onClick={(e) => { e.stopPropagation(); addItem(item); }}
                        >
                          Add
                        </button>
                      )}
                    </div>

                    {/* Expanded detail */}
                    {isExpanded && (
                      <div className="px-4 py-3 border-t border-base-300 bg-base-200/30">
                        <ItemDetail item={item} />
                        <button
                          className={`btn btn-sm mt-3 ${added ? 'btn-success' : 'btn-primary'}`}
                          disabled={added || !char}
                          onClick={() => { if (!added) { addItem(item); close(); } }}
                        >
                          {added ? 'Added' : 'Add to Equipment'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
});
