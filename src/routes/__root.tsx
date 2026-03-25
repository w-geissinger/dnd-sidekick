import React from 'react';
import { Link, Outlet, createRootRoute } from '@tanstack/react-router';
import { TanStackRouterDevtools } from '@tanstack/router-devtools';
import { RootStoreProvider, useCharacterStore, useUIStore } from '../stores/RootStore';
import { CheckLg, GearFill, HouseDoorFill, InfoCircleFill, PaletteFill } from 'react-bootstrap-icons';
import { THEMES } from '../stores/UIStore';
import { observer } from 'mobx-react-lite';
import { downloadJson, pickAndReadJsonFile } from '../utils/importExport';

export const Route = createRootRoute({
  component: RootComponent,
});

const Navbar = observer(function Navbar() {
  const characterStore = useCharacterStore();
  const uiStore = useUIStore();

  async function handleImport() {
    try {
      const json = await pickAndReadJsonFile();
      const { added } = characterStore.importCharacters(json);
      alert(`Imported ${added} character${added !== 1 ? 's' : ''}.`);
    } catch {
      // user cancelled or bad file
    }
  }

  function handleExportAll() {
    const json = characterStore.exportAllCharacters();
    downloadJson(json, 'dnd-sidekick-all-characters.json');
  }

  return (
    <div className="navbar bg-base-300 shadow-sm shrink-0">
      <div className="flex-1 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" className="w-8 h-8 ml-2 shrink-0" aria-hidden="true">
          {/* Shield outline */}
          <path
            d="M32 4 L56 14 V32 C56 48 44 58 32 62 C20 58 8 48 8 32 V14 Z"
            className="fill-primary stroke-primary"
            strokeWidth="2"
          />
          {/* Shield inner */}
          <path
            d="M32 8 L52 16.5 V32 C52 46 42 54.5 32 58 C22 54.5 12 46 12 32 V16.5 Z"
            className="fill-base-100"
          />
          {/* Sword — top-left to bottom-right */}
          <line x1="20" y1="18" x2="44" y2="48" className="stroke-base-content" strokeWidth="2.5" strokeLinecap="round" />
          {/* Sword crossguard */}
          <line x1="24" y1="30" x2="32" y2="24" className="stroke-base-content" strokeWidth="2.5" strokeLinecap="round" />
          {/* Sword pommel */}
          <circle cx="19" cy="17" r="2" className="fill-warning" />
          {/* Wand — top-right to bottom-left */}
          <line x1="44" y1="18" x2="20" y2="48" className="stroke-base-content" strokeWidth="2" strokeLinecap="round" />
          {/* Wand sparkle */}
          <polygon points="44,14 45.5,17.5 49,18 46,20.5 47,24 44,22 41,24 42,20.5 39,18 42.5,17.5" className="fill-warning" />
          {/* D20 center */}
          <polygon
            points="32,24 39,33 36,42 28,42 25,33"
            className="fill-primary stroke-primary-content"
            strokeWidth="1"
          />
          <text x="32" y="37" textAnchor="middle" fontSize="10" fontWeight="bold" className="fill-primary-content">20</text>
        </svg>
        <span className="text-xl font-bold"><span className="hidden sm:inline">Wayne's </span>DnD Sidekick</span>
      </div>
      <div className="flex-none flex items-center gap-1">
        <Link to="/" className="btn btn-ghost btn-sm gap-1.5">
          <HouseDoorFill className="w-4 h-4" /> <span className="hidden sm:inline">Home</span>
        </Link>
        <Link to="/about" className="btn btn-ghost btn-sm gap-1.5">
          <InfoCircleFill className="w-4 h-4" /> <span className="hidden sm:inline">About</span>
        </Link>
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-sm gap-1.5">
            <PaletteFill className="w-4 h-4" /> <span className="hidden sm:inline capitalize">{uiStore.theme}</span>
          </div>
          <div tabIndex={0} className="dropdown-content z-[1] p-2 shadow-lg bg-base-200 rounded-box w-auto min-w-max max-h-80 overflow-y-auto">
            <ul className="menu menu-sm p-0">
              {THEMES.map((t) => (
                <li key={t}>
                  <button
                    className={`flex items-center gap-2 ${uiStore.theme === t ? 'active' : ''}`}
                    onClick={() => uiStore.setTheme(t)}
                  >
                    <CheckLg className={`w-3 h-3 shrink-0 ${uiStore.theme === t ? 'opacity-100' : 'opacity-0'}`} />
                    <span className="capitalize">{t}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="dropdown dropdown-end">
          <div tabIndex={0} role="button" className="btn btn-ghost btn-sm">
            <GearFill className="w-4 h-4" />
          </div>
          <ul tabIndex={0} className="dropdown-content z-[1] menu p-2 shadow-lg bg-base-200 rounded-box w-48">
            <li><button onClick={handleImport}>Import Characters</button></li>
            <li><button onClick={handleExportAll}>Export All</button></li>
          </ul>
        </div>
      </div>
    </div>
  );
});

function RootComponent() {
  return (
    <RootStoreProvider>
      <div className="h-screen flex flex-col bg-base-100 overflow-hidden">
        <Navbar />
        <div className="flex-1 min-h-0 flex flex-col overflow-y-auto">
          <Outlet />
        </div>
      </div>
      <TanStackRouterDevtools position="bottom-right" />
    </RootStoreProvider>
  );
}
