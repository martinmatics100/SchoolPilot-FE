import { type Theme } from '@mui/material';
import { type Components } from '@mui/material/styles';

const TableContainer: Components<Omit<Theme, 'components'>>['MuiTableContainer'] = {
  defaultProps: {},
  styleOverrides: {
    root: ({ }) => ({
      overflowX: 'auto',
      scrollbarWidth: 'thin',
    }),
  },
};

export default TableContainer;
