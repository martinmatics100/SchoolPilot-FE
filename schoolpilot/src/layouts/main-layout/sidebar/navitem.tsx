import { Link, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import IconifyIcon from '../../../components/base/iconifyIcon';
import { type INavbarItem as NavItemProps } from '../../../interfaces/sidebar/i-navbar-item';
import { useLocation } from 'react-router-dom';
import { useTheme } from "@mui/material";

const NavItem = ({ navItem, open }: { navItem: NavItemProps; open: boolean }) => {
    const { pathname } = useLocation();
    const theme = useTheme();

    // Check if current path matches or starts with navItem.path
    const isActive = pathname === navItem.path || pathname.startsWith(`${navItem.path}/`);

    return (
        <ListItem
            disablePadding
            sx={(theme) => ({
                display: 'block',
                px: 5,
                borderRight: !open
                    ? isActive
                        ? `3px solid ${theme.palette.primary.main}`
                        : `3px solid transparent`
                    : '',
            })}>
            <ListItemButton
                LinkComponent={Link}
                href={navItem.path}
                sx={{
                    opacity: navItem.active ? 1 : 0.5,
                    bgcolor: isActive ? (open ? theme.palette.primary.main : theme.palette.primary.main) : theme.palette.common.black,
                    '&:hover': {
                        bgcolor:
                            isActive
                                ? open
                                    ? theme.palette.background.paper
                                    : theme.palette.background.paper
                                : theme.palette.common.white,
                    },
                    '& .MuiTouchRipple-root': {
                        color: isActive ? theme.palette.common.white : theme.palette.text.disabled,
                    },
                }}
            >
                <ListItemIcon
                    sx={{
                        width: 20,
                        height: 20,
                        mr: open ? 'auto' : 0,
                        color:
                            isActive
                                ? open
                                    ? theme.palette.common.black
                                    : theme.palette.common.black
                                : theme.palette.text.primary,
                    }}
                >
                    <IconifyIcon icon={navItem.icon} width={1} height={1} />
                </ListItemIcon>
                <ListItemText
                    primary={navItem.title}
                    sx={{
                        display: open ? 'inline-block' : 'none',
                        opacity: open ? 1 : 0,
                        color: isActive ? theme.palette.common.black : '',
                    }}
                />
            </ListItemButton>
        </ListItem>
    )
}

export default NavItem;