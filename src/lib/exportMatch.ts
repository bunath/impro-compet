import type { LiveState, MatchConfig, MatchExport } from './types';

export function buildExport(config: MatchConfig, live: LiveState): MatchExport {
  return { version: 1, exportedAt: new Date().toISOString(), config, live };
}

export function parseExport(text: string): MatchExport {
  const data = JSON.parse(text) as Partial<MatchExport>;
  if (data.version !== 1 || !data.config?.teams || !data.live) {
    throw new Error('Fichier invalide : ce n’est pas un export de match.');
  }
  return data as MatchExport;
}

export const exportFileName = (config: MatchConfig): string => {
  const [a, b] = config.teams;
  const slug = `${a.name}-vs-${b.name}`.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return `match-${slug || 'impro'}-${new Date().toISOString().slice(0, 10)}.json`;
};
