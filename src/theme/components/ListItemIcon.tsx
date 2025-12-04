import { type Theme } from '@mui/material';
import { type Components } from '@mui/material/styles';

const ListItemIcon: Components<Omit<Theme, 'components'>>['MuiListItemIcon'] = {
  defaultProps: {},
  styleOverrides: {
    root: ({ theme }) => ({
      minWidth: 0,
      width: theme.spacing(3.5),
      height: theme.spacing(3.5),
      color: theme.palette.background.default,
      justifyContent: 'center',
    }),
  },
};

export default ListItemIcon;
