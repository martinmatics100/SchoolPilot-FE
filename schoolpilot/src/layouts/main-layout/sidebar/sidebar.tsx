import { type ReactElement, useEffect, useState } from "react";
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
import navItems from "../../../data/sidebar-items/sidebar-items";
import SimpleBar from "simplebar-react";
import NavItem from "./navitem";
import Image from "../../../components/base/image";
import logoWithText from "../../../assets/palmfitLogoWithText.png";
import logo from "../../../assets/palmfitLogoWithoutText.png";
import { rootPaths } from "../../../routes/paths";
import { drawerCloseWidth, drawerOpenWidth } from "..";
import { useTheme } from "@mui/material";
import IconifyIcon from "../../../components/base/iconifyIcon";
import { UserRoles } from "../../../enums/user-roles";

interface GroupIcons {
    [key: string]: string;
}

const groupIcons: GroupIcons = {
    'DASHBOARD': 'mingcute:home-3-fill',
    'User Management': 'mdi:account-group-outline',
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

    const [role, setRole] = useState<string | null>(null);
    const theme = useTheme();

    useEffect(() => {
        console.log("Current role from localStorage:", localStorage.getItem("authData"));
        const storedAuthData = localStorage.getItem("authData");
        if (storedAuthData) {
            const { role } = JSON.parse(storedAuthData);
            if (role === UserRoles.ADMIN) setRole("ADMIN");
            else if (role === UserRoles.USER) setRole("USER");
        }
    }, []);

    const filteredNavItems = navItems.filter((item) => {
        if (item.roles.includes("ADMIN") && item.roles.includes("USER") && item.roles.includes("PROVIDER")) {
            return true;
        }
        return item.roles.includes(role ?? "");
    });

    const groupedNavItems = filteredNavItems.reduce((groups, item) => {
        if (!groups[item.group]) groups[item.group] = [];
        groups[item.group].push(item);
        return groups;
    }, {} as Record<string, typeof navItems>);

    const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

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
                <Link href={rootPaths.homeRoot} sx={{ mt: 3 }}>
                    <Image
                        src={open ? logoWithText : logo}
                        alt={open ? 'logo with text' : 'logo'}
                        height={40}
                    />
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
                                    '&:hover': {
                                        bgcolor: theme.palette.action.hover,
                                    }
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
                                                width: 44,
                                                height: 44,
                                                borderRadius: '12px',
                                                bgcolor: theme.palette.mode === 'dark'
                                                    ? theme.palette.primary.dark
                                                    : theme.palette.primary.light,
                                                color: theme.palette.primary.main,
                                                boxShadow: `0 2px 8px ${theme.palette.primary.light}`,
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

}

export default Sidebar;