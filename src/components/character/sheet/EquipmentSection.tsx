import { useState, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { useCharacterStore, useUIStore } from '../../../stores/RootStore';
import { generateId } from '../../../utils/characterUtils';
import { getItemByName } from '../../../services/referenceData';
import type { EquipmentItem, Currency } from '../../../types/character';
import { SectionCard } from '../../shared/SectionCard';
import { ItemSearchModal } from '../ItemSearchModal';
import { ItemDetail } from '../ItemDetail';
import { XLg, CircleFill, Crosshair2, PencilFill } from 'react-bootstrap-icons';
import { SortIcon } from '../../shared/SortIcon';
import { NumericInput } from '../../shared/NumericInput';

const COINS: { key: keyof Currency; label: string; color: string }[] = [
  { key: 'cp', label: 'CP', color: 'text-orange-600' },
  { key: 'sp', label: 'SP', color: 'text-gray-400' },
  { key: 'ep', label: 'EP', color: 'text-blue-300' },
  { key: 'gp', label: 'GP', color: 'text-yellow-400' },
  { key: 'pp', label: 'PP', color: 'text-cyan-200' },
];

export const EquipmentSection = observer(function EquipmentSection() {
  const characterStore = useCharacterStore();
  const uiStore = useUIStore();
  const char = characterStore.activeCharacter!;
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [equipFilter, setEquipFilter] = useState('');
  const [equipSortKey, setEquipSortKey] = useState<'name' | 'quantity' | 'weight' | null>(null);
  const [equipSortAsc, setEquipSortAsc] = useState(true);

  function addItem() {
    const newItem: EquipmentItem = {
      id: generateId(),
      name: '',
      quantity: 1,
    };
    characterStore.updateActiveCharacter({
      equipment: [...char.equipment, newItem],
    });
  }

  function updateItem(id: string, field: keyof EquipmentItem, value: string | number | boolean) {
    characterStore.updateActiveCharacter({
      equipment: char.equipment.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      ),
    });
  }

  function removeItem(id: string) {
    characterStore.updateActiveCharacter({
      equipment: char.equipment.filter((item) => item.id !== id),
    });
    if (expandedItem === id) setExpandedItem(null);
  }

  function updateCurrency(key: keyof Currency, value: number) {
    characterStore.updateActiveCharacter({
      currency: { ...char.currency, [key]: value },
    });
  }

  function toggleExpand(id: string) {
    setExpandedItem(expandedItem === id ? null : id);
  }

  function handleEquipSort(key: 'name' | 'quantity' | 'weight') {
    if (equipSortKey === key) {
      setEquipSortAsc(!equipSortAsc);
    } else {
      setEquipSortKey(key);
      setEquipSortAsc(true);
    }
  }

  function renderEquipSortIcon(key: string) {
    return <SortIcon active={equipSortKey === key} ascending={equipSortAsc} />;
  }

  const totalGp = useMemo(() =>
    char.currency.cp * 0.01 +
    char.currency.sp * 0.1 +
    char.currency.ep * 0.5 +
    char.currency.gp +
    char.currency.pp * 10,
  [char.currency]);

  const filteredEquipment = useMemo(() => {
    let items = char.equipment;
    if (equipFilter) {
      const q = equipFilter.toLowerCase();
      items = items.filter((i) => i.name.toLowerCase().includes(q));
    }
    if (equipSortKey) {
      items = [...items].sort((a, b) => {
        let cmp = 0;
        switch (equipSortKey) {
          case 'name': cmp = a.name.localeCompare(b.name); break;
          case 'quantity': cmp = a.quantity - b.quantity; break;
          case 'weight': cmp = (a.weight ?? 0) - (b.weight ?? 0); break;
        }
        return equipSortAsc ? cmp : -cmp;
      });
    }
    return items;
  }, [char.equipment, equipFilter, equipSortKey, equipSortAsc]);

  return (
    <>
      {/* ── Currency card (collapsible) ──────────────────────── */}
      <div className="card bg-base-200 shadow-sm">
        <div className="card-body p-4">
          {/* Header — always visible, click to toggle */}
          <div
            className="flex items-center justify-between cursor-pointer select-none"
            onClick={() => setCurrencyOpen(!currencyOpen)}
          >
            <h3 className="card-title text-xs font-bold uppercase tracking-wider text-primary">
              <span className="mr-1 text-base-content/40">{currencyOpen ? '▾' : '▸'}</span>
              Currency
            </h3>
            <button
              className="btn btn-ghost btn-xs gap-1 text-base-content/50"
              onClick={(e) => { e.stopPropagation(); setCurrencyOpen(!currencyOpen); }}
            >
              <PencilFill className="w-3 h-3" />
              <span>{currencyOpen ? 'Done' : 'Edit'}</span>
            </button>
          </div>

          {/* Collapsed summary */}
          {!currencyOpen && (
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
              {COINS.map(({ key, label, color }) => (
                <span key={key} className="flex items-center gap-1">
                  <CircleFill className={`w-2.5 h-2.5 shrink-0 ${color}`} />
                  <span className="text-[10px] font-semibold uppercase text-base-content/50">{label}</span>
                  <span className="text-sm font-bold">{char.currency[key]}</span>
                </span>
              ))}
              {totalGp > 0 && (
                <span className="flex items-center gap-1 ml-auto">
                  <span className="text-[10px] text-base-content/40">≈</span>
                  <CircleFill className="w-2.5 h-2.5 text-yellow-400 shrink-0" />
                  <span className="text-sm font-bold">
                    {totalGp.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                  </span>
                  <span className="text-[10px] text-base-content/40">gp</span>
                </span>
              )}
            </div>
          )}

          {/* Expanded editor */}
          {currencyOpen && (
            <div className="mt-3 flex flex-wrap gap-2">
              {COINS.map(({ key, label, color }) => (
                <div key={key} className="flex flex-col items-center justify-center p-1.5 bg-base-100 rounded-lg border border-base-300 w-20 group">
                  <div className="flex items-center gap-1.5 mb-1">
                    <CircleFill className={`w-3 h-3 ${color}`} />
                    <span className="text-[10px] font-semibold uppercase text-base-content/60">{label}</span>
                  </div>
                  <div className="flex items-stretch rounded border border-transparent group-hover:border-base-300 overflow-hidden transition-colors">
                    <button
                      className="px-1 py-0.5 bg-base-300 hover:bg-base-content/20 text-xs font-bold leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => updateCurrency(key, Math.max(0, char.currency[key] - 1))}
                    >
                      −
                    </button>
                    <NumericInput
                      value={char.currency[key]}
                      onCommit={(v) => updateCurrency(key, v ?? 0)}
                      min={0}
                      className="w-8 text-center text-sm font-semibold bg-base-100 border-x border-transparent group-hover:border-base-300 focus:outline-none py-0.5"
                    />
                    <button
                      className="px-1 py-0.5 bg-base-300 hover:bg-base-content/20 text-xs font-bold leading-none opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => updateCurrency(key, char.currency[key] + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
              ))}
              {totalGp > 0 && (
                <div className="flex flex-col items-center justify-center p-2 bg-base-100 rounded-lg border border-base-300 min-w-20">
                  <span className="text-[10px] font-semibold uppercase text-base-content/60 mb-1">Total</span>
                  <div className="flex items-center gap-1">
                    <CircleFill className="w-3 h-3 text-yellow-400" />
                    <span className="font-bold text-sm">
                      {totalGp.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <span className="text-[10px] text-base-content/40">gp equiv.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Equipment table ──────────────────────────────────── */}
      <SectionCard
        title="Equipment"
        action={
          <div className="flex gap-2">
            <button className="btn btn-primary btn-xs" onClick={addItem}>
              + Add
            </button>
            <button className="btn btn-secondary btn-xs" onClick={() => uiStore.openModal('itemSearch')}>
              Search Items
            </button>
          </div>
        }
      >
        {char.equipment.length === 0 ? (
          <p className="text-sm text-base-content/50">No equipment added yet.</p>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <input
                type="text"
                value={equipFilter}
                onChange={(e) => setEquipFilter(e.target.value)}
                placeholder="Filter equipment..."
                className="input input-bordered input-xs flex-1 sm:flex-none sm:w-48"
              />
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-base-content/40 ml-auto">
                <button className="hover:text-base-content/70 transition-colors" onClick={() => handleEquipSort('name')}>
                  Name{renderEquipSortIcon('name')}
                </button>
                <span>/</span>
                <button className="hover:text-base-content/70 transition-colors" onClick={() => handleEquipSort('quantity')}>
                  Qty{renderEquipSortIcon('quantity')}
                </button>
                <span>/</span>
                <button className="hover:text-base-content/70 transition-colors" onClick={() => handleEquipSort('weight')}>
                  Wt{renderEquipSortIcon('weight')}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              {filteredEquipment.map((item) => {
                const refItem = item.fromReference ? getItemByName(item.name) : null;
                const isExpanded = expandedItem === item.id;
                return (
                  <div key={item.id}>
                    <div
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-base-300 bg-base-100 shadow-sm cursor-pointer transition-colors hover:border-primary/30"
                      onClick={(e) => {
                        if ((e.target as HTMLElement).closest('input, button, select, textarea')) return;
                        toggleExpand(item.id);
                      }}
                    >
                      <span className="text-xs w-3 shrink-0 text-base-content/50">
                        {isExpanded ? '▾' : '▸'}
                      </span>

                      {/* Collapsed: read-only */}
                      {!isExpanded && (
                        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
                          <span className="text-sm font-medium truncate">{item.name || '—'}</span>
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-base-content/40">Qty</span>
                            <span className="font-semibold text-base-content/70">{item.quantity}</span>
                            {item.weight ? (
                              <>
                                <span className="text-base-content/30">•</span>
                                <span className="text-base-content/40">Wt</span>
                                <span className="font-semibold text-base-content/70">{item.weight} lb</span>
                              </>
                            ) : null}
                          </div>
                        </div>
                      )}

                      {/* Expanded: editable inputs */}
                      {isExpanded && (
                        <div className="flex-1 min-w-0 flex flex-col gap-1">
                          {item.fromReference ? (
                            <span className="text-sm font-medium truncate">{item.name}</span>
                          ) : (
                            <input
                              type="text"
                              value={item.name}
                              onChange={(e) => updateItem(item.id, 'name', e.target.value)}
                              className="input input-bordered input-xs w-full min-w-0"
                              placeholder="Item name"
                            />
                          )}
                          <div className="flex items-end gap-3">
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[10px] font-semibold uppercase text-base-content/40">Qty</span>
                              <NumericInput
                                value={item.quantity}
                                onCommit={(v) => updateItem(item.id, 'quantity', v ?? 0)}
                                min={0}
                                className="input input-bordered input-xs w-14 text-center"
                              />
                            </div>
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="text-[10px] font-semibold uppercase text-base-content/40">Wt (lb)</span>
                              <NumericInput
                                value={item.weight ?? null}
                                onCommit={(v) => updateItem(item.id, 'weight', v ?? 0)}
                                integer={false}
                                min={0}
                                className="input input-bordered input-xs w-16 text-center"
                                placeholder="—"
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex items-center gap-0.5 shrink-0">
                        <button
                          className="btn btn-ghost btn-xs text-info tooltip tooltip-left"
                          data-tip="Add to attacks"
                          onClick={() => characterStore.addAttackFromItem(item.name, item.id)}
                        >
                          <Crosshair2 />
                        </button>
                        <button
                          className="btn btn-ghost btn-xs text-error"
                          onClick={() => removeItem(item.id)}
                        >
                          <XLg />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="mx-1 mb-1 p-3 bg-base-100 rounded-lg border border-base-300">
                        {refItem ? (
                          <ItemDetail item={refItem} />
                        ) : (
                          <div className="space-y-3">
                            <div className="flex flex-wrap gap-3">
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-semibold uppercase text-base-content/40">Type</span>
                                <input
                                  type="text"
                                  value={item.itemType ?? ''}
                                  onChange={(e) => updateItem(item.id, 'itemType', e.target.value)}
                                  className="input input-bordered input-xs w-32"
                                  placeholder="e.g. Weapon, Armor"
                                />
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-semibold uppercase text-base-content/40">Rarity</span>
                                <select
                                  value={item.rarity ?? ''}
                                  onChange={(e) => updateItem(item.id, 'rarity', e.target.value)}
                                  className="select select-bordered select-xs"
                                >
                                  <option value="">—</option>
                                  <option>Common</option>
                                  <option>Uncommon</option>
                                  <option>Rare</option>
                                  <option>Very Rare</option>
                                  <option>Legendary</option>
                                  <option>Artifact</option>
                                </select>
                              </div>
                              <div className="flex flex-col gap-0.5">
                                <span className="text-[10px] font-semibold uppercase text-base-content/40">Value</span>
                                <input
                                  type="text"
                                  value={item.value ?? ''}
                                  onChange={(e) => updateItem(item.id, 'value', e.target.value)}
                                  className="input input-bordered input-xs w-24"
                                  placeholder="e.g. 50 gp"
                                />
                              </div>
                              <label className="flex items-end gap-1.5 pb-0.5 cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={item.requiresAttunement ?? false}
                                  onChange={(e) => updateItem(item.id, 'requiresAttunement', e.target.checked)}
                                  className="checkbox checkbox-xs"
                                />
                                <span className="text-xs">Requires Attunement</span>
                              </label>
                            </div>
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[10px] font-semibold uppercase text-base-content/40">Description</span>
                              <textarea
                                value={item.description ?? ''}
                                onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                                className="textarea textarea-bordered textarea-xs w-full min-h-16"
                                placeholder="Item description, properties, effects..."
                                rows={3}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </SectionCard>

      <ItemSearchModal />
    </>
  );
});
