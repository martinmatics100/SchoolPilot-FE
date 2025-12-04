import React, { createContext, useState, useMemo } from 'react';
import createAppTheme from '../theme';
import { ThemeProvider } from '@mui/material';

export const ThemeModeContext = createContext<{
    themeMode: 'light' | 'dark';
    toggleThemeMode: () => void;
}>({
    themeMode: 'light',
    toggleThemeMode: () => { },
});

const ThemeModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {

        if (typeof window === 'undefined') return 'light';

        const savedTheme = localStorage.getItem('theme');
        return (savedTheme === 'light' || savedTheme === 'dark') ? savedTheme : 'light';
    });

    const toggleThemeMode = () => {
        setThemeMode(prev => {
            const newTheme = prev === 'light' ? 'dark' : 'light';
            localStorage.setItem('theme', newTheme);
            return newTheme;
        });
    };

    const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);

    return (
        <ThemeModeContext.Provider value={{ themeMode, toggleThemeMode }}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </ThemeModeContext.Provider>
    );
};

export default ThemeModeProvider;