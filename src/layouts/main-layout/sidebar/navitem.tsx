import { Link, ListItem, ListItemButton, ListItemIcon, ListItemText, Box, Tooltip, alpha } from '@mui/material';
import IconifyIcon from '../../../components/base/iconifyIcon';
import { type INavbarItem as NavItemProps } from '../../../types/interfaces/i-navbar-items';
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
            sx={{
                display: 'block',
                px: 0, // Remove padding completely when collapsed
                py: 0.5,
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
                        }
                    }
                }}
            >
                <ListItemButton
                    component={Link}
                    href={navItem.path}
                    sx={{
                        opacity: navItem.active ? 1 : 0.6,
                        borderRadius: 2,
                        mb: 0.5,
                        py: 1.2,
                        px: open ? 2 : 0, // Remove horizontal padding when collapsed
                        justifyContent: 'center', // Always center, but text will show when open
                        alignItems: 'center',
                        minHeight: 48,
                        width: '100%',
                        bgcolor: isActive
                            ? alpha(theme.palette.primary.main, 0.12)
                            : 'transparent',
                        color: isActive
                            ? theme.palette.primary.main
                            : theme.palette.text.primary,
                        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                        position: 'relative',
                        overflow: 'hidden',
                        '&::before': {
                            content: '""',
                            position: 'absolute',
                            left: 0,
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: isActive ? 3 : 0,
                            height: '60%',
                            bgcolor: theme.palette.primary.main,
                            borderRadius: '0 4px 4px 0',
                            transition: 'width 0.2s ease',
                        },
                        '&:hover': {
                            bgcolor: isActive
                                ? alpha(theme.palette.primary.main, 0.16)
                                : alpha(theme.palette.action.hover, 0.8),
                            transform: open ? 'translateX(4px)' : 'scale(1.05)',
                            '&::before': {
                                width: 3,
                            },
                        },
                    }}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 0,
                            mr: open ? 2 : 0, // No margin when collapsed
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
                            icon={navItem.icon}
                            width={open ? 22 : 36} // Even larger for better visibility
                            height={open ? 22 : 36}
                        />
                    </ListItemIcon>
                    {open && (
                        <ListItemText
                            primary={navItem.title}
                            primaryTypographyProps={{
                                fontSize: '0.875rem',
                                fontWeight: isActive ? 600 : 500,
                                letterSpacing: '0.2px',
                                sx: {
                                    transition: 'all 0.2s ease',
                                },
                            }}
                            sx={{
                                opacity: open ? 1 : 0,
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
                                position: 'absolute',
                                right: 16,
                                width: 4,
                                height: 4,
                                borderRadius: '50%',
                                bgcolor: theme.palette.primary.main,
                            }}
                        />
                    )}
                </ListItemButton>
            </Tooltip>
        </ListItem>
    );
};

export default NavItem;