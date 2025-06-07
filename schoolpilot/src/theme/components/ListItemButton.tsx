import { type Theme } from '@mui/material';
import { type Components } from '@mui/material/styles';

const ListItemButton: Components<Omit<Theme, 'components'>>['MuiListItemButton'] = {
  defaultProps: {},
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius:
        typeof theme.shape.borderRadius === 'number'
          ? theme.shape.borderRadius * 1.5
          : theme.shape.borderRadius,
      padding: theme.spacing(2.5, 4),
      justifyContent: 'center',
      alignItems: 'center',
      gap: 5,
    }),
  },
};

export default ListItemButton;
