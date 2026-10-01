import {
    Box,
    Link,
    Paper,
    Stack,
    Button,
    Divider,
    Checkbox,
    TextField,
    IconButton,
    Typography,
    InputAdornment,
    FormControlLabel,
    CircularProgress,
    Container,
    Fade,
    useMediaQuery,
    alpha,
    Avatar,
    Tooltip,
} from '@mui/material';
import IconifyIcon from '../../../components/base/iconifyIcon';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { rootPaths } from '../../../routes/paths';
import Image from '../../../components/base/image';
import logoWithText from '../../../assets/palmfitLogoWithText.png';
import { useAuth } from '../../../context';
import paths from '../../../routes/paths';
import MessageDisplay from '../../../components/message-display';
import { type MessageDisplayProps } from '../../../components/message-display';
import { useTheme } from '@mui/material';
import PasswordResetModal from '../passwordResetModal/index';

// ─── Validation ────────────────────────────────────────────────────────────
const validateEmail = (email: string): string | null => {
    if (!email.trim()) return 'Email is required';
    const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Please enter a valid email address';
    return null;
};

const validatePassword = (password: string): string | null => {
    if (!password) return 'Password is required';
    if (password.length < 6) return 'Password must be at least 6 characters';
    return null;
};

// ─── Social Links Config ───────────────────────────────────────────────────
const SOCIAL_LINKS = [
    { label: 'Facebook', icon: 'mdi:facebook', color: '#1877F2', href: '#' },
    { label: 'Twitter', icon: 'mdi:twitter', color: '#1DA1F2', href: '#' },
    { label: 'LinkedIn', icon: 'mdi:linkedin', color: '#0A66C2', href: '#' },
    { label: 'YouTube', icon: 'mdi:youtube', color: '#FF0000', href: '#' },
    { label: 'Instagram', icon: 'mdi:instagram', color: '#E4405F', href: '#' },
];

const Login = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));

    const { login } = useAuth();
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [messageProps, setMessageProps] = useState<Partial<MessageDisplayProps> | null>(null);
    const [resetModalOpen, setResetModalOpen] = useState(false);

    const [touched, setTouched] = useState({ email: false, password: false });
    const [errors, setErrors] = useState({ email: '', password: '' });

    // ── Validation helpers ────────────────────────────────────────────────
    const validateField = (field: 'email' | 'password', value: string) => {
        const error =
            field === 'email' ? validateEmail(value) : validatePassword(value);
        setErrors((prev) => ({ ...prev, [field]: error || '' }));
        return !error;
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setEmail(value);
        if (touched.email) validateField('email', value);
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setPassword(value);
        if (touched.password) validateField('password', value);
    };

    const handleBlur = (field: 'email' | 'password') => {
        setTouched((prev) => ({ ...prev, [field]: true }));
        validateField(field, field === 'email' ? email : password);
    };

    const isFormValid = (): boolean => {
        const emailError = validateEmail(email);
        const passwordError = validatePassword(password);
        setErrors({ email: emailError || '', password: passwordError || '' });
        return !emailError && !passwordError;
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setTouched({ email: true, password: true });

        if (!isFormValid()) {
            setMessageProps({
                feMessage: 'Please fix the errors before submitting',
                httpStatus: 400,
            });
            return;
        }

        setLoading(true);
        setMessageProps(null);

        try {
            const result = await login(email, password);
            if (result.success) {
                setMessageProps({
                    beMessage: result.message || 'Login successful',
                    httpStatus: result.status,
                });
                setTimeout(() => {
                    navigate('/authentication/welcome', { replace: true });
                }, 1500);
            } else {
                setMessageProps({
                    feMessage: result.message || 'Login failed. Please check your credentials.',
                    httpStatus: result.status,
                });
            }
        } catch (err) {
            let errorMsg = 'An unexpected error occurred.';
            if (err instanceof Error) errorMsg = err.message;
            else if (typeof err === 'string') errorMsg = err;
            setMessageProps({ beMessage: errorMsg, httpStatus: 400 });
        } finally {
            setLoading(false);
        }
    };

    const handleClickShowPassword = () => setShowPassword((p) => !p);
    const handleOpenResetModal = (e: React.MouseEvent) => {
        e.preventDefault();
        setResetModalOpen(true);
    };
    const handleCloseResetModal = () => setResetModalOpen(false);

    // ── Styles ────────────────────────────────────────────────────────────
    const gradientBackground = `linear-gradient(135deg, ${alpha(
        theme.palette.primary.dark,
        0.95,
    )} 0%, ${alpha(theme.palette.secondary.dark, 0.85)} 100%)`;

    const inputStyles = (hasError: boolean) => ({
        '& .MuiFilledInput-root': {
            bgcolor: alpha(theme.palette.background.default, 0.6),
            backdropFilter: 'blur(10px)',
            borderRadius: '14px',
            transition: 'all 0.25s ease',
            '&:hover': {
                bgcolor: alpha(theme.palette.background.default, 0.8),
                transform: 'translateY(-1px)',
            },
            '&.Mui-focused': {
                bgcolor: alpha(theme.palette.background.default, 0.95),
                transform: 'translateY(-1px)',
                boxShadow: `0 0 0 3px ${alpha(
                    hasError ? theme.palette.error.main : theme.palette.primary.main,
                    0.15,
                )}`,
            },
            ...(hasError && {
                border: `1px solid ${theme.palette.error.main}`,
            }),
        },
        '& .MuiInputLabel-root': {
            color: hasError ? theme.palette.error.main : theme.palette.text.secondary,
            fontWeight: 500,
            '&.Mui-focused': {
                color: hasError ? theme.palette.error.main : theme.palette.primary.main,
            },
        },
        '& .MuiFilledInput-input': {
            color: theme.palette.text.primary,
            padding: '16px 16px',
            fontSize: { xs: '0.9rem', sm: '0.95rem' },
        },
        '& .MuiFormHelperText-root': {
            color: theme.palette.error.main,
            marginLeft: 0,
            fontWeight: 500,
        },
    });

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: gradientBackground,
                position: 'relative',
                overflow: 'hidden',
                py: { xs: 3, sm: 4, md: 6 },
                px: { xs: 2, sm: 3, md: 4 },
            }}
        >
            {/* Decorative blobs */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -60,
                    right: -60,
                    width: { xs: 180, sm: 280, md: 400 },
                    height: { xs: 180, sm: 280, md: 400 },
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(
                        theme.palette.primary.light,
                        0.35,
                    )} 0%, transparent 70%)`,
                    zIndex: 0,
                    animation: 'float 8s ease-in-out infinite',
                    '@keyframes float': {
                        '0%,100%': { transform: 'translateY(0px)' },
                        '50%': { transform: 'translateY(20px)' },
                    },
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: -80,
                    left: -80,
                    width: { xs: 220, sm: 340, md: 460 },
                    height: { xs: 220, sm: 340, md: 460 },
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(
                        theme.palette.secondary.light,
                        0.3,
                    )} 0%, transparent 70%)`,
                    zIndex: 0,
                    animation: 'float2 10s ease-in-out infinite',
                    '@keyframes float2': {
                        '0%,100%': { transform: 'translateY(0px)' },
                        '50%': { transform: 'translateY(-25px)' },
                    },
                }}
            />

            <Container
                maxWidth="sm"
                sx={{
                    position: 'relative',
                    zIndex: 1,
                    p: 0,
                    width: '100%',
                }}
            >
                <Fade in timeout={800}>
                    <Paper
                        elevation={24}
                        sx={{
                            borderRadius: { xs: 3, sm: 5, md: 6 },
                            bgcolor: alpha(theme.palette.background.default, 0.88),
                            backdropFilter: 'blur(20px)',
                            border: `1px solid ${alpha(theme.palette.common.white, 0.18)}`,
                            overflow: 'hidden',
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                                boxShadow: `0 25px 50px ${alpha(theme.palette.common.black, 0.25)}`,
                            },
                        }}
                    >
                        <Box sx={{ p: { xs: 2.5, sm: 3.5, md: 5 } }}>
                            {/* ── Logo ─────────────────────────────────────── */}
                            <Box
                                component="figure"
                                mb={{ xs: 3, sm: 4 }}
                                mx="auto"
                                textAlign="center"
                                sx={{
                                    animation: 'fadeInDown 0.7s ease-out',
                                    '@keyframes fadeInDown': {
                                        from: { opacity: 0, transform: 'translateY(-25px)' },
                                        to: { opacity: 1, transform: 'translateY(0)' },
                                    },
                                    m: 0,
                                }}
                            >
                                <Link
                                    href={rootPaths.homeRoot}
                                    sx={{ display: 'inline-block' }}
                                >
                                    <Image
                                        src={logoWithText}
                                        alt="SchoolPilot logo"
                                        height={isMobile ? 45 : isTablet ? 55 : 65}
                                        sx={{
                                            transition: 'transform 0.3s ease',
                                            '&:hover': { transform: 'scale(1.05)' },
                                        }}
                                    />
                                </Link>
                            </Box>

                            <Stack spacing={{ xs: 3, sm: 3.5 }}>
                                {/* ── Title ─────────────────────────────────── */}
                                <Box textAlign="center">
                                    <Typography
                                        variant="h3"
                                        sx={{
                                            fontWeight: 800,
                                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            mb: 0.5,
                                            fontSize: {
                                                xs: '1.5rem',
                                                sm: '1.85rem',
                                                md: '2.15rem',
                                            },
                                            letterSpacing: '-0.02em',
                                        }}
                                    >
                                        Welcome Back!
                                    </Typography>
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{
                                            fontSize: { xs: '0.8rem', sm: '0.9rem' },
                                            maxWidth: 320,
                                            mx: 'auto',
                                        }}
                                    >
                                        Sign in to manage your school activities
                                    </Typography>
                                </Box>

                                {/* ── Sign Up Link ─────────────────────────── */}
                                <Typography
                                    variant="body2"
                                    textAlign="center"
                                    color="text.secondary"
                                    sx={{ fontSize: { xs: '0.78rem', sm: '0.85rem' } }}
                                >
                                    New to SchoolPilot?{' '}
                                    <Link
                                        href={paths.signup}
                                        underline="hover"
                                        sx={{
                                            fontWeight: 600,
                                            color: theme.palette.primary.main,
                                            '&:hover': { color: theme.palette.primary.dark },
                                        }}
                                    >
                                        Create an account
                                    </Link>
                                </Typography>

                                {/* ── Login Form ───────────────────────────── */}
                                <form
                                    onSubmit={handleSubmit}
                                    style={{ width: '100%' }}
                                    noValidate
                                >
                                    <Stack spacing={{ xs: 2.5, sm: 3 }}>
                                        {/* Email */}
                                        <TextField
                                            variant="filled"
                                            label="Email Address"
                                            type="email"
                                            value={email}
                                            onChange={handleEmailChange}
                                            onBlur={() => handleBlur('email')}
                                            error={touched.email && !!errors.email}
                                            helperText={touched.email && errors.email}
                                            sx={inputStyles(touched.email && !!errors.email)}
                                            fullWidth
                                            placeholder="admin@yourschool.com"
                                            disabled={loading}
                                            InputProps={{
                                                disableUnderline: true,
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <IconifyIcon
                                                            icon="mdi:email-outline"
                                                            color={
                                                                touched.email && errors.email
                                                                    ? theme.palette.error.main
                                                                    : theme.palette.text.secondary
                                                            }
                                                            width={20}
                                                        />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />

                                        {/* Password */}
                                        <TextField
                                            variant="filled"
                                            label="Password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={handlePasswordChange}
                                            onBlur={() => handleBlur('password')}
                                            error={touched.password && !!errors.password}
                                            helperText={touched.password && errors.password}
                                            sx={inputStyles(touched.password && !!errors.password)}
                                            fullWidth
                                            placeholder="Enter your password"
                                            disabled={loading}
                                            InputProps={{
                                                disableUnderline: true,
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <IconifyIcon
                                                            icon="mdi:lock-outline"
                                                            color={
                                                                touched.password && errors.password
                                                                    ? theme.palette.error.main
                                                                    : theme.palette.text.secondary
                                                            }
                                                            width={20}
                                                        />
                                                    </InputAdornment>
                                                ),
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <IconButton
                                                            aria-label="toggle password visibility"
                                                            onClick={handleClickShowPassword}
                                                            size="small"
                                                            edge="end"
                                                            disabled={loading}
                                                            sx={{
                                                                mr: 0.5,
                                                                color: theme.palette.text.secondary,
                                                                '&:hover': {
                                                                    color: theme.palette.primary.main,
                                                                },
                                                            }}
                                                        >
                                                            {showPassword ? (
                                                                <IconifyIcon icon="mdi:eye-off-outline" />
                                                            ) : (
                                                                <IconifyIcon icon="mdi:eye-outline" />
                                                            )}
                                                        </IconButton>
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />

                                        {/* Remember / Forgot */}
                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            flexWrap="wrap"
                                            gap={1}
                                        >
                                            <FormControlLabel
                                                control={
                                                    <Checkbox
                                                        size="small"
                                                        sx={{
                                                            color: theme.palette.text.secondary,
                                                            '&.Mui-checked': {
                                                                color: theme.palette.primary.main,
                                                            },
                                                        }}
                                                        disabled={loading}
                                                    />
                                                }
                                                label="Remember me"
                                                sx={{
                                                    color: 'text.secondary',
                                                    '& .MuiTypography-root': {
                                                        fontSize: {
                                                            xs: '0.75rem',
                                                            sm: '0.85rem',
                                                        },
                                                    },
                                                }}
                                            />
                                            <Link
                                                href="#"
                                                onClick={handleOpenResetModal}
                                                underline="hover"
                                                sx={{
                                                    fontSize: {
                                                        xs: '0.75rem',
                                                        sm: '0.85rem',
                                                    },
                                                    color: theme.palette.primary.main,
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        color: theme.palette.primary.dark,
                                                    },
                                                }}
                                            >
                                                Having trouble logging in?
                                            </Link>
                                        </Stack>

                                        {/* Submit */}
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={loading}
                                            fullWidth
                                            sx={{
                                                py: { xs: 1.35, sm: 1.5 },
                                                borderRadius: '12px',
                                                fontWeight: 700,
                                                fontSize: { xs: '0.9rem', sm: '1rem' },
                                                textTransform: 'none',
                                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                                boxShadow: `0 8px 24px ${alpha(
                                                    theme.palette.primary.main,
                                                    0.35,
                                                )}`,
                                                '&:hover': {
                                                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: `0 12px 28px ${alpha(
                                                        theme.palette.primary.main,
                                                        0.45,
                                                    )}`,
                                                },
                                                '&:active': {
                                                    transform: 'translateY(0)',
                                                },
                                                transition: 'all 0.25s ease',
                                            }}
                                        >
                                            {loading ? (
                                                <CircularProgress
                                                    size={22}
                                                    sx={{
                                                        color: theme.palette.common.white,
                                                    }}
                                                />
                                            ) : (
                                                'Sign In'
                                            )}
                                        </Button>

                                        {/* ── Community ─────────────────────── */}
                                        <Box sx={{ mt: 1 }}>
                                            <Divider sx={{ mb: 2.5 }}>
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{
                                                        px: 1.5,
                                                        fontWeight: 600,
                                                        letterSpacing: '0.08em',
                                                        textTransform: 'uppercase',
                                                        fontSize: '0.65rem',
                                                    }}
                                                >
                                                    Stay Connected
                                                </Typography>
                                            </Divider>

                                            <Stack
                                                alignItems="center"
                                                spacing={2}
                                            >
                                                <Typography
                                                    variant="body2"
                                                    align="center"
                                                    sx={{
                                                        color: 'text.secondary',
                                                        fontSize: {
                                                            xs: '0.75rem',
                                                            sm: '0.85rem',
                                                        },
                                                        lineHeight: 1.6,
                                                        maxWidth: 320,
                                                    }}
                                                >
                                                    <Link
                                                        href="#"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        underline="hover"
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: theme.palette.primary.main,
                                                            '&:hover': {
                                                                color: theme.palette.primary.dark,
                                                            },
                                                        }}
                                                    >
                                                        Join the SchoolPilot Community
                                                    </Link>{' '}
                                                    and connect with other school admins and teachers
                                                </Typography>

                                                <Stack
                                                    direction="row"
                                                    spacing={{ xs: 0.5, sm: 1 }}
                                                    justifyContent="center"
                                                    flexWrap="wrap"
                                                    useFlexGap
                                                >
                                                    {SOCIAL_LINKS.map((s) => (
                                                        <Tooltip
                                                            key={s.label}
                                                            title={s.label}
                                                            arrow
                                                            placement="top"
                                                        >
                                                            <IconButton
                                                                component="a"
                                                                href={s.href}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                aria-label={s.label}
                                                                size="small"
                                                                sx={{
                                                                    color: theme.palette.text.secondary,
                                                                    width: { xs: 36, sm: 40 },
                                                                    height: { xs: 36, sm: 40 },
                                                                    borderRadius: '10px',
                                                                    transition: 'all 0.2s ease',
                                                                    '&:hover': {
                                                                        color: s.color,
                                                                        bgcolor: alpha(s.color, 0.12),
                                                                        transform: 'translateY(-2px)',
                                                                    },
                                                                }}
                                                            >
                                                                <IconifyIcon
                                                                    icon={s.icon}
                                                                    width={22}
                                                                />
                                                            </IconButton>
                                                        </Tooltip>
                                                    ))}
                                                </Stack>

                                                <Typography
                                                    variant="caption"
                                                    color="text.disabled"
                                                    sx={{
                                                        fontSize: '0.65rem',
                                                        textAlign: 'center',
                                                        maxWidth: 260,
                                                    }}
                                                >
                                                    Trusted by schools to manage attendance, results, fees, and more
                                                </Typography>
                                            </Stack>
                                        </Box>
                                    </Stack>
                                </form>
                            </Stack>
                        </Box>
                    </Paper>
                </Fade>

                {/* Message Display */}
                {messageProps && (
                    <Box mt={2}>
                        <MessageDisplay {...messageProps} />
                    </Box>
                )}
            </Container>

            <PasswordResetModal
                open={resetModalOpen}
                onClose={handleCloseResetModal}
                appName="SchoolPilot"
            />
        </Box>
    );
};

export default Login;