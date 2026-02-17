import React, { createContext, useContext } from 'react';
import { CharacterStore } from './CharacterStore';
import { ReferenceDataStore } from './ReferenceDataStore';
import { UIStore } from './UIStore';

export class RootStore {
  characterStore: CharacterStore;
  referenceDataStore: ReferenceDataStore;
  uiStore: UIStore;

  constructor() {
    this.characterStore = new CharacterStore();
    this.referenceDataStore = new ReferenceDataStore();
    this.uiStore = new UIStore();
  }
}

const rootStore = new RootStore();
const RootStoreContext = createContext<RootStore>(rootStore);

export function RootStoreProvider({ children }: { children: React.ReactNode }) {
  return React.createElement(RootStoreContext.Provider, { value: rootStore }, children);
}

export function useRootStore(): RootStore {
  return useContext(RootStoreContext);
}

export function useCharacterStore(): CharacterStore {
  return useContext(RootStoreContext).characterStore;
}

export function useReferenceDataStore(): ReferenceDataStore {
  return useContext(RootStoreContext).referenceDataStore;
}

export function useUIStore(): UIStore {
  return useContext(RootStoreContext).uiStore;
}
