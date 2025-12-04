import { type Theme } from '@mui/material';
import { type Components } from '@mui/material/styles';

const ButtonBase: Components<Omit<Theme, 'components'>>['MuiButtonBase'] = {
  defaultProps: {},
  styleOverrides: {
    root: () => ({
      minWidth: 0,
    }),
  },
};

export default ButtonBase;
