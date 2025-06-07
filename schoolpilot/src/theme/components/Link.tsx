import { type Theme } from '@mui/material';
import { type Components } from '@mui/material/styles';
import { forwardRef } from 'react';
import { Link as RouterLink, type LinkProps as RouterLinkProps } from 'react-router-dom';

const LinkBehavior = forwardRef<any, Omit<RouterLinkProps, 'to'> & { href?: string }>(
  (props, ref) => <RouterLink ref={ref} to={props.href || '/'} {...props} />,
);

const Link: Components<Omit<Theme, 'components'>>['MuiLink'] = {
  defaultProps: {
    underline: 'none',
    component: LinkBehavior,
  },
  styleOverrides: {},
};

export default Link;
