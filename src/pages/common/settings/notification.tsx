import React, { useState } from 'react';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Stack,
    Switch,
    FormControlLabel,
    Divider,
    Button,
    Chip,
    alpha,
    useTheme,
    Paper,
    IconButton,
    Tooltip,
    Collapse,
    Alert,
    Badge,
} from '@mui/material';
import IconifyIcon from '../../../components/base/iconifyIcon';

interface NotificationSetting {
    id: string;
    title: string;
    description: string;
    enabled: boolean;
    icon: string;
    color: string;
}

interface NotificationChannel {
    id: string;
    name: string;
    icon: string;
    enabled: boolean;
    description: string;
}

const NotificationsSettings = () => {
    const theme = useTheme();
    const [showSuccess, setShowSuccess] = useState(false);

    // School Notification Categories
    const [categories, setCategories] = useState<NotificationSetting[]>([
        {
            id: '1',
            title: 'System Updates',
            description: 'Maintenance schedules, new features, and system alerts',
            enabled: false,
            icon: 'mdi:update',
            color: theme.palette.secondary.main,
        },
        {
            id: '2',
            title: 'School Announcements',
            description: 'School-wide announcements and important news',
            enabled: true,
            icon: 'mdi:bullhorn-outline',
            color: theme.palette.warning.main,
        },
        {
            id: '3',
            title: 'Score Submissions',
            description: 'Get notified when teachers submit scores',
            enabled: true,
            icon: 'mdi:clipboard-check-outline',
            color: theme.palette.success.main,
        },
        {
            id: '4',
            title: 'Missing Scores',
            description: 'Know when students have missing scores',
            enabled: true,
            icon: 'mdi:alert-circle-outline',
            color: theme.palette.error.main,
        },
        {
            id: '5',
            title: 'Broadsheet Generation',
            description: 'Know when broadsheets are ready',
            enabled: true,
            icon: 'mdi:file-document-outline',
            color: theme.palette.primary.main,
        },
        {
            id: '6',
            title: 'Scores Complete',
            description: 'Get notified when all scores are in',
            enabled: true,
            icon: 'mdi:check-all',
            color: theme.palette.info.main,
        },
    ]);

    // SchoolPilot Notification Categories
    const [schoolPilotCategories, setSchoolPilotCategories] = useState<NotificationSetting[]>([
        {
            id: 'sp1',
            title: 'App Updates',
            description: 'Get notified when new app versions are available',
            enabled: true,
            icon: 'mdi:cellphone-arrow-down',
            color: theme.palette.primary.main,
        },
        {
            id: 'sp2',
            title: 'New Features',
            description: 'Stay informed about new features and improvements',
            enabled: true,
            icon: 'mdi:rocket-launch-outline',
            color: theme.palette.success.main,
        },
        {
            id: 'sp3',
            title: 'Maintenance Alerts',
            description: 'Know when the app is undergoing maintenance',
            enabled: true,
            icon: 'mdi:tools',
            color: theme.palette.warning.main,
        },
        {
            id: 'sp4',
            title: 'Product News',
            description: 'Get updates about SchoolPilot news and announcements',
            enabled: false,
            icon: 'mdi:newspaper-variant-outline',
            color: theme.palette.info.main,
        },
        {
            id: 'sp5',
            title: 'Security Alerts',
            description: 'Important security updates and recommendations',
            enabled: true,
            icon: 'mdi:shield-check-outline',
            color: theme.palette.error.main,
        },
    ]);

    // Notification channels
    const [channels, setChannels] = useState<NotificationChannel[]>([
        {
            id: '1',
            name: 'Email',
            icon: 'mdi:email-outline',
            enabled: true,
            description: 'Receive notifications via email',
        },
        {
            id: '2',
            name: 'Push Notification',
            icon: 'mdi:bell-outline',
            enabled: true,
            description: 'Receive notifications in-app',
        },
        {
            id: '3',
            name: 'SMS',
            icon: 'mdi:cellphone-message',
            enabled: false,
            description: 'Receive notifications via SMS',
        },
    ]);

    const [digest, setDigest] = useState({
        daily: false,
        weekly: true,
        monthly: false,
    });

    const handleToggleCategory = (id: string) => {
        setCategories(prev =>
            prev.map(item =>
                item.id === id ? { ...item, enabled: !item.enabled } : item
            )
        );
    };

    const handleToggleSchoolPilotCategory = (id: string) => {
        setSchoolPilotCategories(prev =>
            prev.map(item =>
                item.id === id ? { ...item, enabled: !item.enabled } : item
            )
        );
    };

    const handleToggleChannel = (id: string) => {
        setChannels(prev =>
            prev.map(item =>
                item.id === id ? { ...item, enabled: !item.enabled } : item
            )
        );
    };

    const handleDigestChange = (type: 'daily' | 'weekly' | 'monthly') => {
        setDigest(prev => ({
            ...prev,
            [type]: !prev[type],
        }));
    };

    const handleSave = () => {
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
    };

    const totalEnabled = categories.filter(c => c.enabled).length + schoolPilotCategories.filter(c => c.enabled).length;
    const totalChannels = channels.filter(c => c.enabled).length;
    const totalCategories = categories.length + schoolPilotCategories.length;

    return (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <IconifyIcon
                            icon="mdi:bell-outline"
                            width={24}
                            color={theme.palette.primary.main}
                        />
                    </Box>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                            fontSize: { xs: '1.25rem', sm: '1.5rem' },
                        }}
                    >
                        Notifications
                    </Typography>
                    <Badge
                        badgeContent={totalEnabled}
                        color="primary"
                        sx={{ ml: 1 }}
                    />
                </Box>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ ml: 7, fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                    Manage how you receive notifications
                </Typography>
            </Box>

            {/* Success Alert */}
            <Collapse in={showSuccess}>
                <Alert
                    severity="success"
                    sx={{
                        mb: 3,
                        borderRadius: 2,
                        '& .MuiAlert-icon': {
                            alignItems: 'center',
                        },
                    }}
                    onClose={() => setShowSuccess(false)}
                >
                    Notification preferences saved successfully!
                </Alert>
            </Collapse>

            {/* Summary Cards - Flexbox Layout */}
            <Box
                sx={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 2,
                    mb: 4,
                }}
            >
                {[
                    {
                        icon: 'mdi:bell-ring-outline',
                        label: 'Active Notifications',
                        value: `${totalEnabled} of ${totalCategories}`,
                        color: theme.palette.primary.main,
                    },
                    {
                        icon: 'mdi:share-variant',
                        label: 'Active Channels',
                        value: `${totalChannels} of ${channels.length}`,
                        color: theme.palette.info.main,
                    },
                    {
                        icon: 'mdi:clock-outline',
                        label: 'Digest Frequency',
                        value: digest.weekly ? 'Weekly' : digest.daily ? 'Daily' : 'Monthly',
                        color: theme.palette.success.main,
                    },
                ].map((item, index) => (
                    <Box
                        key={index}
                        sx={{
                            flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.33% - 11px)' },
                            minWidth: { xs: '100%', sm: '200px' },
                        }}
                    >
                        <Card
                            elevation={0}
                            sx={{
                                borderRadius: 3,
                                bgcolor: theme.palette.background.default,
                                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                                p: 2,
                                height: '100%',
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={2}>
                                <Box
                                    sx={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 2,
                                        bgcolor: alpha(item.color, 0.1),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <IconifyIcon
                                        icon={item.icon}
                                        width={20}
                                        color={item.color}
                                    />
                                </Box>
                                <Box>
                                    <Typography variant="caption" color="text.secondary">
                                        {item.label}
                                    </Typography>
                                    <Typography variant="h6" fontWeight={700}>
                                        {item.value}
                                    </Typography>
                                </Box>
                            </Stack>
                        </Card>
                    </Box>
                ))}
            </Box>

            {/* School Notifications Section */}
            <Typography
                variant="h6"
                sx={{
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    mb: 2,
                    mt: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                }}
            >
                <IconifyIcon icon="mdi:school-outline" width={24} color={theme.palette.primary.main} />
                School Notifications
            </Typography>
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3, ml: 4 }}
            >
                Notifications related to your school activities and operations
            </Typography>

            <Card
                elevation={0}
                sx={{
                    borderRadius: 3,
                    mb: 4,
                    bgcolor: theme.palette.background.default,
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        p: 3,
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 1,
                    }}
                >
                    <Typography variant="h6" fontWeight={600}>
                        Categories
                    </Typography>
                    <Chip
                        label={`${categories.filter(c => c.enabled).length} enabled`}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 500 }}
                    />
                </Box>

                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 2,
                        }}
                    >
                        {categories.map((category) => (
                            <Box
                                key={category.id}
                                sx={{
                                    flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' },
                                    minWidth: { xs: '100%', md: '200px' },
                                }}
                            >
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: alpha(theme.palette.background.default, 0.6),
                                        border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            borderColor: category.enabled
                                                ? alpha(category.color, 0.3)
                                                : alpha(theme.palette.divider, 0.2),
                                            bgcolor: category.enabled
                                                ? alpha(category.color, 0.02)
                                                : 'transparent',
                                        },
                                        height: '100%',
                                    }}
                                >
                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="flex-start"
                                        spacing={2}
                                    >
                                        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ flex: 1, minWidth: 0 }}>
                                            <Box
                                                sx={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: 2,
                                                    bgcolor: alpha(category.color, 0.1),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                    mt: 0.5,
                                                }}
                                            >
                                                <IconifyIcon
                                                    icon={category.icon}
                                                    width={18}
                                                    color={category.color}
                                                />
                                            </Box>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="body1" fontWeight={600}>
                                                    {category.title}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        fontSize: '0.8rem',
                                                        wordWrap: 'break-word',
                                                        overflowWrap: 'break-word',
                                                    }}
                                                >
                                                    {category.description}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={category.enabled}
                                                    onChange={() => handleToggleCategory(category.id)}
                                                    color="primary"
                                                    size="small"
                                                />
                                            }
                                            label=""
                                            sx={{ ml: 0, flexShrink: 0 }}
                                        />
                                    </Stack>
                                </Paper>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Card>

            {/* SchoolPilot Notifications Section */}
            <Typography
                variant="h6"
                sx={{
                    fontWeight: 700,
                    color: theme.palette.text.primary,
                    mb: 2,
                    mt: 4,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                }}
            >
                <IconifyIcon icon="mdi:rocket-outline" width={24} color={theme.palette.secondary.main} />
                SchoolPilot Notifications
            </Typography>
            <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 3, ml: 4 }}
            >
                Notifications about the SchoolPilot app, updates, and news
            </Typography>

            <Card
                elevation={0}
                sx={{
                    borderRadius: 3,
                    mb: 4,
                    bgcolor: theme.palette.background.default,
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        p: 3,
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        flexWrap: 'wrap',
                        gap: 1,
                    }}
                >
                    <Typography variant="h6" fontWeight={600}>
                        Categories
                    </Typography>
                    <Chip
                        label={`${schoolPilotCategories.filter(c => c.enabled).length} enabled`}
                        size="small"
                        color="secondary"
                        sx={{ fontWeight: 500 }}
                    />
                </Box>

                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 2,
                        }}
                    >
                        {schoolPilotCategories.map((category) => (
                            <Box
                                key={category.id}
                                sx={{
                                    flex: { xs: '1 1 100%', md: '1 1 calc(50% - 8px)' },
                                    minWidth: { xs: '100%', md: '200px' },
                                }}
                            >
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2,
                                        borderRadius: 2,
                                        bgcolor: alpha(theme.palette.background.default, 0.6),
                                        border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            borderColor: category.enabled
                                                ? alpha(category.color, 0.3)
                                                : alpha(theme.palette.divider, 0.2),
                                            bgcolor: category.enabled
                                                ? alpha(category.color, 0.02)
                                                : 'transparent',
                                        },
                                        height: '100%',
                                    }}
                                >
                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="flex-start"
                                        spacing={2}
                                    >
                                        <Stack direction="row" spacing={2} alignItems="flex-start" sx={{ flex: 1, minWidth: 0 }}>
                                            <Box
                                                sx={{
                                                    width: 36,
                                                    height: 36,
                                                    borderRadius: 2,
                                                    bgcolor: alpha(category.color, 0.1),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                    mt: 0.5,
                                                }}
                                            >
                                                <IconifyIcon
                                                    icon={category.icon}
                                                    width={18}
                                                    color={category.color}
                                                />
                                            </Box>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="body1" fontWeight={600}>
                                                    {category.title}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        fontSize: '0.8rem',
                                                        wordWrap: 'break-word',
                                                        overflowWrap: 'break-word',
                                                    }}
                                                >
                                                    {category.description}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={category.enabled}
                                                    onChange={() => handleToggleSchoolPilotCategory(category.id)}
                                                    color="secondary"
                                                    size="small"
                                                />
                                            }
                                            label=""
                                            sx={{ ml: 0, flexShrink: 0 }}
                                        />
                                    </Stack>
                                </Paper>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Card>

            {/* Notification Channels - Flexbox Layout */}
            <Card
                elevation={0}
                sx={{
                    borderRadius: 3,
                    mb: 4,
                    bgcolor: theme.palette.background.default,
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        p: 3,
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    }}
                >
                    <Typography variant="h6" fontWeight={600}>
                        Notification Channels
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Choose how you want to receive notifications
                    </Typography>
                </Box>

                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 2,
                        }}
                    >
                        {channels.map((channel) => (
                            <Box
                                key={channel.id}
                                sx={{
                                    flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 8px)', md: '1 1 calc(33.33% - 11px)' },
                                    minWidth: { xs: '100%', sm: '200px' },
                                }}
                            >
                                <Paper
                                    elevation={0}
                                    sx={{
                                        p: 2.5,
                                        borderRadius: 2,
                                        bgcolor: channel.enabled
                                            ? alpha(theme.palette.primary.main, 0.02)
                                            : theme.palette.background.default,
                                        border: `1px solid ${channel.enabled
                                            ? alpha(theme.palette.primary.main, 0.15)
                                            : alpha(theme.palette.divider, 0.06)}`,
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            borderColor: channel.enabled
                                                ? theme.palette.primary.main
                                                : alpha(theme.palette.divider, 0.2),
                                            transform: 'translateY(-2px)',
                                        },
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                    }}
                                >
                                    <Stack
                                        direction="row"
                                        justifyContent="space-between"
                                        alignItems="flex-start"
                                        spacing={2}
                                    >
                                        <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1, minWidth: 0 }}>
                                            <Box
                                                sx={{
                                                    width: 40,
                                                    height: 40,
                                                    borderRadius: 2,
                                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                <IconifyIcon
                                                    icon={channel.icon}
                                                    width={20}
                                                    color={theme.palette.primary.main}
                                                />
                                            </Box>
                                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                                <Typography variant="body1" fontWeight={600}>
                                                    {channel.name}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        fontSize: '0.8rem',
                                                        wordWrap: 'break-word',
                                                        overflowWrap: 'break-word',
                                                    }}
                                                >
                                                    {channel.description}
                                                </Typography>
                                            </Box>
                                        </Stack>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={channel.enabled}
                                                    onChange={() => handleToggleChannel(channel.id)}
                                                    color="primary"
                                                    size="small"
                                                />
                                            }
                                            label=""
                                            sx={{ ml: 0, flexShrink: 0 }}
                                        />
                                    </Stack>
                                </Paper>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Card>

            {/* Digest Settings - Flexbox Layout */}
            <Card
                elevation={0}
                sx={{
                    borderRadius: 3,
                    mb: 4,
                    bgcolor: theme.palette.background.default,
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    overflow: 'hidden',
                }}
            >
                <Box
                    sx={{
                        p: 3,
                        borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    }}
                >
                    <Typography variant="h6" fontWeight={600}>
                        Digest Settings
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Choose how often you want to receive notification summaries
                    </Typography>
                </Box>

                <Box sx={{ p: { xs: 2, sm: 3 } }}>
                    <Box
                        sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: 2,
                        }}
                    >
                        {[
                            { key: 'daily' as const, label: 'Daily', icon: 'mdi:calendar-today' },
                            { key: 'weekly' as const, label: 'Weekly', icon: 'mdi:calendar-week' },
                            { key: 'monthly' as const, label: 'Monthly', icon: 'mdi:calendar-month' },
                        ].map(({ key, label, icon }) => (
                            <Box
                                key={key}
                                sx={{
                                    flex: { xs: '1 1 100%', sm: '1 1 calc(33.33% - 11px)' },
                                    minWidth: { xs: '100%', sm: '150px' },
                                }}
                            >
                                <Paper
                                    elevation={0}
                                    onClick={() => handleDigestChange(key)}
                                    sx={{
                                        p: 2.5,
                                        borderRadius: 2,
                                        cursor: 'pointer',
                                        border: `2px solid ${digest[key]
                                            ? theme.palette.primary.main
                                            : alpha(theme.palette.divider, 0.1)
                                            }`,
                                        bgcolor: digest[key]
                                            ? alpha(theme.palette.primary.main, 0.04)
                                            : theme.palette.background.default,
                                        transition: 'all 0.2s ease',
                                        '&:hover': {
                                            borderColor: digest[key]
                                                ? theme.palette.primary.main
                                                : alpha(theme.palette.primary.main, 0.3),
                                            transform: 'translateY(-2px)',
                                        },
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: 2,
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" spacing={2}>
                                        <Box
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                borderRadius: 1.5,
                                                bgcolor: digest[key]
                                                    ? alpha(theme.palette.primary.main, 0.1)
                                                    : alpha(theme.palette.divider, 0.05),
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                            }}
                                        >
                                            <IconifyIcon
                                                icon={icon}
                                                width={20}
                                                color={digest[key]
                                                    ? theme.palette.primary.main
                                                    : theme.palette.text.secondary
                                                }
                                            />
                                        </Box>
                                        <Typography
                                            variant="body2"
                                            fontWeight={digest[key] ? 600 : 400}
                                            color={digest[key] ? theme.palette.primary.main : theme.palette.text.secondary}
                                        >
                                            {label}
                                        </Typography>
                                    </Stack>
                                    {digest[key] && (
                                        <IconifyIcon
                                            icon="mdi:check-circle"
                                            width={20}
                                            color={theme.palette.primary.main}
                                        />
                                    )}
                                </Paper>
                            </Box>
                        ))}
                    </Box>
                </Box>
            </Card>

            {/* Save Button */}
            <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    startIcon={<IconifyIcon icon="mdi:content-save-outline" width={20} />}
                    sx={{
                        py: 1.5,
                        px: 4,
                        borderRadius: 2,
                        textTransform: 'none',
                        fontWeight: 600,
                        fontSize: '1rem',
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                        '&:hover': {
                            background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                        },
                        width: { xs: '100%', sm: 'auto' },
                    }}
                >
                    Save Preferences
                </Button>
            </Box>
        </Box>
    );
};

export default NotificationsSettings;