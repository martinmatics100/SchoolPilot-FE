import { type Theme } from '@mui/material';
import { type Components } from '@mui/material/styles';

const CardMedia: Components<Omit<Theme, 'components'>>['MuiCardMedia'] = {
  defaultProps: {},
  styleOverrides: {
    root: ({ }) => ({
      backgroundSize: 'cover',
      backgroundRepeat: 'no-repeat',
    }),
  },
};

export default CardMedia;
