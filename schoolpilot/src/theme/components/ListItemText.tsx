import { type Theme } from '@mui/material';
import { type Components } from '@mui/material/styles';

const ListItemText: Components<Omit<Theme, 'components'>>['MuiListItemText'] = {
  defaultProps: {},
  styleOverrides: {
    root: ({ theme }) => ({
      margin: 0,
      color: theme.palette.text.primary,
    }),
    primary: ({ theme }) => ({
      fontSize: theme.typography.body1.fontSize,
      fontWeight: theme.typography.body1.fontWeight,
      whiteSpace: 'nowrap',
    }),
  },
};

export default ListItemText;
