import { type Theme } from '@mui/material';
import { type Components } from '@mui/material/styles';

const InputAdornment: Components<Omit<Theme, 'components'>>['MuiInputAdornment'] = {
  defaultProps: {},
  styleOverrides: {
    root: ({ theme }) => ({
      color: theme.palette.action.disabled,
    }),
  },
};

export default InputAdornment;
