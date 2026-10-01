import {
    Link,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Box,
    Tooltip,
    alpha,
} from '@mui/material';
import IconifyIcon from '../../../components/base/iconifyIcon';
import { type INavbarItem as NavItemProps } from '../../../types/interfaces/i-navbar-items';
import { useLocation } from 'react-router-dom';
import { useTheme } from '@mui/material';

const NavItem = ({ navItem, open }: { navItem: NavItemProps; open: boolean }) => {
    const { pathname } = useLocation();
    const theme = useTheme();

    // Check if current path matches or starts with navItem.path
    const isActive =
        pathname === navItem.path || pathname.startsWith(`${navItem.path}/`);

    return (
        <ListItem
            disablePadding
            sx={{
                display: 'block',
                px: open ? 1 : 0.5,
                py: 0.25,
                position: 'relative',
            }}
        >
            <Tooltip
                title={!open ? navItem.title : ''}
                placement="right"
                arrow
                componentsProps={{
                    tooltip: {
                        sx: {
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            bgcolor: theme.palette.background.paper,
                            color: theme.palette.text.primary,
                            boxShadow: theme.shadows[4],
                            py: 1,
                            px: 1.5,
                            borderRadius: 1.5,
                        },
                    },
                }}
            >
                <ListItemButton
                    component={Link}
                    href={navItem.path}
                    sx={{
                        opacity: navItem.active ? 1 : 0.85,
                        borderRadius: 2,
                        py: 1,
                        px: open ? 1.5 : 0,
                        justifyContent: open ? 'flex-start' : 'center',
                        alignItems: 'center',
                        minHeight: 44,
                        width: '100%',
                        position: 'relative',
                        overflow: 'hidden',

                        // Active / hover colors
                        bgcolor: isActive
                            ? alpha(theme.palette.primary.main, 0.1)
                            : 'transparent',
                        color: isActive
                            ? theme.palette.primary.main
                            : theme.palette.text.secondary,

                        transition:
                            'background-color 0.2s ease, color 0.2s ease, transform 0.2s ease',

                        // Left active bar
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: isActive ? 3 : 0,
                            height: '55%',
                            bgcolor: theme.palette.primary.main,
                            borderRadius: '0 4px 4px 0',
                            transition: 'width 0.25s ease',
                        },

                        '&:hover': {
                            bgcolor: isActive
                                ? alpha(theme.palette.primary.main, 0.16)
                                : alpha(theme.palette.action.hover, 0.8),
                            color: isActive
                                ? theme.palette.primary.main
                                : theme.palette.text.primary,
                            transform: open
                                ? 'translateX(3px)'
                                : 'scale(1.06)',
                            '&::before': {
                                width: 3,
                            },
                            '& .nav-icon': {
                                color: isActive
                                    ? theme.palette.primary.main
                                    : theme.palette.primary.dark,
                            },
                        },
                    }}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 0,
                            mr: open ? 1.5 : 0,
                            justifyContent: 'center',
                            display: 'flex',
                            alignItems: 'center',
                            color: isActive
                                ? theme.palette.primary.main
                                : theme.palette.text.secondary,
                            transition: 'color 0.2s ease',
                        }}
                    >
                        <IconifyIcon
                            className="nav-icon"
                            icon={navItem.icon}
                            width={open ? 22 : 26}
                            height={open ? 22 : 26}
                            sx={{ transition: 'color 0.2s ease' }}
                        />
                    </ListItemIcon>

                    {open && (
                        <ListItemText
                            primary={navItem.title}
                            primaryTypographyProps={{
                                fontSize: '0.85rem',
                                fontWeight: isActive ? 600 : 500,
                                letterSpacing: '0.15px',
                                noWrap: true,
                            }}
                            sx={{
                                opacity: open ? 1 : 0,
                                transition: 'opacity 0.2s ease',
                                '& .MuiTypography-root': {
                                    color: isActive
                                        ? theme.palette.primary.main
                                        : theme.palette.text.primary,
                                },
                            }}
                        />
                    )}

                    {isActive && open && (
                        <Box
                            sx={{
                                width: 6,
                                height: 6,
                                borderRadius: '50%',
                                bgcolor: theme.palette.primary.main,
                                flexShrink: 0,
                                boxShadow: `0 0 0 3px ${alpha(
                                    theme.palette.primary.main,
                                    0.15,
                                )}`,
                            }}
                        />
                    )}
                </ListItemButton>
            </Tooltip>
        </ListItem>
    );
};

export default NavItem;