import { type ReactElement, useEffect, useState, useMemo } from 'react';
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
    alpha,
} from '@mui/material';
import navItems from '../../../data/sidebar-items';
import SimpleBar from 'simplebar-react';
import NavItem from './navitem';
import { rootPaths } from '../../../routes/paths';
import { drawerCloseWidth, drawerOpenWidth } from '..';
import { useTheme } from '@mui/material';
import IconifyIcon from '../../../components/base/iconifyIcon';
import { useAuth } from '../../../context';
import superAdminNavItems from '../../../data/super-admin-nav-items';
import { UserRoles } from '../../../enums/user-roles';
import { Logo, SimpleLogo } from '../../../components/Logo';
import { FeedbackModal } from '../../../components/feedback';

interface GroupIcons {
    [key: string]: string;
}

const groupIcons: GroupIcons = {
    DASHBOARD: 'solar:home-2-bold-duotone',
    MANAGMENT: 'solar:users-group-two-rounded-bold-duotone',
    'Service Management': 'solar:wrench-bold-duotone',
    Booking: 'solar:calendar-bold-duotone',
    'FEEDBACK/REPORTS': 'solar:chat-round-like-bold-duotone',
    SETTINGS: 'solar:settings-bold-duotone',
    HOME: 'solar:home-2-bold-duotone',
    USERS: 'solar:users-group-two-rounded-bold-duotone',
    HELP: 'solar:question-circle-bold-duotone',
    Profile: 'solar:user-circle-bold-duotone',
    Handbook: 'solar:book-bold-duotone',
    Bookings: 'solar:calendar-bold-duotone',
    PLATFORM: 'solar:server-bold-duotone',
    COMMUNICATION: 'solar:chat-round-like-bold-duotone',
    SYSTEM: 'solar:settings-bold-duotone',
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
    const [feedbackModalOpen, setFeedbackModalOpen] = useState(false);

    // Listen for role changes
    useEffect(() => {
        const handleRoleChange = () => {
            setForceUpdate((prev) => prev + 1);
        };
        window.addEventListener('localStorageRoleUpdated', handleRoleChange);
        return () => {
            window.removeEventListener('localStorageRoleUpdated', handleRoleChange);
        };
    }, []);

    const filteredNavItems = useMemo(() => {
        if (!role) return [];
        const source = role === UserRoles.SUPER_ADMIN ? superAdminNavItems : navItems;
        return source.filter((item) => item.roles.includes(role));
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
        Object.keys(groupedNavItems).forEach((group) => {
            initialExpanded[group] = true;
        });
        return initialExpanded;
    });

    // Update expanded groups when groupedNavItems changes
    useEffect(() => {
        setExpandedGroups((prevExpanded) => {
            const newExpanded: Record<string, boolean> = {};
            let changed = false;

            Object.keys(groupedNavItems).forEach((group) => {
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

    const openFeedbackModal = () => {
        setFeedbackModalOpen(true);
    };

    // Bottom actions configuration
    const bottomActions: BottomAction[] = [
        {
            id: 'download-app',
            icon: 'solar:download-bold-duotone',
            label: 'Download App',
            href: 'https://play.google.com/store/apps/details?id=com.schoolpilot',
            external: true,
        },
        {
            id: 'feedback',
            icon: 'solar:chat-round-like-bold-duotone',
            label: 'Feedback & Support',
            onClick: () => openFeedbackModal(),
            badge: undefined,
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
        <Box
            sx={{
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                bgcolor: theme.palette.background.default,
                position: 'relative',
            }}
        >
            {/* ── Top logo bar ────────────────────────────────────── */}
            <Toolbar
                sx={{
                    position: 'fixed',
                    height: 88,
                    zIndex: 1,
                    bgcolor: theme.palette.background.default,
                    p: 0,
                    justifyContent: 'center',
                    width: open ? drawerOpenWidth - 1 : drawerCloseWidth - 1,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                    transition: 'width 0.3s ease, background-color 0.3s ease',
                }}
            >
                <Link
                    href={rootPaths.homeRoot}
                    sx={{
                        mt: 2,
                        textDecoration: 'none',
                        width: '100%',
                        display: 'flex',
                        justifyContent: 'center',
                        transition: 'transform 0.2s ease',
                        '&:hover': { transform: 'scale(1.02)' },
                    }}
                >
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

            {/* ── Scrollable navigation ───────────────────────────── */}
            <SimpleBar
                style={{
                    flex: 1,
                    backgroundColor: theme.palette.background.default,
                    marginTop: 88,
                    marginBottom: 'auto',
                    paddingBottom: '140px',
                }}
            >
                <List
                    component="nav"
                    sx={{
                        bgcolor: theme.palette.background.default,
                        py: 2,
                        px: open ? 1.5 : 1,
                    }}
                >
                    {Object.entries(groupedNavItems).map(([group, items]) => (
                        <Box key={group} sx={{ mb: 1 }}>
                            {/* ── Group header ─────────────────────── */}
                            <ListSubheader
                                onClick={() => handleToggleGroup(group)}
                                component="div"
                                disableSticky
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: open ? 'space-between' : 'center',
                                    bgcolor: 'transparent',
                                    color: theme.palette.text.secondary,
                                    cursor: 'pointer',
                                    px: open ? 1.5 : 0,
                                    py: 1.25,
                                    minHeight: 44,
                                    transition: 'all 0.2s ease',
                                    borderRadius: 2,
                                    '&:hover': {
                                        bgcolor: open
                                            ? alpha(theme.palette.action.hover, 0.6)
                                            : 'transparent',
                                    },
                                }}
                            >
                                {open ? (
                                    <>
                                        <Stack
                                            direction="row"
                                            alignItems="center"
                                            spacing={1}
                                        >
                                            <Box
                                                sx={{
                                                    width: 22,
                                                    height: 22,
                                                    borderRadius: 1.5,
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    bgcolor: alpha(
                                                        theme.palette.primary.main,
                                                        0.1,
                                                    ),
                                                    color: theme.palette.primary.main,
                                                }}
                                            >
                                                <IconifyIcon
                                                    icon={
                                                        groupIcons[group] ||
                                                        'solar:folder-bold-duotone'
                                                    }
                                                    width={14}
                                                    height={14}
                                                />
                                            </Box>
                                            <Typography
                                                variant="subtitle2"
                                                sx={{
                                                    textTransform: 'uppercase',
                                                    fontWeight: 700,
                                                    letterSpacing: 0.8,
                                                    fontSize: '0.7rem',
                                                    color: theme.palette.text.secondary,
                                                }}
                                            >
                                                {group}
                                            </Typography>
                                        </Stack>

                                        <IconifyIcon
                                            icon={
                                                expandedGroups[group]
                                                    ? 'solar:alt-arrow-up-bold'
                                                    : 'solar:alt-arrow-down-bold'
                                            }
                                            width={16}
                                            sx={{
                                                color: theme.palette.text.secondary,
                                                transition:
                                                    'transform 0.25s ease, color 0.2s ease',
                                            }}
                                        />
                                    </>
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
                                                    borderRadius: 1.5,
                                                },
                                            },
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                    width: 44,
                                                height: 44,
                                                    borderRadius: 2,
                                                    bgcolor: alpha(
                                                        theme.palette.primary.main,
                                                        0.08,
                                                    ),
                                                    color: theme.palette.primary.main,
                                                    transition: 'all 0.2s ease',
                                                    '&:hover': {
                                                        bgcolor: theme.palette.primary.main,
                                                        color: theme.palette.common.white,
                                                        transform: 'scale(1.06)',
                                                    },
                                            }}
                                        >
                                            <IconifyIcon
                                                    icon={
                                                        groupIcons[group] ||
                                                        'solar:folder-bold-duotone'
                                                    }
                                                    width={22}
                                                    height={22}
                                            />
                                        </Box>
                                    </Tooltip>
                                )}
                            </ListSubheader>

                            {/* ── Group items ──────────────────────── */}
                            <Collapse
                                in={!!expandedGroups[group]}
                                timeout="auto"
                                unmountOnExit
                            >
                                <List component="div" disablePadding>
                                    {items.map((navItem) => (
                                        <NavItem
                                            key={navItem.id}
                                            navItem={navItem}
                                            open={open}
                                        />
                                    ))}
                                </List>
                            </Collapse>
                        </Box>
                    ))}
                </List>
            </SimpleBar>

            {/* ── Fixed bottom section ────────────────────────────── */}
            <Box
                sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    width: open ? drawerOpenWidth - 1 : drawerCloseWidth - 1,
                    bgcolor: theme.palette.background.default,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                    pt: 1.5,
                    pb: 2,
                    zIndex: 1200,
                    transition: 'width 0.3s ease',
                    // Softer shadow
                    boxShadow: `0px -8px 24px ${alpha('#000', 0.06)}`,
                }}
            >
                <Stack spacing={1} sx={{ px: open ? 1.5 : 1 }}>
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
                                href={
                                    action.href && !action.external ? action.href : undefined
                                }
                                fullWidth
                                sx={{
                                    justifyContent: open ? 'flex-start' : 'center',
                                    alignItems: 'center',
                                    gap: open ? 1.5 : 0,
                                    py: 1.25,
                                    px: open ? 1.5 : 1,
                                    borderRadius: 2,
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    fontSize: '0.85rem',
                                    color: theme.palette.text.primary,
                                    bgcolor: 'transparent',
                                    transition: 'all 0.2s ease',
                                    position: 'relative',
                                    '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                        color: theme.palette.primary.main,
                                        transform: 'translateX(3px)',
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
                                            width={open ? 22 : 26}
                                            height={open ? 22 : 26}
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

            <FeedbackModal
                open={feedbackModalOpen}
                onClose={() => setFeedbackModalOpen(false)}
            />
        </Box>
    );
};

export default Sidebar;