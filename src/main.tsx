import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App, isSpectatorWindow, SpectatorPage } from '@/app/App';
import { logger } from '@/lib/logger';
import './index.css';

window.addEventListener('error', (e) => logger.error('window', e.message));
window.addEventListener('unhandledrejection', (e) => logger.error('promise', String(e.reason)));
logger.info('boot', isSpectatorWindow() ? 'fenêtre spectateur' : 'fenêtre régie');

createRoot(document.getElementById('root')!).render(
  <StrictMode>{isSpectatorWindow() ? <SpectatorPage /> : <App />}</StrictMode>,
);
