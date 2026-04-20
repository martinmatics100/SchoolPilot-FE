import { type ReactElement, useEffect, useState, useMemo } from "react";
import {
    Link,
    List,
    Toolbar,
    ListSubheader,
    Collapse,
    Box,
    Typography,
    Tooltip,
    Divider,
    Button,
    Badge,
    Stack,
} from "@mui/material";
import navItems from "../../../data/sidebar-items";
import SimpleBar from "simplebar-react";
import NavItem from "./navitem";
import { rootPaths } from "../../../routes/paths";
import { drawerCloseWidth, drawerOpenWidth } from "..";
import { useTheme } from "@mui/material";
import IconifyIcon from "../../../components/base/iconifyIcon";
import { useAuth } from "../../../context";
import { Logo, SimpleLogo } from "../../../components/Logo";

interface GroupIcons {
    [key: string]: string;
}

const groupIcons: GroupIcons = {
    'DASHBOARD': 'solar:home-2-bold-duotone',
    'MANAGMENT': 'solar:users-group-two-rounded-bold-duotone',
    'Service Management': 'solar:wrench-bold-duotone',
    'Booking': 'solar:calendar-bold-duotone',
    'FEEDBACK/REPORTS': 'solar:chat-round-like-bold-duotone',
    'SETTINGS': 'solar:settings-bold-duotone',
    'HOME': 'solar:home-2-bold-duotone',
    'USERS': 'solar:users-group-two-rounded-bold-duotone',
    'HELP': 'solar:question-circle-bold-duotone',
    'Profile': 'solar:user-circle-bold-duotone',
    'Handbook': 'solar:book-bold-duotone',
    'Bookings': 'solar:calendar-bold-duotone'
};

// Bottom action types
type BottomAction = {
    id: string;
    icon: string;
    label: string;
    href?: string;
    onClick?: () => void;
    badge?: number;
    external?: boolean;
};

const Sidebar = ({ open }: { open: boolean }): ReactElement => {
    const theme = useTheme();
    const { role } = useAuth();
    const [forceUpdate, setForceUpdate] = useState(0);

    // Listen for role changes
    useEffect(() => {
        const handleRoleChange = () => {
            setForceUpdate(prev => prev + 1);
        };
        window.addEventListener('localStorageRoleUpdated', handleRoleChange);
        return () => {
            window.removeEventListener('localStorageRoleUpdated', handleRoleChange);
        };
    }, []);

    // Filter navigation items based on role
    const filteredNavItems = useMemo(() => {
        if (!role) return [];
        return navItems.filter((item) => item.roles.includes(role));
    }, [role, forceUpdate]);

    // Group items
    const groupedNavItems = useMemo(() => {
        return filteredNavItems.reduce((groups, item) => {
            if (!groups[item.group]) groups[item.group] = [];
            groups[item.group].push(item);
            return groups;
        }, {} as Record<string, typeof navItems>);
    }, [filteredNavItems]);

    // Initialize expanded groups
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
        const initialExpanded: Record<string, boolean> = {};
        Object.keys(groupedNavItems).forEach(group => {
            initialExpanded[group] = true;
        });
        return initialExpanded;
    });

    // Update expanded groups when groupedNavItems changes
    useEffect(() => {
        setExpandedGroups((prevExpanded) => {
            const newExpanded: Record<string, boolean> = {};
            let changed = false;

            Object.keys(groupedNavItems).forEach(group => {
                if (prevExpanded[group] !== undefined) {
                    newExpanded[group] = prevExpanded[group];
                } else {
                    newExpanded[group] = true;
                    changed = true;
                }
            });

            if (changed || Object.keys(newExpanded).length !== Object.keys(prevExpanded).length) {
                return newExpanded;
            }
            return prevExpanded;
        });
    }, [groupedNavItems]);

    const handleToggleGroup = (group: string) => {
        setExpandedGroups((prevState) => ({
            ...prevState,
            [group]: !prevState[group],
        }));
    };

    // Bottom actions configuration
    const bottomActions: BottomAction[] = [
        {
            id: 'news-feed',
            icon: 'solar:newspaper-bold-duotone',
            label: 'Latest News',
            href: '/news-feed',
            badge: 3,
        },
        {
            id: 'download-app',
            icon: 'solar:download-bold-duotone',
            label: 'Download App',
            href: 'https://play.google.com/store/apps/details?id=com.schoolpilot',
            external: true,
        },
        {
            id: 'announcements',
            icon: 'solar:megaphone-bold-duotone',
            label: 'Announcements',
            href: '/announcements',
            badge: 1,
        },
    ];

    const handleBottomActionClick = (action: BottomAction) => {
        if (action.onClick) {
            action.onClick();
        } else if (action.href) {
            if (action.external) {
                window.open(action.href, '_blank', 'noopener noreferrer');
            } else {
                window.location.href = action.href;
            }
        }
    };

    return (
        <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Toolbar
                sx={{
                    position: 'fixed',
                    height: 88,
                    zIndex: 1,
                    bgcolor: theme.palette.background.default,
                    p: 0,
                    justifyContent: 'center',
                    width: open ? drawerOpenWidth - 1 : drawerCloseWidth - 1,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.3s ease',
                }}
            >
                <Link href={rootPaths.homeRoot} sx={{
                    mt: 2,
                    textDecoration: 'none',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    transition: 'transform 0.2s ease',
                    '&:hover': {
                        transform: 'scale(1.02)',
                    }
                }}>
                    {open ? (
                        <Logo
                            variant="full"
                            size="small"
                            animated={true}
                            sx={{ cursor: 'pointer' }}
                        />
                    ) : (
                        <SimpleLogo size={40} />
                    )}
                </Link>
            </Toolbar>

            {/* Scrollable Area for Navigation Items Only */}
            <SimpleBar style={{
                flex: 1,
                backgroundColor: theme.palette.background.default,
                marginTop: 88, // Offset for fixed toolbar
                marginBottom: 'auto',
                paddingBottom: '140px',
            }}>
                <List
                    component="nav"
                    sx={{
                        bgcolor: theme.palette.background.default,
                        py: 2.5,
                    }}
                >
                    {Object.entries(groupedNavItems).map(([group, items]) => (
                        <div key={group}>
                            <ListSubheader
                                onClick={() => handleToggleGroup(group)}
                                component="div"
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: open ? "space-between" : "center",
                                    bgcolor: theme.palette.background.default,
                                    color: theme.palette.text.secondary,
                                    cursor: "pointer",
                                    px: open ? 3 : 0,
                                    py: 2.5,
                                    minHeight: 64,
                                    borderBottom: open ? `1px solid ${theme.palette.divider}` : 'none',
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                        bgcolor: open ? theme.palette.action.hover : 'transparent',
                                    },
                                }}
                            >
                                {open ? (
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            textTransform: "uppercase",
                                            fontWeight: 700,
                                            letterSpacing: 1,
                                            fontSize: '0.75rem',
                                            background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            color: 'transparent',
                                        }}
                                    >
                                        {group}
                                    </Typography>
                                ) : (
                                    <Tooltip
                                        title={group}
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
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: "100%",
                                                height: 44,
                                                    borderRadius: 2,
                                                bgcolor: theme.palette.mode === 'dark'
                                                        ? theme.palette.background.paper
                                                        : theme.palette.grey[300],
                                                    color: theme.palette.background.default,
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        bgcolor: theme.palette.primary.main,
                                                        color: theme.palette.common.white,
                                                        transform: 'scale(1.05)',
                                                    },
                                            }}
                                        >
                                            <IconifyIcon
                                                    icon={groupIcons[group] || 'solar:folder-bold-duotone'}
                                                    width={24}
                                                    height={24}
                                            />
                                        </Box>
                                    </Tooltip>
                                )}

                                {open && (
                                    <IconifyIcon
                                        icon={expandedGroups[group] ? 'solar:alt-arrow-up-bold' : 'solar:alt-arrow-down-bold'}
                                        width={18}
                                        sx={{
                                            ml: 1,
                                            color: theme.palette.text.secondary,
                                            transition: 'transform 0.2s ease',
                                        }}
                                    />
                                )}
                            </ListSubheader>

                            <Collapse in={!!expandedGroups[group]} timeout="auto" unmountOnExit>
                                <List component="div" disablePadding>
                                    {items.map((navItem) => (
                                        <NavItem key={navItem.id} navItem={navItem} open={open} />
                                    ))}
                                </List>
                            </Collapse>
                        </div>
                    ))}
                </List>
            </SimpleBar>

            {/* Fixed Bottom Section - Outside Scrollable Area */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    width: open ? drawerOpenWidth - 1 : drawerCloseWidth - 1,
                    bgcolor: theme.palette.background.default,
                    borderTop: `1px solid ${theme.palette.divider}`,
                    pt: 2,
                    pb: 3,
                    zIndex: 1200,
                    transition: 'all 0.3s ease',
                    boxShadow: '0px -4px 10px rgba(0, 0, 0, 0.05)',
                }}
            >
                <Divider sx={{ mb: 2, opacity: 0.6 }} />
                <Stack spacing={1.5} sx={{ px: open ? 2 : 1 }}>
                    {bottomActions.map((action) => (
                        <Tooltip
                            key={action.id}
                            title={!open ? action.label : ''}
                            placement="right"
                            arrow
                        >
                            <Button
                                onClick={() => handleBottomActionClick(action)}
                                component={action.href && !action.external ? Link : 'button'}
                                href={action.href && !action.external ? action.href : undefined}
                                fullWidth
                                sx={{
                                    justifyContent: open ? 'flex-start' : 'center',
                                    alignItems: 'center',
                                    gap: open ? 2 : 0,
                                    py: 1.5,
                                    px: open ? 2 : 1,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    color: theme.palette.text.primary,
                                    bgcolor: 'transparent',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    '&:hover': {
                                        bgcolor: theme.palette.action.hover,
                                        transform: 'translateX(4px)',
                                        '& .MuiButton-startIcon': {
                                            transform: 'scale(1.1)',
                                        },
                                    },
                                }}
                                startIcon={
                                    <Badge
                                        badgeContent={action.badge}
                                        color="error"
                                        sx={{
                                            '& .MuiBadge-badge': {
                                                fontSize: '0.625rem',
                                                height: 18,
                                                minWidth: 18,
                                                borderRadius: 1,
                                                top: -4,
                                                right: -4,
                                            },
                                        }}
                                    >
                                        <IconifyIcon
                                            icon={action.icon}
                                            width={open ? 22 : 28}
                                            height={open ? 22 : 28}
                                            sx={{
                                                transition: 'transform 0.2s ease',
                                                color: theme.palette.primary.main,
                                            }}
                                        />
                                    </Badge>
                                }
                            >
                                {open && (
                                    <Box sx={{ flex: 1, textAlign: 'left' }}>
                                        {action.label}
                                        {action.badge && action.badge > 0 && (
                                            <Typography
                                                component="span"
                                                sx={{
                                                    ml: 1,
                                                    fontSize: '0.625rem',
                                                    fontWeight: 700,
                                                    color: theme.palette.error.main,
                                                }}
                                            >
                                                • {action.badge} new
                                            </Typography>
                                        )}
                                    </Box>
                                )}
                            </Button>
                        </Tooltip>
                    ))}
                </Stack>
            </Box>
        </Box>
    );
};

export default Sidebar;