import React, { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useCharacterStore, useUIStore } from '../../stores/RootStore';
import { searchItems } from '../../services/referenceData';
import { generateId } from '../../utils/characterUtils';
import type { ItemEntry } from '../../types/dnd-data';
import { ItemDetail } from './ItemDetail';
import { ItemTable } from './ItemTable';

export const ItemSearchModal = observer(function ItemSearchModal() {
  const uiStore = useUIStore();
  const characterStore = useCharacterStore();
  const char = characterStore.activeCharacter;
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [selectedItem, setSelectedItem] = useState<ItemEntry | null>(null);

  const results = useMemo(() => {
    return searchItems(query, typeFilter || undefined).slice(0, 100);
  }, [query, typeFilter]);

  if (uiStore.activeModal !== 'itemSearch') return null;

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
    setSelectedItem(null);
  }

  const equipmentNames = new Set(char?.equipment.map((e) => e.name.toLowerCase()) ?? []);

  return (
    <dialog className="modal modal-open">
      <div className="modal-box max-w-5xl h-[70vh] flex flex-col">
        <h3 className="font-bold text-lg mb-3 shrink-0">Search Items</h3>

        <div className="flex gap-2 mb-3 shrink-0">
          <input
            type="text"
            value={query}
            onChange={(e) => { setQuery(e.target.value); setSelectedItem(null); }}
            className="input input-bordered flex-1"
            placeholder="Search items by name..."
            autoFocus
          />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="select select-bordered"
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

        <div className="flex-1 min-h-0 overflow-y-auto">
          {selectedItem ? (
            <div className="space-y-3">
              <button className="btn btn-ghost btn-xs" onClick={() => setSelectedItem(null)}>
                &larr; Back to results
              </button>
              <h4 className="font-bold text-lg">{selectedItem.name}</h4>
              <ItemDetail item={selectedItem} />
              {equipmentNames.has(selectedItem.name.toLowerCase()) ? (
                <span className="badge badge-success">Already Added</span>
              ) : (
                <button
                  className="btn btn-primary btn-sm"
                  disabled={!char}
                  onClick={() => { addItem(selectedItem); close(); }}
                >
                  Add to Equipment
                </button>
              )}
              {!char && (
                <p className="text-xs text-base-content/50">Select a character to add items.</p>
              )}
            </div>
          ) : (
            <div>
              {results.length === 0 ? (
                <p className="text-sm text-base-content/50">No items found.</p>
              ) : (
                <ItemTable
                  items={results}
                  visibleColumns={uiStore.itemColumns}
                  onToggleColumn={(key) => uiStore.toggleItemColumn(key)}
                  onClickItem={setSelectedItem}
                  compact
                  renderActions={(item) => {
                    const added = equipmentNames.has(item.name.toLowerCase());
                    return added ? (
                      <span className="badge badge-xs badge-success">Added</span>
                    ) : (
                      <button
                        className="btn btn-primary btn-xs"
                        disabled={!char}
                        onClick={() => addItem(item)}
                      >
                        Add
                      </button>
                    );
                  }}
                />
              )}
            </div>
          )}
        </div>

        <div className="modal-action shrink-0">
          <button className="btn" onClick={close}>Close</button>
        </div>
      </div>
      <div className="modal-backdrop" onClick={close} />
    </dialog>
  );
});
