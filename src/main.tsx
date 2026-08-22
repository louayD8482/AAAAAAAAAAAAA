import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import { SplashScreen } from '@capacitor/splash-screen';
import App from './App.tsx';
import ErrorBoundary from './components/ErrorBoundary.tsx';
import './index.css';

// Safely hide native splash screen immediately when JS bundle runs
try {
  SplashScreen.hide().catch(() => {});
} catch (e) {}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
);

