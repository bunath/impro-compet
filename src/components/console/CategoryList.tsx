import { Card, Button } from '@/components/ui';
import type { Category } from '@/lib/types';
import { useMatchStore } from '@/store/matchStore';

export function CategoryList({ categories, allowNone }: { categories: Category[]; allowNone: boolean }) {
  const current = useMatchStore((s) => s.live.category);
  const select = useMatchStore((s) => s.selectCategory);
  return (
    <Card title="Catégories" className="min-h-0 flex-1 overflow-y-auto">
      <div className="flex flex-col gap-1.5">
        {allowNone && (
          <Button active={current === null} onClick={() => select(null)} className="justify-start">
            Pas de catégorie
          </Button>
        )}
        {categories.map((c) => (
          <Button key={c.id} active={current === c.name} onClick={() => select(c.name)} className="justify-start">
            {c.name}
          </Button>
        ))}
      </div>
    </Card>
  );
}
