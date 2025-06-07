import { type Theme } from '@mui/material';
import { type Components } from '@mui/material/styles';

const Grid: Components<Omit<Theme, 'components'>>['MuiGrid'] = {
  defaultProps: {},
  styleOverrides: {
    root: ({ theme }) => ({
      margin: 0,
      width: '100%',
      transition: theme.transitions.create('all', {
        easing: theme.transitions.easing.easeInOut,
        duration: theme.transitions.duration.short,
      }),
    }),
  },
};

export default Grid;
