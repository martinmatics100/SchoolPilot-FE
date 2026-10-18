import React from 'react';
import {
    Box,
    Paper,
    Typography,
    Stack,
    Card,
    CardContent,
    alpha,
    useTheme,
    Avatar,
    Chip,
    Divider,
} from '@mui/material';
import { useAuth } from '../../../context';
import IconifyIcon from '../../../components/base/iconifyIcon';

const SuperAdminDashboard = () => {
    const theme = useTheme();
    const { userEmail, role } = useAuth();

    const stats = [
        {
            label: 'Total Schools',
            value: '—',
            icon: 'mdi:school-outline',
            color: theme.palette.primary.main,
        },
        {
            label: 'Active Accounts',
            value: '—',
            icon: 'mdi:account-multiple-outline',
            color: theme.palette.secondary.main,
        },
        {
            label: 'Suspended Schools',
            value: '—',
            icon: 'mdi:school-off-outline',
            color: theme.palette.warning.main,
        },
        {
            label: 'Platform Users',
            value: '—',
            icon: 'mdi:account-group-outline',
            color: theme.palette.success.main,
        },
    ];

    return (
        <Box
            sx={{
                p: { xs: 2, sm: 3, md: 4 },
                bgcolor: theme.palette.background.default,
                minHeight: '85vh',
            }}
        >
            {/* ── Header ────────────────────────────────────── */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 3, md: 4 },
                    borderRadius: 4,
                    bgcolor: theme.palette.background.paper,
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                    background: `linear-gradient(135deg, ${alpha(
                        theme.palette.background.paper,
                        0.08,
                    )} 0%, ${alpha(theme.palette.secondary.main, 0.08)} 100%)`,
                    mb: 3,
                }}
            >
                <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={3}
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                    justifyContent="space-between"
                >
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                            sx={{
                                width: 64,
                                height: 64,
                                bgcolor: alpha(theme.palette.primary.main, 0.15),
                                color: theme.palette.text.secondary,
                            }}
                        >
                            <IconifyIcon
                                icon="mdi:shield-crown-outline"
                                width={32}
                            />
                        </Avatar>
                        <Box>
                            <Typography
                                variant="h4"
                                sx={{
                                    fontWeight: 800,
                                    fontSize: { xs: '1.5rem', sm: '1.85rem' },
                                    color: theme.palette.text.secondary,
                                }}
                            >
                                Platform Overview
                            </Typography>
                            <Typography
                                variant="body2"
                                color="text.secondary"
                                sx={{ mt: 0.5 }}
                            >
                                Welcome back{userEmail ? `, ${userEmail}` : ''}.
                                Manage every school on SchoolPilot from here.
                            </Typography>
                        </Box>
                    </Stack>

                    <Chip
                        icon={
                            <IconifyIcon
                                icon="mdi:shield-check-outline"
                                width={16}
                            />
                        }
                        label={role ?? 'SuperAdmin'}
                        sx={{
                            bgcolor: alpha(theme.palette.background.default, 0.12),
                            color: theme.palette.text.secondary,
                            fontWeight: 700,
                            borderRadius: 2,
                            px: 1,
                            height: 32,
                        }}
                    />
                </Stack>
            </Paper>

            {/* ── Quick stats ───────────────────────────────── */}
            <Box
                sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                        xs: '1fr',
                        sm: 'repeat(2, 1fr)',
                        md: 'repeat(4, 1fr)',
                    },
                    gap: 2,
                    mb: 3,
                }}
            >
                {stats.map((stat) => (
                    <Card
                        key={stat.label}
                        elevation={0}
                        sx={{
                            borderRadius: 3,
                            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                            bgcolor: theme.palette.background.default,
                            transition: 'all 0.2s ease',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: `0 8px 24px ${alpha(
                                    theme.palette.common.black,
                                    0.08,
                                )}`,
                            },
                        }}
                    >
                        <CardContent>
                            <Stack
                                direction="row"
                                alignItems="center"
                                justifyContent="space-between"
                            >
                                <Box>
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{
                                            fontWeight: 600,
                                            textTransform: 'uppercase',
                                            letterSpacing: 0.8,
                                            fontSize: '0.7rem',
                                        }}
                                    >
                                        {stat.label}
                                    </Typography>
                                    <Typography
                                        variant="h4"
                                        sx={{
                                            fontWeight: 800,
                                            color: theme.palette.text.primary,
                                            mt: 0.5,
                                        }}
                                    >
                                        {stat.value}
                                    </Typography>
                                </Box>
                                <Box
                                    sx={{
                                        width: 44,
                                        height: 44,
                                        borderRadius: 2,
                                        bgcolor: alpha(stat.color, 0.1),
                                        color: stat.color,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    <IconifyIcon icon={stat.icon} width={22} />
                                </Box>
                            </Stack>
                        </CardContent>
                    </Card>
                ))}
            </Box>

            {/* ── Coming soon ───────────────────────────────── */}
            <Paper
                elevation={0}
                sx={{
                    p: 4,
                    borderRadius: 4,
                    bgcolor: theme.palette.background.default,
                    border: `1px dashed ${alpha(theme.palette.divider, 0.4)}`,
                    textAlign: 'center',
                }}
            >
                <Box
                    sx={{
                        width: 64,
                        height: 64,
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                        color: theme.palette.primary.main,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                    }}
                >
                    <IconifyIcon icon="mdi:tools" width={30} />
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                    Platform tools are on the way
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 480, mx: 'auto' }}>
                    School management, account oversight, and audit views will
                    appear here. Use the sidebar to explore what's available.
                </Typography>
                <Divider sx={{ my: 3, maxWidth: 320, mx: 'auto' }} />
                <Typography variant="caption" color="text.disabled">
                    Logged in as SuperAdmin
                </Typography>
            </Paper>
        </Box>
    );
};

export default SuperAdminDashboard;