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
  Box,
  Collapse,
  Divider,
} from "@mui/material";

import IconifyIcon from "../../../components/base/iconifyIcon";
import { type ReactElement, useState, useEffect } from "react";
import UserDropdown from "./userDropdown";
import { useBreakpoints } from "../../../providers/breakPointsProvider";
import { drawerOpenWidth, drawerCloseWidth } from "..";
import { useTheme } from "@mui/material/styles";
import ThemeToggle from "../../../theme/theme-toggle";
import { useAuth } from "../../../context";
import {
  getGreeting,
  formatNigeriaDateTime,
  getNigeriaNow,
} from "../../../helpers/dateTimeHelpers";

const Topbar = ({
  open,
  handleDrawerToggle,
}: {
  open: boolean;
  handleDrawerToggle: () => void;
}): ReactElement => {
  const { down } = useBreakpoints();
  const isMobileScreen = down("sm");
  const theme = useTheme();

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const {
    selectedAccount,
    accounts,
    selectedBranches,
    userEmail,
    isAuthenticated,
    currentUser,
  } = useAuth();

  const [now, setNow] = useState<Date>(getNigeriaNow());

  const selectedAccountData = accounts.find(
    (account) => account.id === selectedAccount
  );

  const notifications = [
    { id: 1, message: "New comment on your post" },
    { id: 2, message: "Your order has been shipped" },
    { id: 3, message: "You have a new follower" },
  ];

  const settingsOptions = [
    { id: 1, option: "Account Settings" },
    { id: 2, option: "Privacy Settings" },
    { id: 3, option: "Notification Settings" },
  ];

  const messagesOptions = [
    { id: 1, option: "This is some awesome thinking!" },
    { id: 2, option: "What terrific math skills you are showing!" },
    { id: 3, option: "You are an amazing writer!" },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(getNigeriaNow());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.more-menu-button') && !target.closest('.more-menu-panel')) {
        setShowMoreMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  // Primary items (always visible on mobile)
  const primaryItems = () => (
    <Stack direction="row" gap={1.5} alignItems="center">
      <ThemeToggle />
      <UserDropdown />
    </Stack>
  );

  // Secondary items (shown in collapsed menu on mobile)
  const SecondaryMenu = () => (
    <Collapse in={showMoreMenu} timeout="auto">
      <Box
        className="more-menu-panel"
        sx={{
          position: 'absolute',
          top: '100%',
          right: 0,
          mt: 1,
          width: '280px',
          bgcolor: theme.palette.background.default,
          borderColor: theme.palette.background.paper,
          borderRadius: 2,
          boxShadow: theme.shadows[3],
          zIndex: 1300,
          overflow: 'hidden',
        }}
      >
        {/* User Info Section */}
        {currentUser && (
          <Box sx={{ p: 2, bgcolor: theme.palette.background.default }}>
            <Typography fontWeight="bold" color={theme.palette.text.primary}>
              {getGreeting(now)}, {currentUser.firstName}
            </Typography>
            <Typography variant="caption" color={theme.palette.text.secondary}>
              {formatNigeriaDateTime(now)}
            </Typography>
          </Box>
        )}

        <Divider />

        {/* Notifications */}
        <ListItem
          component="div"
          sx={{ cursor: 'pointer' }}
          onClick={() => {
            setShowMoreMenu(false);
            setNotificationsOpen(true);
          }}
        >
          <ListItemText primary="Notifications" />
          <Badge color="error" variant="dot" />
        </ListItem>

        {/* Messages */}
        <ListItem
          component="div"
          sx={{ cursor: 'pointer' }}
          onClick={() => {
            setShowMoreMenu(false);
            setMessageOpen(true);
          }}
        >
          <ListItemText primary="Messages" />
        </ListItem>

        {/* Settings */}
        <ListItem
          component="div"
          sx={{ cursor: 'pointer' }}
          onClick={() => {
            setShowMoreMenu(false);
            setSettingsOpen(true);
          }}
        >
          <ListItemText primary="Settings" />
        </ListItem>

        {/* Account Info (if needed) */}
        {selectedAccountData && (
          <>
            <Divider />
            <Box sx={{ p: 2 }}>
              <Typography variant="caption" color={theme.palette.text.secondary}>
                {selectedAccountData.name}
              </Typography>
            </Box>
          </>
        )}
      </Box>
    </Collapse>
  );

  return (
    <>
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
          paddingRight: "0 !important",
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
            height: { xs: 70, sm: 116 },
            position: 'relative',
          }}
        >
          {/* Left side - Menu button */}
          <Stack
            direction="row"
            gap={2}
            alignItems="center"
            ml={2.5}
            flex="1 1 auto"
          >
            <IconButton
              aria-label="open drawer"
              onClick={handleDrawerToggle}
              edge="start"
            >
              <IconifyIcon
                icon={open ? "ri:menu-unfold-4-line" : "ri:menu-unfold-3-line"}
                color={theme.palette.common.white}
              />
            </IconButton>
          </Stack>

          {/* Right side - Responsive items */}
          <Stack
            direction="row"
            gap={{ xs: 1, sm: 3.75 }}
            alignItems="center"
            justifyContent="flex-end"
            mr={{ xs: 1.5, sm: 3.75 }}
            flex="1 1 auto"
          >
            {!isMobileScreen ? (
              // Desktop view - show everything
              <>
                {currentUser && (
                  <Stack
                    spacing={0}
                    alignItems="flex-end"
                  >
                    <Typography
                      fontWeight="bold"
                      sx={{ fontSize: "0.95rem", whiteSpace: "nowrap" }}
                      color={theme.palette.text.secondary}
                    >
                      <span style={{ color: theme.palette.error.main }}>
                        {getGreeting(now)}
                      </span>
                      , {currentUser.firstName}
                    </Typography>
                    <Typography
                      sx={{ fontSize: "0.75rem", whiteSpace: "nowrap" }}
                      color={theme.palette.text.secondary}
                    >
                      {formatNigeriaDateTime(now)}
                    </Typography>
                  </Stack>
                )}

                <Badge
                  color="error"
                  badgeContent=" "
                  variant="dot"
                  sx={{ "& .MuiBadge-badge": { top: 11, right: 11 } }}
                >
                  <IconButton onClick={() => setSettingsOpen(true)}>
                    <IconifyIcon icon="ic:round-settings" width={29} height={32} />
                  </IconButton>
                  <IconButton onClick={() => setNotificationsOpen(true)}>
                    <IconifyIcon icon="ph:bell-bold" width={29} height={32} />
                  </IconButton>
                  <IconButton onClick={() => setMessageOpen(true)}>
                    <IconifyIcon icon="mdi:message" width={29} height={32} />
                  </IconButton>
                </Badge>
                <ThemeToggle />
                <UserDropdown />
              </>
            ) : (
              // Mobile view - show only theme toggle, user dropdown, and more button
              <>
                {primaryItems()}

                {/* More Menu Button */}
                  <IconButton 
                    className="more-menu-button"
                    onClick={() => setShowMoreMenu(!showMoreMenu)}
                    sx={{ ml: 1 }}
                  >
                    <IconifyIcon 
                      icon={showMoreMenu ? "mdi:close" : "mdi:dots-vertical"}
                      width={24}
                      height={24}
                    />
                  </IconButton>
              </>
            )}
          </Stack>
        </Toolbar>

        {/* Secondary Mini Topbar - Mobile only */}
        {isMobileScreen && showMoreMenu && <SecondaryMenu />}
      </AppBar>

      {/* Drawer for Notifications */}
      <Drawer
        anchor="right"
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        PaperProps={{
          sx: {
            width: "300px",
            "@media (min-width: 1024px)": {
              width: "30%",
            },
          },
        }}
      >
        <IconButton
          onClick={() => setNotificationsOpen(false)}
          sx={{ alignSelf: "flex-start", margin: 1 }}
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
        onClose={() => setSettingsOpen(false)}
        PaperProps={{
          sx: {
            width: "300px",
            "@media (min-width: 1024px)": {
              width: "30%",
            },
          },
        }}
      >
        <IconButton
          onClick={() => setSettingsOpen(false)}
          sx={{ alignSelf: "flex-start", margin: 2 }}
        >
          <IconifyIcon icon="ic:round-close" width={24} height={24} />
        </IconButton>
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            margin: 2,
            fontWeight: "bold",
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
        onClose={() => setMessageOpen(false)}
        PaperProps={{
          sx: {
            width: "300px",
            "@media (min-width: 1024px)": {
              width: "30%",
            },
          },
        }}
      >
        <IconButton
          onClick={() => setMessageOpen(false)}
          sx={{ alignSelf: "flex-start", margin: 2 }}
        >
          <IconifyIcon icon="ic:round-close" width={24} height={24} />
        </IconButton>
        <Typography
          variant="h6"
          sx={{
            textAlign: "center",
            margin: 2,
            fontWeight: "bold",
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
    </>
  );
};

export default Topbar;