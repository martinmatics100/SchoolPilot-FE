import { type Theme } from '@mui/material';
import { type Components } from '@mui/material/styles';

const Pagination: Components<Omit<Theme, 'components'>>['MuiPagination'] = {
  defaultProps: {},
  styleOverrides: {
    ul: ({ }) => ({
      flexWrap: 'nowrap',
    }),
  },
};

export default Pagination;
