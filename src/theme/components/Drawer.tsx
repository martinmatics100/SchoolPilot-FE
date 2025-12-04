import { type Theme } from '@mui/material';
import { type Components } from '@mui/material/styles';

const Drawer: Components<Omit<Theme, 'components'>>['MuiDrawer'] = {
  defaultProps: {},
  styleOverrides: {
    paper: ({ theme }) => ({
      borderRadius: 0,
      backgroundColor: theme.palette.background.default,
    }),
  },
};

export default Drawer;
