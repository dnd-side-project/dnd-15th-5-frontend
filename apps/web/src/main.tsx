import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from '@/app/App';
import AuthProvider from '@/app/providers/AuthProvider';
import GoogleMapsProvider from '@/app/providers/GoogleMapsProvider';
import QueryProvider from '@/app/providers/QueryProvider';
import '@/app/styles/index.css';
import { ToastProvider } from '@/shared/ui/toast';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryProvider>
      <ToastProvider>
        <AuthProvider>
          <GoogleMapsProvider>
            <App />
          </GoogleMapsProvider>
        </AuthProvider>
      </ToastProvider>
    </QueryProvider>
  </StrictMode>
);
