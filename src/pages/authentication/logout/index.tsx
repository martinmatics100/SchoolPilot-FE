// src/pages/authentication/logout/index.tsx
import { useEffect, useRef } from 'react';
import { Box, Paper, Stack, Typography, CircularProgress, Fade } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context';
import { useTheme } from '@mui/material/styles';
import IconifyIcon from '../../../components/base/iconifyIcon';
import paths from '../../../routes/paths';

const Logout = () => {
    const theme = useTheme();
    const { logout } = useAuth();
    const navigate = useNavigate();
    const hasNavigated = useRef(false); // Prevent multiple navigations


    // Add abort controller for cleanup
    useEffect(() => {
        const abortController = new AbortController();
        let isMounted = true;

        const performLogout = async () => {
            if (hasNavigated.current || !isMounted) return;

            try {
                await new Promise(resolve => setTimeout(resolve, 1500));

                if (!isMounted || abortController.signal.aborted) return;

                await logout();

                if (!isMounted || abortController.signal.aborted) return;

                if (!hasNavigated.current) {
                    hasNavigated.current = true;
                    navigate(paths.login, { replace: true });
                }
            } catch (error) {
                console.error('Logout error:', error);
                if (!hasNavigated.current && isMounted) {
                    hasNavigated.current = true;
                    navigate(paths.login, { replace: true });
                }
            }
        };

        performLogout();

        // Cleanup function
        return () => {
            isMounted = false;
            abortController.abort();
        };
    }, [logout, navigate]);

    useEffect(() => {
        const performLogout = async () => {
            // Prevent double execution
            if (hasNavigated.current) return;

            try {
                // Wait a moment to show the logout animation
                await new Promise(resolve => setTimeout(resolve, 1500));

                // Perform logout
                await logout();

                // Only navigate if not already navigated
                if (!hasNavigated.current) {
                    hasNavigated.current = true;
                    // Use replace to prevent going back to logout page
                    navigate(paths.login, { replace: true });
                }
            } catch (error) {
                console.error('Logout error:', error);
                // On error, still try to navigate to login
                if (!hasNavigated.current) {
                    hasNavigated.current = true;
                    navigate(paths.login, { replace: true });
                }
            }
        };

        performLogout();
    }, [logout, navigate]);

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            {/* Animated background elements */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: 300,
                    height: 300,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${theme.palette.common.white}10 0%, transparent 70%)`,
                    animation: 'pulse 3s ease-in-out infinite',
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: -80,
                    left: -80,
                    width: 400,
                    height: 400,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${theme.palette.common.white}10 0%, transparent 70%)`,
                    animation: 'pulse 3s ease-in-out infinite reverse',
                }}
            />

            <Fade in timeout={800}>
                <Paper
                    elevation={24}
                    sx={{
                        borderRadius: 6,
                        bgcolor: theme.palette.background.default,
                        p: { xs: 4, sm: 6 },
                        maxWidth: 450,
                        width: '90%',
                        textAlign: 'center',
                        position: 'relative',
                        zIndex: 1,
                        border: `1px solid ${theme.palette.divider}`,
                    }}
                >
                    <Stack spacing={4} alignItems="center">
                        {/* Animated Logout Icon */}
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: '50%',
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}20, ${theme.palette.secondary.main}20)`,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                animation: 'scaleIn 0.5s ease-out',
                            }}
                        >
                            <IconifyIcon
                                icon="solar:logout-2-bold-duotone"
                                width={48}
                                height={48}
                                sx={{
                                    color: theme.palette.primary.main,
                                    animation: 'float 2s ease-in-out infinite',
                                }}
                            />
                        </Box>

                        {/* Title */}
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 700,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                            }}
                        >
                            Signing Out
                        </Typography>

                        {/* Message */}
                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{ textAlign: 'center' }}
                        >
                            Please wait while we securely log you out...
                        </Typography>

                        {/* Progress */}
                        <Stack spacing={2} alignItems="center" sx={{ width: '100%' }}>
                            <CircularProgress
                                size={40}
                                thickness={4}
                                sx={{
                                    color: theme.palette.primary.main,
                                }}
                            />
                            <Typography
                                variant="caption"
                                color="text.disabled"
                                sx={{
                                    animation: 'pulse 1.5s ease-in-out infinite',
                                }}
                            >
                                Clearing session...
                            </Typography>
                        </Stack>

                        {/* Security Note */}
                        <Box
                            sx={{
                                mt: 2,
                                p: 1.5,
                                borderRadius: 2,
                                bgcolor: theme.palette.action.hover,
                                width: '100%',
                            }}
                        >
                            <Stack direction="row" spacing={1} alignItems="center" justifyContent="center">
                                <IconifyIcon
                                    icon="solar:shield-check-bold"
                                    width={16}
                                    height={16}
                                    sx={{ color: theme.palette.success.main }}
                                />
                                <Typography variant="caption" color="text.secondary">
                                    Your session is being securely terminated
                                </Typography>
                            </Stack>
                        </Box>
                    </Stack>
                </Paper>
            </Fade>

            <style>
                {`
                    @keyframes pulse {
                        0%, 100% { transform: scale(1); opacity: 0.5; }
                        50% { transform: scale(1.1); opacity: 0.8; }
                    }
                    @keyframes scaleIn {
                        from { transform: scale(0); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                    }
                    @keyframes float {
                        0%, 100% { transform: translateY(0px); }
                        50% { transform: translateY(-10px); }
                    }
                `}
            </style>
        </Box>
    );
};

export default Logout;