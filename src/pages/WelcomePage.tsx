import { FilePlus2, FolderOpen, LogIn, Package, PackageSearch } from 'lucide-react';
import { useState } from 'react';
import { ServerBanner, Tile } from '@/components/ui';
import { BASE_PACK, blankConfig, configFromPack } from '@/lib/basePack';
import { parseExport } from '@/lib/exportMatch';
import { openJsonFile } from '@/services/files';
import { useAppStore } from '@/store/appStore';
import { useLibraryStore } from '@/store/libraryStore';

export function WelcomePage() {
  const go = useAppStore((s) => s.go);
  const user = useAppStore((s) => s.user);
  const [error, setError] = useState<string | null>(null);

  const start = (config = blankConfig()) => {
    useLibraryStore.getState().setConfig(config);
    go('setup');
  };

  const importLocal = async () => {
    try {
      const text = await openJsonFile();
      if (text) start(parseExport(text).config);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col justify-center gap-6 p-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Bienvenue</h1>
        <p className="text-muted">
          {user ? `Connecté en tant que ${user.username}` : 'Choisis comment démarrer ton match.'}
        </p>
      </header>
      <div className="grid grid-cols-2 gap-2.5">
        <Tile icon={<FilePlus2 />} title="Base vierge" hint="Tout configurer à la main" onClick={() => start()} />
        <Tile
          icon={<Package />}
          title="Données de base"
          hint="Pack de ressources téléchargé"
          onClick={() => start(configFromPack(useLibraryStore.getState().pack ?? BASE_PACK))}
        />
        <Tile icon={<PackageSearch />} title="Autre pack" hint="Parcourir les packs du serveur" onClick={() => go('packs')} />
        <Tile icon={<FolderOpen />} title="Importer un fichier" hint="Reprendre un export (.json)" onClick={() => void importLocal()} />
        <Tile
          icon={<LogIn />}
          title={user ? 'Changer de compte' : 'Se connecter'}
          hint="Presets et configs sur ton serveur"
          onClick={() => go('auth')}
        />
      </div>
      {error && <p className="text-xs text-danger">{error}</p>}
      <ServerBanner />
    </div>
  );
}
