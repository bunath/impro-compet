import { isTauri } from '@/lib/tauri';

const filters = [{ name: 'Match Impro (JSON)', extensions: ['json'] }];

export async function saveJsonFile(defaultName: string, content: string): Promise<boolean> {
  if (!isTauri()) {
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json' }));
    Object.assign(document.createElement('a'), { href: url, download: defaultName }).click();
    URL.revokeObjectURL(url);
    return true;
  }
  const { save } = await import('@tauri-apps/plugin-dialog');
  const { writeTextFile } = await import('@tauri-apps/plugin-fs');
  const path = await save({ defaultPath: defaultName, filters });
  if (!path) return false;
  await writeTextFile(path, content);
  return true;
}

export async function openJsonFile(): Promise<string | null> {
  if (!isTauri()) {
    return new Promise((resolve) => {
      const input = Object.assign(document.createElement('input'), { type: 'file', accept: '.json' });
      input.onchange = async () => resolve((await input.files?.[0]?.text()) ?? null);
      input.click();
    });
  }
  const { open } = await import('@tauri-apps/plugin-dialog');
  const { readTextFile } = await import('@tauri-apps/plugin-fs');
  const path = await open({ multiple: false, filters });
  return typeof path === 'string' ? readTextFile(path) : null;
}
