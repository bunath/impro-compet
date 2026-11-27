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
      <div className="flex flex-wrap gap-2 pb-2.5">
        {presets.map((p) => (
          <Button key={p.id} size="sm" onClick={() => { setText(p.text); setSeconds(p.seconds); }}>
            {p.text}
          </Button>
        ))}
      </div>
      <div className="flex items-end gap-2">
        <div className="flex-1"><Field label="Texte libre" value={text} onChange={setText} placeholder="Message à afficher…" /></div>
        <label className="w-20 text-[11px] text-muted">
          Durée (s)
          <input type="number" min={1} max={120} value={seconds} onChange={(e) => setSeconds(Math.max(1, Number(e.target.value)))} className="mt-1 h-8 w-full rounded-md border border-line bg-panel-2 px-2.5 text-[13px] text-ink outline-none focus:border-accent" />
        </label>
        <Button variant="primary" size="md" disabled={!text.trim()} icon={<MessageSquare size={16} />} onClick={() => m.showMessage(text.trim(), seconds)}>
          Afficher
        </Button>
        {active && <Button variant="danger" aria-label="Masquer" onClick={m.clearMessage}><X size={16} /></Button>}
      </div>
    </Card>
  );
}
