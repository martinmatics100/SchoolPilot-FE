import { type IUserMenuItem } from "../types/interfaces/i-user-menu";
import { useTheme } from '@mui/material/styles';

const useUserMenuItems = (): IUserMenuItem[] => {
    const theme = useTheme();

    return [
        {
            id: 4,
            path: '/plan/upgrade',
            title: 'Upgrade to pro',
            icon: 'material-symbols:switch-account',
            color: theme.palette.common.white,
        },
        {
            id: 5,
            path: '/profile',
            title: 'Help Center',
            icon: 'material-symbols:live-help',
            color: theme.palette.common.white,
        },
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
