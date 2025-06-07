import { Menu, Avatar, Button, Tooltip, MenuItem, ListItemIcon, ListItemText } from '@mui/material';
import IconifyIcon from '../../../components/base/iconifyIcon';
import profile from "../../../assets/images/account/Profile.png";
import profile1 from "../../../assets/images/trending-now/home-decor-range.jpg"
import { useState, type MouseEvent, useCallback, type ReactElement } from 'react';
// import { useAuth } from '../../../context';
import { useAuth } from '../../../context';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import useUserMenuItems from '../../../data/user-menu-items/user-menuItems';
import CircularImage from '../../../components/common/circular-image';


const UserDropdown = (): ReactElement => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);
    const { logout } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();

    const userMenuItems = useUserMenuItems();


    const handleUserClick = useCallback((event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleUserClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleLogout = useCallback(() => {
        handleUserClose();
        logout();
        navigate('/authentication/login');
    }, [logout, navigate]);

    return (
        <>
            <Button
                color="inherit"
                variant="text"
                id="account-dropdown-menu"
                aria-controls={menuOpen ? 'account-dropdown-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={menuOpen ? 'true' : undefined}
                onClick={handleUserClick}
                disableRipple
                sx={{
                    borderRadius: 2,
                    gap: 3.75,
                    px: { xs: 0, sm: 0.625 },
                    py: 0.625,
                    '&:hover': {
                        bgcolor: 'transparent',
                    },
                }}
            >
                <Tooltip title="Nickelfox" arrow placement="bottom">
                    <CircularImage src={profile1} sx={{ width: 44, height: 44 }} />
                </Tooltip>
                <IconifyIcon
                    color="common.white"
                    icon="mingcute:down-fill"
                    width={22.5}
                    height={22.5}
                    sx={(theme) => ({
                        transform: menuOpen ? `rotate(180deg)` : `rotate(0deg)`,
                        transition: theme.transitions.create('all', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.short,
                        }),
                    })}
                />
            </Button>
            <Menu
                id="account-dropdown-menu"
                anchorEl={anchorEl}
                open={menuOpen}
                onClose={handleUserClose}
                MenuListProps={{
                    'aria-labelledby': 'account-dropdown-button',
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                sx={{
                    '& .MuiPaper-root': {
                        backgroundColor: theme.palette.background.default,
                        color: theme.palette.common.white,
                        boxShadow: theme.shadows[3],
                    },
                }}
            >
                {userMenuItems.map((userMenuItem) => (
                    <MenuItem
                        key={userMenuItem.id}
                        onClick={() => {
                            if (userMenuItem.title === 'Logout') {
                                handleLogout();
                            } else if (userMenuItem.path) { // Ensure path is defined
                                handleUserClose();
                                navigate(userMenuItem.path); // Navigate to the specified path
                            }
                        }}>
                        <ListItemIcon
                            sx={{
                                minWidth: `0 !important`,
                                color: userMenuItem.color,
                                width: 14,
                                height: 10,
                                mb: 1.5,
                            }}
                        >
                            <IconifyIcon icon={userMenuItem.icon} color={userMenuItem.color} />
                        </ListItemIcon>
                        <ListItemText
                            sx={(theme) => ({
                                color: userMenuItem.color,
                                '& .MuiListItemText-primary': {
                                    fontSize: theme.typography.subtitle2.fontSize,
                                    fontFamily: theme.typography.subtitle2.fontFamily,
                                    fontWeight: theme.typography.subtitle2.fontWeight,
                                },
                            })}
                        >
                            {userMenuItem.title}
                        </ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}

export default UserDropdown;