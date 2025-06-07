import { type Theme } from '@mui/material';
import { type Components } from '@mui/material/styles';

const Grid2: Components<Omit<Theme, 'components'>>['MuiGridLegacy'] = {
  defaultProps: {},
  styleOverrides: {
    root: ({ theme }) => ({
      transition: theme.transitions.create('width', {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.short,
      }),
    }),
  },
};

export default Grid2;
