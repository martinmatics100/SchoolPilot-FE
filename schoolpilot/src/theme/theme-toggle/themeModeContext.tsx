import React, { createContext, useState, useMemo } from 'react';
// import createAppTheme from '../theme/theme';
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
    const [themeMode, setThemeMode] = useState<'light' | 'dark'>(
        () => localStorage.getItem('theme') as 'light' | 'dark' || 'light'
    );

    const toggleThemeMode = () => {
        const newTheme = themeMode === 'light' ? 'dark' : 'light';
        setThemeMode(newTheme);
        localStorage.setItem('theme', newTheme);
    };

    const theme = useMemo(() => createAppTheme(themeMode), [themeMode]);

    return (
        <ThemeModeContext.Provider value={{ themeMode, toggleThemeMode }}>
            <ThemeProvider theme={theme}>{children}</ThemeProvider>
        </ThemeModeContext.Provider>
    );
};

export default ThemeModeProvider;
