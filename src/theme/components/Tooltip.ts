

import { type Components, type Theme } from '@mui/material';

const Tooltip: Components<Omit<Theme, 'components'>>['MuiTooltip'] = {
    styleOverrides: {
        tooltip: ({ theme }) => ({
            backgroundColor: theme.palette.background.default,   // red
            color: theme.palette.text.secondary,              // blue
            fontSize: '0.8125rem',
            fontWeight: 500,
            borderRadius: 6,
            padding: '8px 12px',
            boxShadow: `0 4px 12px ${theme.palette.common.black}33`,
        }),
        arrow: ({ theme }) => ({
            color: theme.palette.error.main,             // red arrow
        }),
    },
};

export default Tooltip;