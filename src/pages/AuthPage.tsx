import { useState } from 'react';
import { Button, Card, Field, ServerBanner } from '@/components/ui';
import { api } from '@/services/api';
import { flushPending } from '@/services/configs';
import { useAppStore } from '@/store/appStore';

type Mode = 'login' | 'register' | 'forgot';
const TITLES: Record<Mode, string> = {
  login: 'Connectez-vous',
  register: 'Inscription',
  forgot: 'Mot de passe oublié',
};

export function AuthPage() {
  const [mode, setMode] = useState<Mode>('login');
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const serverUrl = useAppStore((s) => s.serverUrl);
  const [busy, setBusy] = useState(false);
  const [info, setInfo] = useState<{ ok: boolean; text: string } | null>(null);
  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    setBusy(true);
    setInfo(null);
    try {
      if (mode === 'login') {
        const { user, token } = await api.login({
          username: form.username,
          password: form.password,
        });
        useAppStore.getState().signIn(user, token);
        void flushPending();
        useAppStore.getState().go('welcome');
        return;
      }
      if (mode === 'register') {
        await api.register(form);
        setInfo({
          ok: true,
          text: 'Compte créé. Clique sur le lien reçu par email pour l’activer.',
        });
      } else {
        await api.forgotPassword({ email: form.email });
        setInfo({
          ok: true,
          text: 'Si ce compte existe, un email de réinitialisation vient d’être envoyé.',
        });
      }
    } catch (e) {
      setInfo({ ok: false, text: e instanceof Error ? e.message : String(e) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="grid h-full place-items-center p-8">
      <div className="w-[360px] space-y-3">
        <Card title={TITLES[mode]}>
          <div className="space-y-3">
            {mode !== 'forgot' && (
              <Field
                label="Nom d’utilisateur"
                value={form.username}
                onChange={set('username')}
                autoComplete="username"
              />
            )}
            {mode !== 'login' && (
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={set('email')}
                autoComplete="email"
              />
            )}
            {mode !== 'forgot' && (
              <Field
                label="Mot de passe"
                type="password"
                value={form.password}
                onChange={set('password')}
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              />
            )}
            {info && (
              <p className={`text-sm ${info.ok ? 'text-ok' : 'text-danger'}`}>{info.text}</p>
            )}
            <Button
              variant="primary"
              className="w-full"
              disabled={busy}
              onClick={() => void submit()}
            >
              {mode === 'login'
                ? 'Se connecter'
                : mode === 'register'
                  ? 'Créer mon compte'
                  : 'Envoyer le lien'}
            </Button>
            <div className="flex justify-between text-sm text-muted">
              {mode === 'login' ? (
                <>
                  <button className="hover:text-ink" onClick={() => setMode('register')}>
                    Créer un compte
                  </button>
                  <button className="hover:text-ink" onClick={() => setMode('forgot')}>
                    Mot de passe oublié ?
                  </button>
                </>
              ) : (
                <button className="hover:text-ink" onClick={() => setMode('login')}>
                  ← Connexion
                </button>
              )}
            </div>
          </div>
        </Card>
        <Field
          label="URL du serveur (Tailscale Funnel)"
          value={serverUrl}
          placeholder="https://machine.tailnet.ts.net"
          onChange={(v) => useAppStore.getState().setServerUrl(v)}
        />
        <ServerBanner />
        <Button
          variant="ghost"
          className="w-full"
          onClick={() => useAppStore.getState().go('welcome')}
        >
          Continuer sans compte (local)
        </Button>
      </div>
    </div>
  );
}
