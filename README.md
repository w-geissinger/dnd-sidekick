# Wayne's D&D Sidekick

A feature-rich, browser-based character sheet manager for Dungeons & Dragons 5th Edition. No account required — all data lives in your browser.

## Features

### Character Management
- Create and manage multiple D&D 5e characters
- Import and export characters as JSON for backup or sharing
- Full-site backup and restore
- Grid, list, and sortable table views for your character roster

### Character Sheet
- All six ability scores with automatic modifier calculations
- Saving throws and 18 standard skills with proficiency and expertise toggles
- HP tracking with visual indicators, AC, Initiative, Speed, and Hit Dice
- Death save tracking

### Spellcasting
- Search and add spells from a library of 5,000+
- Spell slot tracking for levels 1–9
- Prepared spell toggle and count tracking
- Configurable spell list columns

### Equipment & Inventory
- Custom equipment entries or search from 15,000+ items
- Quantity and weight tracking
- Currency management (CP, SP, EP, GP, PP)
- Configurable table columns

### Character Details
- Personality traits, ideals, bonds, and flaws
- Physical appearance and backstory
- Proficiencies, languages, features, and traits
- Allies, organizations, and notes

### Quality of Life
- 31+ themes including dark, light, dracula, synthwave, fantasy, and more
- Fully offline — no backend or internet required after load
- No login or account needed
- Responsive design

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 19, TypeScript 5.9 |
| Routing | TanStack Router (file-based) |
| State | MobX 6 |
| Styling | Tailwind CSS 4, daisyUI 5 |
| Build | Vite 6 |
| Data | dnd-data (npm), SRD JSON |
| Storage | Browser localStorage |

## Getting Started

**Prerequisites:** Node.js 16+

```bash
# Install dependencies
npm install

# Start development server (http://localhost:3001)
npm run dev

# Type check
npm run typecheck

# Build for production
npm run build

# Preview production build
npm run serve
```

## Project Structure

```
src/
├── routes/           # File-based routes (TanStack Router)
├── stores/           # MobX stores (Character, ReferenceData, UI)
├── components/       # React components
│   ├── character/    # Character sheet and sections
│   ├── landing/      # Home page / character list
│   └── shared/       # Reusable UI components
├── services/         # Spell/item search and lookup
├── types/            # TypeScript type definitions
├── utils/            # D&D calculations and import/export helpers
└── data/srd/         # Static SRD reference data (JSON)
```

## Data & Privacy

All character data is stored locally in your browser's `localStorage`. Nothing is sent to a server. Characters can be exported to JSON at any time for safekeeping.

## License

MIT
