import { type Theme } from '@mui/material';
import { type Components } from '@mui/material/styles';

const OutlinedInput: Components<Omit<Theme, 'components'>>['MuiOutlinedInput'] = {
  defaultProps: { autoComplete: 'off' },
  styleOverrides: {
    root: ({ theme }) => ({
      paddingLeft: 0,
      borderRadius:
        typeof theme.shape.borderRadius === 'number'
          ? theme.shape.borderRadius * 2.5
          : theme.shape.borderRadius,
      '&:hover .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.text.secondary,
        borderWidth: 1,
      },
      '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
        borderColor: theme.palette.text.secondary,
        borderWidth: 1,
      },
      '&.MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline > legend': {
        width: 0,
      },
    }),
    input: ({ theme }) => ({
      marginLeft: theme.spacing(3),
      color: theme.palette.text.secondary,
      '&::placeholder': {
        opacity: 1,
        color: theme.palette.text.primary,
      },
    }),
    notchedOutline: ({ theme }) => ({
      borderColor: theme.palette.text.primary,
      '&:hover': {
        borderColor: theme.palette.text.secondary,
      },
    }),
  },
};

export default OutlinedInput;
