import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, type ComponentType } from 'react';
import { UpdateToast } from '@/components/UpdateToast';
import { AuthPage } from '@/pages/AuthPage';
import { ConsolePage } from '@/pages/ConsolePage';
import { DownloadPage } from '@/pages/DownloadPage';
import { PacksPage } from '@/pages/PacksPage';
import { SetupPage } from '@/pages/SetupPage';
import { SpectatorPage } from '@/pages/SpectatorPage';
import { SplashPage } from '@/pages/SplashPage';
import { WelcomePage } from '@/pages/WelcomePage';
import { startSyncLoop } from '@/services/configs';
import { checkForUpdates } from '@/services/updater';
import { useAppStore, type Screen } from '@/store/appStore';

const PAGES: Record<Screen, ComponentType> = {
  splash: SplashPage,
  download: DownloadPage,
  welcome: WelcomePage,
  auth: AuthPage,
  packs: PacksPage,
  setup: SetupPage,
  console: ConsolePage,
};

export function App() {
  const screen = useAppStore((s) => s.screen);
  useEffect(() => {
    void checkForUpdates();
    return startSyncLoop();
  }, []);
  const Page = PAGES[screen];
  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={screen}
          className="h-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          <Page />
        </motion.div>
      </AnimatePresence>
      <UpdateToast />
    </>
  );
}

/** La fenêtre spectateur est la même app, ouverte avec ?view=spectator. */
export const isSpectatorWindow = () =>
  new URLSearchParams(window.location.search).get('view') === 'spectator';
export { SpectatorPage };
