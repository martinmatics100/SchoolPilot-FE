import {
    Box,
    Paper,
    Stack,
    Button,
    Typography,
    CircularProgress,
    alpha,
    useMediaQuery,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import paths from '../../../routes/paths';
import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import { useAuth } from '../../../context';
import IconifyIcon from '../../../components/base/iconifyIcon';

const LoginSuccess = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const { logout } = useAuth();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setMounted(true), 50);
        return () => clearTimeout(t);
    }, []);

    // Prevent browser back/forward navigation
    useEffect(() => {
        const handleBackButton = () => {
            window.history.pushState(null, '', window.location.pathname);
        };

        window.history.pushState(null, '', window.location.pathname);
        window.addEventListener('popstate', handleBackButton);
        window.history.pushState(null, '', window.location.pathname);

        return () => {
            window.removeEventListener('popstate', handleBackButton);
        };
    }, []);

    const [isCancelling, setIsCancelling] = useState(false);

    const handleOk = () => {
        window.history.replaceState(null, '', paths.home);
        navigate(paths.home, { replace: true });
    };

    const handleCancel = async () => {
        if (isCancelling) return;
        setIsCancelling(true);
        try {
            await logout();
        } catch (err) {
            console.error('Logout on cancel failed:', err);
        } finally {
            window.history.replaceState(null, '', paths.login);
            navigate(paths.login, { replace: true });
        }
    };

    // Staggered fade + slide up helper
    const animate = (delay: number) => ({
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(20px)',
        transition: `opacity 0.6s ease ${delay}s, transform 0.6s ease ${delay}s`,
    });

    return (
        <Box
            sx={{
                minHeight: '100vh',
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'hidden',
                p: { xs: 2, sm: 3 },

                // ✅ Now using theme background.default
                bgcolor: theme.palette.background.default,

                // Soft brand-tinted glows
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: '-15%',
                    right: '-10%',
                    width: { xs: 260, sm: 380, md: 500 },
                    height: { xs: 260, sm: 380, md: 500 },
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(
                        theme.palette.success.light,
                        0.2,
                    )} 0%, transparent 70%)`,
                    pointerEvents: 'none',
                    animation: 'float 8s ease-in-out infinite',
                    '@keyframes float': {
                        '0%,100%': { transform: 'translateY(0px)' },
                        '50%': { transform: 'translateY(25px)' },
                    },
                },
                '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: '-15%',
                    left: '-10%',
                    width: { xs: 240, sm: 340, md: 460 },
                    height: { xs: 240, sm: 340, md: 460 },
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(
                        theme.palette.primary.light,
                        0.18,
                    )} 0%, transparent 70%)`,
                    pointerEvents: 'none',
                    animation: 'float2 10s ease-in-out infinite',
                    '@keyframes float2': {
                        '0%,100%': { transform: 'translateY(0px)' },
                        '50%': { transform: 'translateY(-25px)' },
                    },
                },
            }}
        >
            <Paper
                elevation={0}
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    py: { xs: 5, sm: 6, md: 7 },
                    px: { xs: 3, sm: 5, md: 6 },
                    maxWidth: 520,
                    width: '100%',
                    textAlign: 'center',
                    borderRadius: { xs: 3, sm: 5, md: 6 },

                    // Card contrasts against background.default
                    bgcolor: alpha(theme.palette.common.white, 0.75),
                    backdropFilter: 'blur(24px) saturate(180%)',
                    WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                    border: `1px solid ${alpha(theme.palette.text.primary, 0.08)}`,
                    boxShadow: `0 25px 60px ${alpha('#000', 0.15)}`,

                    // Card entrance
                    opacity: mounted ? 1 : 0,
                    transform: mounted
                        ? 'translateY(0) scale(1)'
                        : 'translateY(30px) scale(0.96)',
                    transition: 'opacity 0.5s ease, transform 0.5s ease',

                    // Animated top bar
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        borderTopLeftRadius: 'inherit',
                        borderTopRightRadius: 'inherit',
                        background: `linear-gradient(90deg, ${theme.palette.success.main}, ${theme.palette.primary.main}, ${theme.palette.success.main})`,
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 4s linear infinite',
                        '@keyframes shimmer': {
                            '0%': { backgroundPosition: '0% 0%' },
                            '100%': { backgroundPosition: '200% 0%' },
                        },
                    },
                }}
            >
                <Stack gap={{ xs: 3, sm: 3.5 }} alignItems="center">

                    {/* ── Success Icon ─────────────────────────────── */}
                    <Box
                        sx={{
                            width: { xs: 88, sm: 104 },
                            height: { xs: 88, sm: 104 },
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                            boxShadow: `0 15px 40px ${alpha(
                                theme.palette.success.main,
                                0.45,
                            )}`,
                            position: 'relative',

                            opacity: mounted ? 1 : 0,
                            transform: mounted ? 'scale(1)' : 'scale(0.3)',
                            transition:
                                'opacity 0.5s ease 0.15s, transform 0.7s cubic-bezier(0.34, 1.56, 0.64, 1) 0.15s',

                            '&::after': {
                                content: '""',
                                position: 'absolute',
                                inset: -8,
                                borderRadius: '50%',
                                border: `2px solid ${alpha(
                                    theme.palette.success.main,
                                    0.4,
                                )}`,
                                animation: 'pulse 2s ease-out infinite 1s',
                                '@keyframes pulse': {
                                    '0%': {
                                        transform: 'scale(0.95)',
                                        opacity: 0.9,
                                    },
                                    '100%': {
                                        transform: 'scale(1.35)',
                                        opacity: 0,
                                    },
                                },
                            },
                        }}
                    >
                        <IconifyIcon
                            icon="mdi:check-bold"
                            color={theme.palette.common.white}
                            width={isMobile ? 44 : 52}
                        />
                    </Box>

                    {/* ── Title + welcome text ─────────────────────── */}
                    <Box sx={animate(0.35)}>
                        <Typography
                            variant="h4"
                            sx={{
                                fontWeight: 800,
                                background: `linear-gradient(135deg, ${theme.palette.success.dark} 0%, ${theme.palette.primary.main} 100%)`,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                mb: 1,
                                fontSize: {
                                    xs: '1.5rem',
                                    sm: '1.75rem',
                                    md: '2rem',
                                },
                                letterSpacing: '-0.02em',
                            }}
                        >
                            You're logged in!
                        </Typography>

                        <Typography
                            variant="body1"
                            color="text.secondary"
                            sx={{
                                fontSize: { xs: '0.875rem', sm: '0.95rem' },
                                lineHeight: 1.6,
                                maxWidth: 380,
                                mx: 'auto',
                            }}
                        >
                            Welcome to <strong>SchoolPilot</strong>. Now you can
                            take attendance, add results, and manage your school
                            in one place.
                        </Typography>
                    </Box>

                    {/* ── Hint ─────────────────────────────────────── */}
                    <Typography
                        variant="body2"
                        sx={{
                            fontSize: { xs: '0.8rem', sm: '0.875rem' },
                            fontWeight: 500,
                            display: 'flex',
                            alignItems: 'center',
                            gap: 0.75,
                            justifyContent: 'center',
                            color: theme.palette.text.secondary,
                            ...animate(0.5),
                        }}
                    >
                        <IconifyIcon
                            icon="mdi:arrow-right-circle-outline"
                            width={18}
                            color={theme.palette.primary.main}
                        />
                        Tap <strong>Continue</strong> to open your dashboard
                    </Typography>

                    {/* ── Buttons ──────────────────────────────────── */}
                    <Stack
                        direction={{ xs: 'column-reverse', sm: 'row' }}
                        gap={2}
                        justifyContent="center"
                        sx={{ mt: 1, width: '100%', ...animate(0.65) }}
                    >
                        <Button
                            variant="outlined"
                            onClick={handleCancel}
                            disabled={isCancelling}
                            startIcon={
                                isCancelling ? (
                                    <CircularProgress size={16} color="inherit" />
                                ) : (
                                    <IconifyIcon icon="mdi:close" width={18} />
                                )
                            }
                            sx={{
                                minWidth: { xs: '100%', sm: 130 },
                                py: 1.25,
                                borderRadius: '12px',
                                fontWeight: 600,
                                textTransform: 'none',
                                fontSize: { xs: '0.875rem', sm: '0.95rem' },
                                borderColor: alpha(theme.palette.text.primary, 0.15),
                                color: theme.palette.text.secondary,
                                transition: 'all 0.25s ease',
                                '&:hover': {
                                    borderColor: theme.palette.error.main,
                                    color: theme.palette.error.main,
                                    bgcolor: alpha(theme.palette.error.main, 0.06),
                                    transform: 'translateY(-2px)',
                                },
                            }}
                        >
                            {isCancelling ? 'Cancelling...' : 'Cancel'}
                        </Button>

                        <Button
                            variant="contained"
                            onClick={handleOk}
                            disabled={isCancelling}
                            endIcon={
                                <IconifyIcon icon="mdi:arrow-right" width={18} />
                            }
                            sx={{
                                minWidth: { xs: '100%', sm: 130 },
                                py: 1.25,
                                borderRadius: '12px',
                                fontWeight: 700,
                                textTransform: 'none',
                                fontSize: { xs: '0.875rem', sm: '0.95rem' },
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                boxShadow: `0 10px 30px ${alpha(
                                    theme.palette.primary.main,
                                    0.35,
                                )}`,
                                transition: 'all 0.25s ease',
                                '&:hover': {
                                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 14px 36px ${alpha(
                                        theme.palette.primary.main,
                                        0.5,
                                    )}`,
                                },
                                '&:active': { transform: 'translateY(0)' },
                            }}
                        >
                            Continue
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
        </Box>
    );
};

export default LoginSuccess;