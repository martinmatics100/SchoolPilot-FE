import { type Theme } from '@mui/material';
import { type Components } from '@mui/material/styles';

const List: Components<Omit<Theme, 'components'>>['MuiList'] = {
  defaultProps: {},
  styleOverrides: {
    root: () => ({
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }),
  },
};

export default List;
