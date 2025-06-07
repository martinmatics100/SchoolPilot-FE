import { type Theme } from '@mui/material';
import { type Components } from '@mui/material/styles';

const Paper: Components<Omit<Theme, 'components'>>['MuiPaper'] = {
  defaultProps: {},
  styleOverrides: {
    root: ({ theme }) => ({
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.palette.background.paper,
      borderRadius:
        typeof theme.shape.borderRadius === 'number'
          ? theme.shape.borderRadius * 2.5
          : theme.shape.borderRadius,
    }),
  },
};

export default Paper;
