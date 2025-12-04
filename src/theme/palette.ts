import { type PaletteOptions } from '@mui/material';
import { teal, grey, green, stone, fuchsia, bluishCyan, pinkishRed, yellowOrange, white, randomColors, lightThemeColors } from './colors';

declare module '@mui/material/styles' {
    interface TypeText {
        link?: string;
        linkHover?: string;
        linkActive?: string;
        muted?: string;
    }
}

const darkPalette: PaletteOptions = {
    primary: {
        light: teal[50],
        main: teal[100],
        dark: teal[200],
    },
    secondary: {
        light: fuchsia[50],
        main: fuchsia[100],
        dark: fuchsia[400],
    },
    success: {
        light: green[200],
        main: green[600],
        dark: green[900],
    },
    info: {
        light: bluishCyan[100],
        main: bluishCyan[500],
        dark: bluishCyan[900],
    },
    warning: {
        light: yellowOrange[50],
        main: yellowOrange[300],
        dark: yellowOrange[700],
    },
    error: {
        light: pinkishRed[300],
        main: pinkishRed[600],
        dark: pinkishRed[900],
    },
    background: {
        default: stone[900],
        paper: white[100],
    },
    common: {
        white: randomColors[900],
        black: stone[900],
    },
    text: {
        primary: stone[600],
        secondary: stone[200],
        disabled: stone[500],
        link: teal[500],
        linkHover: teal[300],
        linkActive: teal[700],
        muted: stone[400],
    },
    divider: stone[700],
    action: {
        focus: stone[400],
        disabled: stone[300],
        hover: randomColors[100],
        selected: randomColors[100]
    },
    grey: grey,
};

const lightPalette: PaletteOptions = {
    primary: {
        light: teal[50],
        main: lightThemeColors[100],
        dark: teal[200],
    },
    secondary: {
        light: fuchsia[50],
        main: fuchsia[100],
        dark: fuchsia[400],
    },
    success: {
        light: green[200],
        main: green[600],
        dark: green[900],
    },
    info: {
        light: bluishCyan[100],
        main: bluishCyan[500],
        dark: bluishCyan[900],
    },
    warning: {
        light: yellowOrange[50],
        main: yellowOrange[300],
        dark: yellowOrange[700],
    },
    error: {
        light: pinkishRed[300],
        main: pinkishRed[600],
        dark: pinkishRed[900],
    },
    background: {
        default: lightThemeColors[900],
        paper: white[100],
    },
    common: {
        white: randomColors[900],
        black: lightThemeColors[900],
    },
    text: {
        primary: stone[600],
        secondary: lightThemeColors[200],
        disabled: stone[500],
        link: teal[500],
        linkHover: teal[300],
        linkActive: teal[700],
        muted: stone[400],
    },
    divider: stone[700],
    action: {
        focus: stone[400],
        disabled: stone[300],
        hover: randomColors[100],
        selected: randomColors[100]
    },
    grey: grey,
};

export { darkPalette, lightPalette };
