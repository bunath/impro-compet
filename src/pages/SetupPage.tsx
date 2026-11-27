import { ArrowLeft, Play, Save } from 'lucide-react';
import { useState } from 'react';
import { BASE_PACK } from '@/lib/basePack';
import { uid } from '@/lib/id';
import type { Category, MatchConfig, MessagePreset, TimePreset } from '@/lib/types';
import { Button, Card, EditableList, Field, ServerBanner, Toggle } from '@/components/ui';
import { saveConfig } from '@/services/configs';
import { useAppStore } from '@/store/appStore';
import { useLibraryStore } from '@/store/libraryStore';
import { useMatchStore } from '@/store/matchStore';

const SAVE_LABELS = {
  local: 'Enregistré en local',
  server: 'Enregistré sur le serveur',
  queued: 'Enregistré en local — envoi au serveur à sa réouverture',
};

export function SetupPage() {
  const config = useLibraryStore((s) => s.config);
  const pack = useLibraryStore((s) => s.pack) ?? BASE_PACK;
  const patch = useLibraryStore((s) => s.patchConfig);
  const [status, setStatus] = useState<string | null>(null);

  const packSelected = (c: Category) => config.categories.some((x) => x.id === c.id);
  const togglePackCategory = (c: Category) =>
    patch({
      categories: packSelected(c)
        ? config.categories.filter((x) => x.id !== c.id)
        : [...config.categories, c],
    });

  const custom = config.categories.filter((c) => c.origin === 'custom');
  const setCustom = (next: Category[]) =>
    patch({ categories: [...config.categories.filter((c) => c.origin === 'pack'), ...next] });
  const setTeam = (i: 0 | 1, p: Partial<MatchConfig['teams'][0]>) =>
    patch({
      teams: config.teams.map((t, k) => (k === i ? { ...t, ...p } : t)) as MatchConfig['teams'],
    });

  const save = async () => setStatus(SAVE_LABELS[await saveConfig()]);
  const launch = async () => {
    await saveConfig();
    useMatchStore.getState().loadConfig(useLibraryStore.getState().config);
    useAppStore.getState().go('console');
  };

  return (
    <div className="mx-auto flex h-full max-w-5xl flex-col gap-4 overflow-y-auto p-6">
      <header className="flex items-center justify-between">
        <h1 className="font-display text-5xl uppercase tracking-widest">Préparation du match</h1>
        <ServerBanner />
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Équipes">
          <div className="space-y-3">
            <Field label="Nom du match" value={config.name} onChange={(name) => patch({ name })} />
            {([0, 1] as const).map((i) => (
              <div key={config.teams[i].id} className="flex items-end gap-2">
                <div className="flex-1">
                  <Field
                    label={`Équipe ${i + 1}`}
                    value={config.teams[i].name}
                    onChange={(name) => setTeam(i, { name })}
                  />
                </div>
                <input
                  type="color"
                  aria-label="Couleur"
                  value={config.teams[i].color}
                  onChange={(e) => setTeam(i, { color: e.target.value })}
                  className="h-10 w-12 rounded-xl border border-line bg-panel-2"
                />
              </div>
            ))}
          </div>
        </Card>

        <Card
          title="Catégories"
          action={
            <Toggle
              label="« Pas de catégorie »"
              checked={config.allowNoCategory}
              onChange={(allowNoCategory) => patch({ allowNoCategory })}
            />
          }
        >
          <div className="mb-3 flex flex-wrap gap-2">
            {pack.categories.map((c) => (
              <Button
                key={c.id}
                size="sm"
                active={packSelected(c)}
                onClick={() => togglePackCategory(c)}
              >
                {c.name}
              </Button>
            ))}
          </div>
          <EditableList<Category>
            items={custom}
            onChange={setCustom}
            makeItem={() => ({ id: uid(), name: '', origin: 'custom' })}
            addLabel="Créer une catégorie"
            renderRow={(c, up) => (
              <Field label="Catégorie perso" value={c.name} onChange={(name) => up({ name })} />
            )}
          />
        </Card>

        <Card title="Pré-réglages de temps">
          <EditableList<TimePreset>
            items={config.timePresets}
            onChange={(timePresets) => patch({ timePresets })}
            makeItem={() => ({ id: uid(), label: '1:00', seconds: 60 })}
            addLabel="Ajouter un temps"
            renderRow={(p, up) => (
              <div className="flex gap-2">
                <Field label="Nom" value={p.label} onChange={(label) => up({ label })} />
                <Field
                  label="Secondes"
                  type="number"
                  min={1}
                  value={p.seconds}
                  onChange={(v) => up({ seconds: Math.max(1, Number(v)) })}
                />
              </div>
            )}
          />
          <div className="mt-4 max-w-[160px]">
            <Field
              label="Mi-temps (minutes)"
              type="number"
              min={1}
              value={Math.round(config.halftimeSeconds / 60)}
              onChange={(v) => patch({ halftimeSeconds: Math.max(1, Number(v)) * 60 })}
            />
          </div>
        </Card>

        <Card title="Messages spéciaux">
          <EditableList<MessagePreset>
            items={config.messagePresets}
            onChange={(messagePresets) => patch({ messagePresets })}
            makeItem={() => ({ id: uid(), text: '', seconds: 8 })}
            addLabel="Ajouter un message"
            renderRow={(m, up) => (
              <div className="flex gap-2">
                <div className="flex-1">
                  <Field label="Texte" value={m.text} onChange={(text) => up({ text })} />
                </div>
                <div className="w-24">
                  <Field
                    label="Durée (s)"
                    type="number"
                    min={1}
                    value={m.seconds}
                    onChange={(v) => up({ seconds: Math.max(1, Number(v)) })}
                  />
                </div>
              </div>
            )}
          />
        </Card>
      </div>

      <footer className="sticky bottom-0 flex items-center gap-3 rounded-2xl border border-line bg-panel/95 p-3 backdrop-blur">
        <Button icon={<ArrowLeft size={16} />} onClick={() => useAppStore.getState().go('welcome')}>
          Retour
        </Button>
        <Button icon={<Save size={16} />} onClick={() => void save()}>
          Enregistrer
        </Button>
        <span className="text-sm text-ok">{status}</span>
        <Button
          variant="primary"
          size="lg"
          className="ml-auto"
          icon={<Play size={18} />}
          onClick={() => void launch()}
        >
          Lancer le match
        </Button>
      </footer>
    </div>
  );
}
