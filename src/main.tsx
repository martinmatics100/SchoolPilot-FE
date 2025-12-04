// src/main.tsx (or index.tsx)
import { createRoot } from 'react-dom/client';
import './index.css';
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import BreakpointsProvider from './providers/breakPointsProvider';
import router from './routes/router';
import { AuthProvider } from './context';
import ThemeModeProvider from './theme/theme-toggle/themeModeContext';
import { ReactQueryProvider } from './providers/QueryClientProvider';
import ErrorBoundary from './components/error-boundary/index.tsx';
import { MessageProvider } from './context/messageContext.tsx';

createRoot(document.getElementById('root')!).render(
  // <React.StrictMode>
  <MessageProvider>
    <ErrorBoundary>
      <AuthProvider>
        <ReactQueryProvider>
          <ThemeModeProvider>
            <BreakpointsProvider>
              <CssBaseline />
              <RouterProvider router={router} />
            </BreakpointsProvider>
          </ThemeModeProvider>
        </ReactQueryProvider>
      </AuthProvider>
    </ErrorBoundary>
  </MessageProvider>
  // </React.StrictMode>
)
