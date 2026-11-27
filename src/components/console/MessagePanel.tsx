import { MessageSquare, X } from 'lucide-react';
import { useState } from 'react';
import { Button, Card, Field } from '@/components/ui';
import type { MessagePreset } from '@/lib/types';
import { useMatchStore } from '@/store/matchStore';

export function MessagePanel({ presets }: { presets: MessagePreset[] }) {
  const [text, setText] = useState('');
  const [seconds, setSeconds] = useState(8);
  const m = useMatchStore();
  const active = useMatchStore((s) => s.live.message !== null);
  return (
    <Card title="Messages spéciaux">
      <div className="flex flex-wrap gap-2 pb-3">
        {presets.map((p) => (
          <Button key={p.id} size="sm" onClick={() => { setText(p.text); setSeconds(p.seconds); }}>
            {p.text}
          </Button>
        ))}
      </div>
      <div className="flex items-end gap-2">
        <div className="flex-1"><Field label="Texte libre" value={text} onChange={setText} placeholder="Message à afficher…" /></div>
        <label className="w-24 text-xs text-muted">
          Durée (s)
          <input type="number" min={1} max={120} value={seconds} onChange={(e) => setSeconds(Math.max(1, Number(e.target.value)))} className="mt-1 h-10 w-full rounded-xl border border-line bg-panel-2 px-3 text-sm text-ink outline-none focus:border-accent" />
        </label>
        <Button variant="primary" disabled={!text.trim()} icon={<MessageSquare size={16} />} onClick={() => m.showMessage(text.trim(), seconds)}>
          Afficher
        </Button>
        {active && <Button variant="danger" aria-label="Masquer" onClick={m.clearMessage}><X size={16} /></Button>}
      </div>
    </Card>
  );
}
