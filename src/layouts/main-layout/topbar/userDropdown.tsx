import {
    Menu,
    Button,
    Tooltip,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Avatar,
} from '@mui/material';
import IconifyIcon from '../../../components/base/iconifyIcon';
import { useState, type MouseEvent, useCallback, type ReactElement, useEffect } from 'react';
import { useAuth } from '../../../context';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import useUserMenuItems from '../../../data/user-menu-items';
import { getUserProfile } from '../../../api/userService';
import paths from '../../../routes/paths';

interface ProfileLite {
    firstName?: string;
    lastName?: string;
    photoUrl?: string;
}

const UserDropdown = (): ReactElement => {
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);
    const { logout, selectedAccount, currentUser } = useAuth();
    const navigate = useNavigate();
    const theme = useTheme();

    const userMenuItems = useUserMenuItems();

    // ── Profile state (for the avatar) ──
    const [profile, setProfile] = useState<ProfileLite | null>(null);

    useEffect(() => {
        let cancelled = false;

        const loadProfile = async () => {
            if (!selectedAccount || !currentUser?.id) return;
            try {
                const data = await getUserProfile(selectedAccount, currentUser.id);
                if (!cancelled && data) {
                    setProfile({
                        firstName: data.firstName,
                        lastName: data.lastName,
                        photoUrl: data.photoUrl,
                    });
                }
            } catch (err) {
                // Non-fatal — fall back to initials below
                console.error('Failed to load profile for user dropdown:', err);
            }
        };

        loadProfile();
        return () => {
            cancelled = true;
        };
    }, [selectedAccount, currentUser?.id]);

    const handleUserClick = useCallback((event: MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleUserClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleLogout = useCallback(() => {
        handleUserClose();
        // logout();
        navigate(paths.logout);
    }, [logout, navigate]);

    // ── Avatar display values ──
    const initials =
        `${profile?.firstName?.[0] ?? ''}${profile?.lastName?.[0] ?? ''}`.toUpperCase() ||
        'U';
    const displayName = profile
        ? `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim()
        : 'Profile';

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
                <Tooltip title={displayName} arrow placement="bottom">
                    <Avatar
                        src={profile?.photoUrl || undefined}
                        alt={displayName}
                        sx={{
                            width: 44,
                            height: 44,
                            bgcolor: theme.palette.primary.main,
                            color: theme.palette.primary.contrastText,
                            fontWeight: 700,
                            fontSize: 16,
                        }}
                    >
                        {!profile?.photoUrl && initials}
                    </Avatar>
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
                            } else if (userMenuItem.path) {
                                handleUserClose();
                                navigate(userMenuItem.path);
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
};

export default UserDropdown;