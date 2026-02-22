import React, { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { observer } from 'mobx-react-lite';
import { useCharacterStore, useUIStore } from '../../stores/RootStore';
import { ALIGNMENTS, CLASSES, RACES } from '../../utils/characterUtils';
import type { NewCharacterDraft } from '../../types/character';
import { NumericInput } from '../shared/NumericInput';

export const NewCharacterModal = observer(function NewCharacterModal() {
  const characterStore = useCharacterStore();
  const uiStore = useUIStore();
  const navigate = useNavigate();

  const [draft, setDraft] = useState<NewCharacterDraft>({
    name: '',
    class: CLASSES[0],
    race: RACES[0],
    background: '',
    alignment: ALIGNMENTS[0],
    level: 1,
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!draft.name.trim()) return;
    const character = characterStore.createCharacter({ ...draft, name: draft.name.trim() });
    uiStore.closeModal();
    navigate({ to: '/character/$characterId', params: { characterId: character.id } });
  }

  if (uiStore.activeModal !== 'newCharacter') return null;

  return (
    <dialog className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Create New Character</h3>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <label className="form-control">
            <span className="label-text mb-1">Name *</span>
            <input
              type="text"
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              className="input input-bordered"
              placeholder="Character name"
              required
              autoFocus
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="form-control">
              <span className="label-text mb-1">Class</span>
              <select
                value={draft.class}
                onChange={(e) => setDraft({ ...draft, class: e.target.value })}
                className="select select-bordered"
              >
                {CLASSES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>

            <label className="form-control">
              <span className="label-text mb-1">Race</span>
              <select
                value={draft.race}
                onChange={(e) => setDraft({ ...draft, race: e.target.value })}
                className="select select-bordered"
              >
                {RACES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="form-control">
              <span className="label-text mb-1">Background</span>
              <input
                type="text"
                value={draft.background}
                onChange={(e) => setDraft({ ...draft, background: e.target.value })}
                className="input input-bordered"
                placeholder="e.g. Acolyte"
              />
            </label>

            <label className="form-control">
              <span className="label-text mb-1">Alignment</span>
              <select
                value={draft.alignment}
                onChange={(e) => setDraft({ ...draft, alignment: e.target.value })}
                className="select select-bordered"
              >
                {ALIGNMENTS.map((a) => <option key={a} value={a}>{a}</option>)}
              </select>
            </label>
          </div>

          <label className="form-control">
            <span className="label-text mb-1">Level</span>
            <NumericInput
              value={draft.level}
              onCommit={(v) => setDraft({ ...draft, level: v ?? 1 })}
              min={1}
              max={20}
              className="input input-bordered w-24"
            />
          </label>

          <div className="modal-action">
            <button type="button" className="btn" onClick={() => uiStore.closeModal()}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={!draft.name.trim()}>
              Create Character
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={() => uiStore.closeModal()} />
    </dialog>
  );
});
