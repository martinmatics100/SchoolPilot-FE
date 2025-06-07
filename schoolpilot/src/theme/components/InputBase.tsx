import { type Theme } from '@mui/material';
import { type Components } from '@mui/material/styles';

const InputBase: Components<Omit<Theme, 'components'>>['MuiInputBase'] = {
  defaultProps: {
    autoComplete: 'off',
  },
  styleOverrides: {
    root: ({ theme }) => ({
      borderRadius:
        typeof theme.shape.borderRadius === 'number'
          ? theme.shape.borderRadius * 2
          : theme.shape.borderRadius,
      padding: 0,
    }),
    input: ({ theme }) => ({
      '&::placeholder': {
        color: theme.palette.action.focus,
      },
    }),
  },
};

export default InputBase;
