import { type Theme } from '@mui/material';
import { type Components } from '@mui/material/styles';

const AppBar: Components<Omit<Theme, 'components'>>['MuiAppBar'] = {
  defaultProps: {},
  styleOverrides: {
    root: ({ theme }) => ({
      boxShadow: 'none',
      backgroundColor: theme.palette.background.default,
    }),
  },
};

export default AppBar;
