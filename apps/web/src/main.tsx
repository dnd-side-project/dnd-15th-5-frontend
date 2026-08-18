import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '@/app/App';
import GoogleMapsProvider from '@/app/providers/GoogleMapsProvider';
import QueryProvider from '@/app/providers/QueryProvider';
import '@/app/styles/index.css';
import { ToastProvider } from '@/shared/ui/toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <ToastProvider>
        <GoogleMapsProvider>
          <App />
        </GoogleMapsProvider>
      </ToastProvider>
    </QueryProvider>
  </StrictMode>
);
