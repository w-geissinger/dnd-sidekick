import React, { useState } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { ChevronDown, ChevronUp } from 'react-bootstrap-icons';

export const Route = createFileRoute('/about')({
  component: AboutComponent,
});

function AboutComponent() {
  const [showTech, setShowTech] = useState(false);

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <h1 className="text-2xl font-bold mb-4">About Wayne's DnD Sidekick</h1>

      <div className="prose">
        <p>
          Wayne's DnD Sidekick is a digital character sheet manager for D&D 5th Edition.
          It mirrors the official paper character sheet with the convenience of
          automatic calculations and a searchable reference library.
        </p>

        <h2 className="text-lg font-semibold mt-6 mb-2">Features</h2>
        <ul className="list-disc list-inside space-y-1 text-sm">
          <li>Create and manage multiple characters</li>
          <li>Auto-calculated ability modifiers, saving throws, and skill bonuses</li>
          <li>Track combat stats: HP, AC, initiative, speed, death saves</li>
          <li>Manage attacks, equipment, and currency</li>
          <li>Search and add spells from a library of 5,000+ spells</li>
          <li>Search and add items from a library of 15,000+ items</li>
          <li>Expandable detail views for spells and equipment</li>
          <li>Configurable, sortable, and resizable columns in search tables</li>
          <li>Track spell slots with +/&minus; controls and prepared spell counts</li>
          <li>Import and export characters as JSON files</li>
          <li>Full-site backup and restore via Export All / Import</li>
          <li>Multiple character list views: grid, list, and sortable table</li>
          <li>Record backstory, personality, and notes</li>
          <li>All data saved locally in your browser &mdash; no account required</li>
        </ul>

        <h2 className="text-lg font-semibold mt-6 mb-3">D&D Data Sources</h2>
        <div className="flex flex-col gap-2">
          <a
            href="https://github.com/fragro/dnd-data"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-base-200 rounded-lg border border-base-300 hover:bg-base-300/50 transition-colors no-underline"
          >
            <div>
              <span className="font-semibold text-sm">dnd-data</span>
              <p className="text-xs text-base-content/60 mt-0.5">
                Community-compiled dataset with 5,000+ spells, 15,000+ items, and backgrounds
              </p>
            </div>
          </a>
          <a
            href="https://github.com/5e-bits/5e-database"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 p-3 bg-base-200 rounded-lg border border-base-300 hover:bg-base-300/50 transition-colors no-underline"
          >
            <div>
              <span className="font-semibold text-sm">5e-database (SRD)</span>
              <p className="text-xs text-base-content/60 mt-0.5">
                Structured mechanical data for skills, ability scores, and languages from the Systems Reference Document
              </p>
            </div>
          </a>
        </div>

        <div className="mt-6">
          <button
            className="flex items-center gap-1.5 text-sm text-base-content/50 hover:text-base-content/80 transition-colors"
            onClick={() => setShowTech(!showTech)}
          >
            Built with {showTech ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showTech && (
            <div className="mt-2 p-3 bg-base-200 rounded-lg border border-base-300 text-xs text-base-content/60">
              <div className="grid grid-cols-2 gap-x-6 gap-y-1">
                <span>React 19</span>
                <span>UI framework</span>
                <span>TypeScript</span>
                <span>Type safety</span>
                <span>Vite</span>
                <span>Build tool</span>
                <span>TanStack Router</span>
                <span>Client-side routing</span>
                <span>MobX</span>
                <span>State management</span>
                <span>Tailwind CSS</span>
                <span>Styling</span>
                <span>daisyUI</span>
                <span>Component library</span>
                <span>React Bootstrap Icons</span>
                <span>Iconography</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
