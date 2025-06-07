
import { createRoot } from 'react-dom/client'
import './index.css'
import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { CssBaseline } from '@mui/material';
import BreakpointsProvider from './providers/breakPointsProvider.tsx';
import router from './routes/router.tsx';
// import { AuthProvider } from './context/index.tsx';
// import { AuthProvider } from './context/authContext.tsx';
import { AuthProvider } from './context/index.tsx';
import ThemeModeProvider from './theme/theme-toggle/themeModeContext.tsx';

createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <AuthProvider>
            <ThemeModeProvider>
                <BreakpointsProvider>
                    <CssBaseline />
                    <RouterProvider router={router} />
                </BreakpointsProvider>
            </ThemeModeProvider>
        </AuthProvider>
    </React.StrictMode>,
)
