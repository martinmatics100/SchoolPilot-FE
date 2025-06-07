import { type Theme } from '@mui/material';
import { type Components } from '@mui/material/styles';

const LinearProgress: Components<Omit<Theme, 'components'>>['MuiLinearProgress'] = {
  defaultProps: {},
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius:
        typeof theme.shape.borderRadius === 'number'
          ? theme.shape.borderRadius * 5
          : theme.shape.borderRadius,
      backgroundColor: theme.palette.common.white,
    }),
    bar: ({ theme }) => ({
      borderRadius:
        typeof theme.shape.borderRadius === 'number'
          ? theme.shape.borderRadius * 5
          : theme.shape.borderRadius,
    }),
  },
};

export default LinearProgress;
