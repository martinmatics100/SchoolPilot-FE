import { type Theme } from '@mui/material';
import { type Components } from '@mui/material/styles';

const Menu: Components<Omit<Theme, 'components'>>['MuiMenu'] = {
  defaultProps: {
    disableScrollLock: true,
  },
  styleOverrides: {
    list: ({ theme }) => ({
      gap: 4,
      padding: theme.spacing(1),
    }),
  },
};

export default Menu;
