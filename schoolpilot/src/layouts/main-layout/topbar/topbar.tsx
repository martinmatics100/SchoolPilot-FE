import {
    Badge,
    Stack,
    AppBar,
    Toolbar,
    Drawer,
    TextField,
    IconButton,
    InputAdornment,
    List,
    ListItem,
    ListItemText,
    Typography,
    Box
} from '@mui/material';
import IconifyIcon from '../../../components/base/iconifyIcon';
import { type ReactElement, useState } from 'react';
import UserDropdown from './userDropdown';
import { useBreakpoints } from '../../../providers/breakPointsProvider';
import { drawerOpenWidth, drawerCloseWidth } from '..';
import { useTheme } from '@mui/material/styles';
import ThemeToggle from '../../../theme/theme-toggle';
import { useAuth } from '../../../context';

const Topbar = ({
    open,
    handleDrawerToggle,
}: {
    open: boolean;
    handleDrawerToggle: () => void;
}): ReactElement => {
    const { down } = useBreakpoints();

    const isMobileScreen = down('sm');
    const theme = useTheme();

    const [notificationsOpen, setNotificationsOpen] = useState(false);
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [messageOpen, setMessageOpen] = useState(false);
    const { selectedAccount, accounts, selectedBranches, userEmail, isAuthenticated } = useAuth();

    const selectedAccountData = accounts.find(account => account.id === selectedAccount);

    const notifications = [
        { id: 1, message: 'New comment on your post' },
        { id: 2, message: 'Your order has been shipped' },
        { id: 3, message: 'You have a new follower' },
    ];

    const settingsOptions = [
        { id: 1, option: 'Account Settings' },
        { id: 2, option: 'Privacy Settings' },
        { id: 3, option: 'Notification Settings' },
    ];

    const messagesOptions = [
        { id: 1, option: 'This is some awesome thinking!' },
        { id: 2, option: 'What terrific math skills you are showing!' },
        { id: 3, option: 'You are an amazing writer!' },
    ];


    return (
        <AppBar
            position="fixed"
            sx={{
                left: 0,
                ml: isMobileScreen ? 0 : open ? 60 : 27.5,
                width: isMobileScreen
                    ? 1
                    : open
                        ? `calc(100% - ${drawerOpenWidth}px)`
                        : `calc(100% - ${drawerCloseWidth}px)`,
                paddingRight: '0 !important',
            }}
        >
            <Toolbar
                component={Stack}
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{
                    bgcolor: theme.palette.background.default,
                    borderBottom: "1px solid",
                    borderColor: theme.palette.primary.light,
                    height: 116,
                }}
            >
                <Stack direction="row" gap={2} alignItems="center" ml={2.5} flex="1 1 52.5%">
                    <IconButton
                        aria-label="open drawer"
                        onClick={handleDrawerToggle}
                        edge="start"
                    >
                        <IconifyIcon
                            icon={open ? 'ri:menu-unfold-4-line' : 'ri:menu-unfold-3-line'}
                            color={theme.palette.common.white}
                        />
                    </IconButton>
                    {/* <IconButton
                        color="inherit"
                        sx={{
                            display: { xs: 'flex', sm: 'none' },
                        }}
                    >
                        <IconifyIcon icon="mdi:search" />
                    </IconButton>
                    <TextField
                        variant="filled"
                        fullWidth
                        placeholder="Search here..."
                        sx={{
                            display: { xs: 'none', sm: 'flex' },
                        }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="end">
                                    <IconifyIcon icon="akar-icons:search" width={13} height={13} />
                                </InputAdornment>
                            ),
                        }}
                    /> */}

                    {/* Display selected account info and user email in topbar */}
                    <Stack direction="row" alignItems="center" spacing={3}>
                        {selectedAccountData && (
                            <Box
                                sx={{
                                    position: 'relative',
                                    '&:hover .branch-tooltip': {
                                        visibility: 'visible',
                                        opacity: 1,
                                    }
                                }}
                            >
                                <Typography
                                    variant="subtitle1"
                                    sx={{ fontSize: "15px" }}
                                    fontWeight="bold"
                                    color={theme.palette.text.secondary}
                                >
                                    {selectedAccountData.name}
                                </Typography>

                                {/* Hidden branch names that appear on hover */}
                                <Box
                                    className="branch-tooltip"
                                    sx={{
                                        visibility: 'hidden',
                                        opacity: 0,
                                        position: 'absolute',
                                        bottom: '-30px',
                                        left: 0,
                                        backgroundColor: theme.palette.background.paper,
                                        border: `1px solid ${theme.palette.divider}`,
                                        borderRadius: 1,
                                        padding: 1,
                                        transition: 'all 0.3s ease',
                                        zIndex: 1,
                                        minWidth: '500px'
                                    }}
                                >
                                    <Typography variant="caption" color={theme.palette.text.primary}>
                                        Branches: {selectedBranches.map(branch => branch.name).join(', ')}
                                    </Typography>
                                </Box>
                            </Box>
                        )}
                    </Stack>
                </Stack>
                <Stack
                    direction="row"
                    gap={3.75}
                    alignItems="center"
                    justifyContent="flex-end"
                    mr={3.75}
                    flex="1 1 20%"
                >
                    <Badge
                        color="error"
                        badgeContent=" "
                        variant="dot"
                        sx={{
                            '& .MuiBadge-badge': {
                                top: 11,
                                right: 11,
                            },
                        }}
                    >

                        <IconButton
                            sx={{
                                padding: 1,
                            }}
                            onClick={() => setSettingsOpen(true)}
                        >
                            <IconifyIcon icon="ic:round-settings" width={29} height={32} />
                        </IconButton>
                        <IconButton
                            sx={{
                                padding: 1,
                            }}
                            onClick={() => setNotificationsOpen(true)}
                        >
                            <IconifyIcon icon="ph:bell-bold" width={29} height={32} style={{ fontSize: 24 }} />
                        </IconButton>

                        <IconButton
                            sx={{
                                padding: 1,
                            }}
                            onClick={() => setMessageOpen(true)}
                        >
                            <IconifyIcon icon="mdi:message" width={29} height={32} />
                        </IconButton>
                    </Badge>
                    <UserDropdown />
                </Stack>
                <ThemeToggle />
            </Toolbar>

            {/* Drawer for Notifications */}
            <Drawer
                anchor="right"
                open={notificationsOpen}
                onClose={() => setNotificationsOpen(true)}
                PaperProps={{
                    sx: {
                        width: '300px',
                        '@media (min-width: 1024px)': {
                            width: '30%',
                        },
                    },
                }}
            >
                <IconButton
                    onClick={() => setNotificationsOpen(false)}
                    sx={{ alignSelf: 'flex-start', margin: 1 }}
                >
                    <IconifyIcon icon="ic:round-close" width={24} height={24} />
                </IconButton>
                <List>
                    {notifications.map((notification) => (
                        <ListItem key={notification.id}>
                            <ListItemText primary={notification.message} />
                        </ListItem>
                    ))}
                </List>
            </Drawer>

            {/* Drawer for Settings */}
            <Drawer
                anchor="right"
                open={settingsOpen}
                onClose={() => setSettingsOpen(true)}
                style={{ background: "transparent" }}
                PaperProps={{
                    sx: {
                        width: '300px',
                        '@media (min-width: 1024px)': {
                            width: '90%',
                        },
                    },
                }}
            >
                <IconButton
                    onClick={() => setSettingsOpen(false)}
                    sx={{ alignSelf: 'flex-start', margin: 2 }}
                >
                    <IconifyIcon icon="ic:round-close" width={24} height={24} />
                </IconButton>
                <Typography
                    variant="h6"
                    sx={{
                        textAlign: 'center',
                        margin: 2,
                        fontWeight: 'bold',
                    }}
                >
                    Settings
                </Typography>
                <List>
                    {settingsOptions.map((setting) => (
                        <ListItem key={setting.id}>
                            <ListItemText primary={setting.option} />
                        </ListItem>
                    ))}
                </List>
            </Drawer>

            {/* Drawer for Messages */}
            <Drawer
                anchor="right"
                open={messageOpen}
                onClose={() => setMessageOpen(true)}
                style={{ background: "transparent" }}
                PaperProps={{
                    sx: {
                        width: '300px',
                        '@media (min-width: 1024px)': {
                            width: '30%',
                        },
                    },
                }}
            >
                <IconButton
                    onClick={() => setMessageOpen(false)}
                    sx={{ alignSelf: 'flex-start', margin: 2 }}
                >
                    <IconifyIcon icon="ic:round-close" width={24} height={24} />
                </IconButton>
                <Typography
                    variant="h6"
                    sx={{
                        textAlign: 'center',
                        margin: 2,
                        fontWeight: 'bold',
                    }}
                >
                    Messages
                </Typography>
                <List>
                    {messagesOptions.map((message) => (
                        <ListItem key={message.id}>
                            <ListItemText primary={message.option} />
                        </ListItem>
                    ))}
                </List>
            </Drawer>
        </AppBar>
    );
};

export default Topbar;
