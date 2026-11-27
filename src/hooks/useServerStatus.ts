import { isServerOpen } from '@/lib/serverHours';
import { useLibraryStore } from '@/store/libraryStore';
import { useNow } from './useNow';

export function useServerStatus() {
  useNow(30_000);
  return { open: isServerOpen(), pending: useLibraryStore((s) => s.pending.length) };
}
