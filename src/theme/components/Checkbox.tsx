import { type Theme } from '@mui/material';
import { type Components } from '@mui/material/styles';
import CheckBoxBlankIcon from '../../components/icons/checkBoxBlankIcon';
import CheckBoxCheckedIcon from '../../components/icons/checkBoxCheckedIcon';
import CheckBoxIndeterminateIcon from '../../components/icons/checkBoxIndeterminateIcon';

const Checkbox: Components<Omit<Theme, 'components'>>['MuiCheckbox'] = {
  defaultProps: {
    icon: <CheckBoxBlankIcon />,
    checkedIcon: <CheckBoxCheckedIcon />,
    indeterminateIcon: <CheckBoxIndeterminateIcon />,
  },
  styleOverrides: {
    root: ({ theme }) => ({
      color: theme.palette.text.secondary,
    }),
    sizeMedium: ({ theme }) => ({
      '& .MuiSvgIcon-root': {
        fontSize: theme.typography.button.fontSize,
      },
    }),
    sizeSmall: ({ theme }) => ({
      '& .MuiSvgIcon-root': {
        fontSize: theme.typography.caption.fontSize,
      },
    }),
  },
};

export default Checkbox;
