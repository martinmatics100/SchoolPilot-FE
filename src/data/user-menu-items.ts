import { type IUserMenuItem } from "../types/interfaces/i-user-menu";
import { useTheme } from '@mui/material/styles';

const useUserMenuItems = (): IUserMenuItem[] => {
    const theme = useTheme();

    return [
        {
            id: 6,
            path: '/profile',
            title: 'Logout',
            icon: 'material-symbols:logout',
            color: theme.palette.error.main,
        },
    ];
};

export default useUserMenuItems;
