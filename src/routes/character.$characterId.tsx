import React from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { observer } from 'mobx-react-lite';
import { useCharacterStore } from '../stores/RootStore';
import { CharacterSheet } from '../components/character/CharacterSheet';

const CharacterSheetPage = observer(function CharacterSheetPage() {
  const { characterId } = Route.useParams();
  const characterStore = useCharacterStore();
  const character = characterStore.getCharacterById(characterId);

  React.useEffect(() => {
    if (character) {
      characterStore.setActiveCharacter(characterId);
    }
    return () => characterStore.setActiveCharacter(null);
  }, [characterId, character, characterStore]);

  if (!character) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold mb-4">Character Not Found</h1>
        <p className="mb-4 text-base-content/60">This character doesn't exist or was deleted.</p>
        <Link to="/" className="btn btn-primary">Back to Characters</Link>
      </div>
    );
  }

  return <CharacterSheet />;
});

export const Route = createFileRoute('/character/$characterId')({
  component: CharacterSheetPage,
});
