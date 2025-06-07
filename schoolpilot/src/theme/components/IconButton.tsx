import { type Theme } from '@mui/material';
import { type Components } from '@mui/material/styles';

const IconButton: Components<Omit<Theme, 'components'>>['MuiIconButton'] = {
  defaultProps: {},
  styleOverrides: {
    root: ({ theme }) => ({
      color: theme.palette.common.white,
    }),
  },
};

export default IconButton;
