import { type Theme } from '@mui/material';
import { type Components } from '@mui/material/styles';

const TextField: Components<Omit<Theme, 'components'>>['MuiTextField'] = {
  defaultProps: {},
  styleOverrides: {
    root: ({ theme }) => ({
      gap: theme.spacing(1),
    }),
  },
};

export default TextField;
