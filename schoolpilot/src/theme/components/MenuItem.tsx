import { type Theme } from '@mui/material';
import { type Components } from '@mui/material/styles';

const MenuItem: Components<Omit<Theme, 'components'>>['MuiMenuItem'] = {
  defaultProps: {},
  styleOverrides: {
    root: ({ theme }) => ({
      paddingLeft: theme.spacing(2.5),
      paddingRight: theme.spacing(2.5),
      borderRadius:
        typeof theme.shape.borderRadius === 'number'
          ? theme.shape.borderRadius * 2.5
          : theme.shape.borderRadius,
      gap: 10,
      minWidth: 0,
      justifyContent: 'center',
      '+.MuiDivider-root': {
        marginTop: 0,
        marginBottom: 0,
      },
    }),
    divider: () => ({
      marginTop: 0,
      marginBottom: 0,
    }),
  },
};

export default MenuItem;
