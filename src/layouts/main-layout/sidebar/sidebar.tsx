import { type ReactElement, useEffect, useState, useMemo } from "react"; // Added useMemo
import {
    Link,
    List,
    Toolbar,
    ListSubheader,
    Collapse,
    Box,
    Typography,
    Tooltip,
} from "@mui/material";
import navItems from "../../../data/sidebar-items";
import SimpleBar from "simplebar-react";
import NavItem from "./navitem";
import Image from "../../../components/base/image";
import logoWithText from "../../../assets/images/app-logo/SchoolPilot-.png";
import logo from "../../../assets/palmfitLogoWithoutText.png";
import { rootPaths } from "../../../routes/paths";
import { drawerCloseWidth, drawerOpenWidth } from "..";
import { useTheme } from "@mui/material";
import IconifyIcon from "../../../components/base/iconifyIcon";
import { UserRoles } from "../../../enums/user-roles";
import { useAuth } from "../../../context";
import { Logo, SimpleLogo } from "../../../components/Logo";

interface GroupIcons {
    [key: string]: string;
}



const groupIcons: GroupIcons = {
    'DASHBOARD': 'mingcute:home-3-fill',
    'MANAGMENT': 'mdi:account-group-outline',
    'Service Management': 'mdi:tools',
    'Booking': 'mdi:calendar-month-outline',
    'FEEDBACK/REPORTS': 'mdi:comment-text-outline',
    'SETTINGS': 'mdi:cog-outline',
    'HOME': 'mingcute:home-3-fill',
    'USERS': 'mdi:account-group-outline',
    'HELP': 'mdi:help-circle-outline',
    'Profile': 'mdi:account-circle-outline',
    'Handbook': 'mdi:book-open-variant',
    'Bookings': 'mdi:tools'
};

const Sidebar = ({ open }: { open: boolean }): ReactElement => {
    const theme = useTheme();
    const { role, updateRole } = useAuth();
    const [forceUpdate, setForceUpdate] = useState(0);

    // Listen for role changes
    useEffect(() => {
        const handleRoleChange = () => {
            setForceUpdate(prev => prev + 1); // Force re-render
        };

        window.addEventListener('localStorageRoleUpdated', handleRoleChange);
        return () => {
            window.removeEventListener('localStorageRoleUpdated', handleRoleChange);
        };
    }, []);

    // No need for a separate state `currentRole` if `userRoleFromContext` is stable enough.
    // The `useAuth` hook already provides a reactive value.
    // If you specifically need a local state, ensure its updates don't cause a loop.
    // However, for deriving filteredNavItems, directly using `userRoleFromContext` is better.

    // Filter navigation items based on the currentRole
    // Use useMemo to memoize this computation, so it only re-runs if userRoleFromContext changes.
    const filteredNavItems = useMemo(() => {
        return navItems.filter((item) => {
            if (!role) return false;
            return item.roles.includes(role);
        });
    }, [role, forceUpdate]); // Re-run when localStorage role changes

    // Group items. This also needs to be memoized because it's derived from filteredNavItems.
    const groupedNavItems = useMemo(() => {
        return filteredNavItems.reduce((groups, item) => {
            if (!groups[item.group]) groups[item.group] = [];
            groups[item.group].push(item);
            return groups;
        }, {} as Record<string, typeof navItems>);
    }, [filteredNavItems]); // Dependency: filteredNavItems

    // Initialize all groups as expanded by default when the component mounts or filtered items change
    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
        const initialExpanded: Record<string, boolean> = {};
        Object.keys(groupedNavItems).forEach(group => {
            initialExpanded[group] = true; // Set all groups to expanded by default
        });
        return initialExpanded;
    });

    // This useEffect re-initializes expanded groups whenever groupedNavItems changes.
    // The previous implementation was fine, but let's re-verify the logic.
    useEffect(() => {
        // Create a new expanded state based on the current groupedNavItems.
        // Preserve existing expansion status if the group still exists.
        setExpandedGroups((prevExpanded) => {
            const newExpanded: Record<string, boolean> = {};
            let changed = false; // Flag to check if the state actually changes

            Object.keys(groupedNavItems).forEach(group => {
                if (prevExpanded[group] !== undefined) {
                    newExpanded[group] = prevExpanded[group];
                } else {
                    newExpanded[group] = true; // New group, expand by default
                    changed = true;
                }
            });

            // Also check for groups that might have been removed
            Object.keys(prevExpanded).forEach(group => {
                if (groupedNavItems[group] === undefined) {
                    // Group was in prevExpanded but is no longer in groupedNavItems
                    changed = true;
                }
            });

            // Only update state if there's an actual change in the keys or values
            if (changed || Object.keys(newExpanded).length !== Object.keys(prevExpanded).length) {
                return newExpanded;
            }
            return prevExpanded; // No change, return previous state
        });
    }, [groupedNavItems]); // Re-run when groupedNavItems changes (due to userRoleFromContext change)


    const handleToggleGroup = (group: string) => {
        setExpandedGroups((prevState) => ({
            ...prevState,
            [group]: !prevState[group],
        }));
    };

    return (
        <>
            <Toolbar
                sx={{
                    position: 'fixed',
                    height: 98,
                    zIndex: 1,
                    bgcolor: theme.palette.background.default,
                    p: 0,
                    justifyContent: 'center',
                    width: open ? drawerOpenWidth - 1 : drawerCloseWidth - 1,
                }}
            >
                {/* <Link href={rootPaths.homeRoot} sx={{ mt: 3 }}>
                    <Image
                        src={open ? logoWithText : logo}
                        alt={open ? 'logo with text' : 'logo'}
                        height={40}
                        sx={{
                            bgcolor: "black",
                            width: "100"
                        }}
                    />
                </Link> */}
                <Link href={rootPaths.homeRoot} sx={{ mt: 3, textDecoration: 'none', width: '100%', display: 'flex', justifyContent: 'center' }}>
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

            <SimpleBar style={{
                maxHeight: "100vh",
                minHeight: "100vh",
                backgroundColor: theme.palette.background.default,
            }}>
                <List
                    component="nav"
                    sx={{
                        bgcolor: theme.palette.background.default,
                        mt: 24.5,
                        py: 2.5,
                        height: "100%",
                        justifyContent: "space-between",
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
                                }}
                            >
                                {open ? (
                                    <Typography
                                        variant="subtitle2"
                                        sx={{
                                            textTransform: "uppercase",
                                            fontWeight: 600,
                                            letterSpacing: 0.5,
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
                                                    fontSize: '0.875rem',
                                                    bgcolor: theme.palette.background.paper,
                                                    color: theme.palette.text.primary,
                                                    boxShadow: theme.shadows[4],
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
                                                bgcolor: theme.palette.mode === 'dark'
                                                    ? theme.palette.primary.dark
                                                    : theme.palette.common.white,
                                                color: theme.palette.text.secondary,
                                            }}
                                        >
                                            <IconifyIcon
                                                icon={groupIcons[group] || 'mdi:folder'}
                                                width={28}
                                                height={28}
                                                sx={{
                                                    transition: 'transform 0.2s',
                                                    '&:hover': {
                                                        transform: 'scale(1.1)'
                                                    }
                                                }}
                                            />
                                        </Box>
                                    </Tooltip>
                                )}

                                {open && (
                                    <IconifyIcon
                                        icon={expandedGroups[group] ? 'mdi:chevron-up' : 'mdi:chevron-down'}
                                        width={20}
                                        sx={{ ml: 1 }}
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
        </>
    );
};

export default Sidebar;