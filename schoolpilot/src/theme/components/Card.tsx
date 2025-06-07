import { type Theme } from '@mui/material';
import { type Components } from '@mui/material/styles';

const Card: Components<Omit<Theme, 'components'>>['MuiCard'] = {
  defaultProps: {},
  styleOverrides: {
    root: ({ }) => ({
      display: 'flex',
      flexDirection: 'column',
    }),
  },
};

export default Card;
