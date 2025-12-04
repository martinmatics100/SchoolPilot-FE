import { type Theme } from '@mui/material';
import { type Components } from '@mui/material/styles';

const Divider: Components<Omit<Theme, 'components'>>['MuiDivider'] = {
  defaultProps: {},
  styleOverrides: {
    root: () => ({
      margin: 0,
    }),
  },
};

export default Divider;
