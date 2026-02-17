import React from 'react';
import type { ItemEntry } from '../../types/dnd-data';

interface ItemDetailProps {
  item: ItemEntry;
}

export function ItemDetail({ item }: ItemDetailProps) {
  const props = item.properties;
  const requiresAttunement = !!(props['Requires Attunement'] as string | undefined);

  return (
    <div className="space-y-2">
      <div className="flex gap-2 flex-wrap">
        {props['Item Type'] && (
          <span className="badge badge-sm">{props['Item Type'] as string}</span>
        )}
        {props['Item Rarity'] && (
          <span className="badge badge-sm badge-secondary">{props['Item Rarity'] as string}</span>
        )}
        {requiresAttunement && (
          <span className="badge badge-sm badge-warning">Requires Attunement</span>
        )}
      </div>

      {(props['data-description'] || item.description) && (
        <div className="text-sm whitespace-pre-wrap border-t border-base-300 pt-2 mt-2">
          {(props['data-description'] as string) || item.description}
        </div>
      )}

      <p className="text-xs text-base-content/40">{item.book} — {item.publisher}</p>
    </div>
  );
}
