import { type Theme } from '@mui/material';
import { type Components } from '@mui/material/styles';

const PaginationItem: Components<Omit<Theme, 'components'>>['MuiPaginationItem'] = {
  defaultProps: {},
  styleOverrides: {
    previousNext: ({ theme }) => ({
      fontSize: theme.typography.body1.fontSize,
      fontWeight: theme.typography.body1.fontWeight,
      '.MuiTouchRipple-root': {
        color: theme.palette.primary.main,
      },
    }),
    page: ({ theme }) => ({
      borderRadius:
        typeof theme.shape.borderRadius === 'number'
          ? theme.shape.borderRadius * 10
          : theme.shape.borderRadius,
      fontSize: theme.typography.subtitle1.fontSize,
      fontWeight: theme.typography.body1.fontWeight,
    }),
  },
};

export default PaginationItem;
