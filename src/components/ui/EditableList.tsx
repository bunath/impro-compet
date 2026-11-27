import { Plus, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from './Button';

/** Liste éditable générique : lignes rendues par `renderRow`, ajout / suppression intégrés. */
export function EditableList<T extends { id: string }>({
  items,
  onChange,
  renderRow,
  makeItem,
  addLabel,
}: {
  items: T[];
  onChange: (items: T[]) => void;
  renderRow: (item: T, update: (patch: Partial<T>) => void) => ReactNode;
  makeItem: () => T;
  addLabel: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-end gap-2">
          <div className="flex-1">
            {renderRow(item, (patch) =>
              onChange(items.map((i) => (i.id === item.id ? { ...i, ...patch } : i))),
            )}
          </div>
          <Button
            variant="danger"
            size="sm"
            aria-label="Supprimer"
            onClick={() => onChange(items.filter((i) => i.id !== item.id))}
          >
            <Trash2 size={14} />
          </Button>
        </div>
      ))}
      <Button size="sm" icon={<Plus size={14} />} onClick={() => onChange([...items, makeItem()])}>
        {addLabel}
      </Button>
    </div>
  );
}
