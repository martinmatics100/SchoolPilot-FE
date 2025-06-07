import { type Theme } from '@mui/material';
import { type Components } from '@mui/material/styles';

const Button: Components<Omit<Theme, 'components'>>['MuiButton'] = {
  defaultProps: {
    variant: 'contained',
    size: 'medium',
  },
  styleOverrides: {
    root: ({ theme }) => {
      const br = theme.shape.borderRadius;
      const radiusValue =
        typeof br === 'number' ? br * 1.5 : parseFloat(br) * 1.5;

      return {
        borderRadius: typeof br === 'number' ? radiusValue : `${radiusValue}px`,
        textTransform: 'none',
      };
    },
    sizeSmall: ({ theme }) => ({
      padding: theme.spacing(1.25, 2),
      fontSize: theme.typography.body1.fontSize,
      fontWeight: theme.typography.body1.fontWeight,
    }),
    sizeMedium: ({ theme }) => ({
      padding: theme.spacing(2.5, 4),
      fontSize: theme.typography.subtitle1.fontSize,
      fontWeight: theme.typography.subtitle2.fontWeight,
    }),
    sizeLarge: ({ theme }) => ({
      padding: theme.spacing(2.5, 6),
      fontSize: theme.typography.h5.fontSize,
      fontWeight: theme.typography.h5.fontWeight,
    }),
    disabled: ({ theme }) => ({
      backgroundColor: theme.palette.action.disabled,
    }),
  },
};

export default Button;
