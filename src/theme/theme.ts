import { createTheme, type ThemeOptions } from '@mui/material';

import components from './component-overrides';
import breakpoints from './breakpoints';
import typography from './typography';
import { darkPalette, lightPalette } from './palette';
import spacing from './spacing';
import shape from './shape';

const createAppTheme = (mode: 'light' | 'dark'): ThemeOptions => {
    const palette = mode === 'dark' ? darkPalette : lightPalette;
    return createTheme({
        breakpoints: breakpoints,
        components: components,
        typography: typography,
        palette: palette,
        spacing: spacing,
        shape: shape,
    });
};

export default createAppTheme;
