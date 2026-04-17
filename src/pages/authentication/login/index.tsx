import {
    Box,
    Link,
    Paper,
    Stack,
    Button,
    Divider,
    Checkbox,
    FormGroup,
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
import { useTheme } from "@mui/material";

const Login = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md'));
    const { login, selectedAccount, role } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [messageProps, setMessageProps] = useState<Partial<MessageDisplayProps> | null>(null);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setMessageProps(null);

        try {
            const result = await login(email, password);
            if (result.success) {
                setMessageProps({
                    beMessage: result.message || "Login successful",
                    httpStatus: result.status
                });

                setTimeout(() => {
                    navigate('/authentication/welcome', { replace: true });
                }, 1500);

            } else {
                setMessageProps({
                    feMessage: result.message,
                    httpStatus: result.status
                });
                console.error(`Error Message:`, result.message);
            }
        } catch (err) {
            console.error("Login attempt failed:", err);
            let errorMsg = 'An unexpected error occurred.';
            if (err instanceof Error) errorMsg = err.message;
            else if (typeof err === 'string') errorMsg = err;
            setMessageProps({
                beMessage: errorMsg,
                httpStatus: 400
            });
        } finally {
            setLoading(false);
        }
    };

    const handleClickShowPassword = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    // Modern gradient background
    const gradientBackground = `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.95)} 0%, ${alpha(theme.palette.secondary.dark, 0.85)} 100%)`;

    // Modern input styles with floating effect
    const modernInputStyles = {
        '& .MuiFilledInput-root': {
            bgcolor: alpha(theme.palette.background.paper, 0.6),
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            transition: 'all 0.3s ease-in-out',
            '&:hover': {
                bgcolor: alpha(theme.palette.background.paper, 0.8),
                transform: 'translateY(-2px)',
            },
            '&.Mui-focused': {
                bgcolor: alpha(theme.palette.background.paper, 0.9),
                transform: 'translateY(-2px)',
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
            },
        },
        '& .MuiInputLabel-root': {
            color: theme.palette.text.secondary,
            fontWeight: 500,
            '&.Mui-focused': {
                color: theme.palette.primary.main,
            },
        },
        '& .MuiFilledInput-input': {
            color: theme.palette.text.primary,
            padding: '16px 20px',
        },
    };

    return (
        <Box
            sx={{
                minHeight: '85vh',
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
            {/* Decorative background elements */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: { xs: 200, sm: 300, md: 400 },
                    height: { xs: 200, sm: 300, md: 400 },
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.3)} 0%, transparent 70%)`,
                    zIndex: 0,
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: -80,
                    left: -80,
                    width: { xs: 250, sm: 350, md: 450 },
                    height: { xs: 250, sm: 350, md: 450 },
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(theme.palette.secondary.light, 0.25)} 0%, transparent 70%)`,
                    zIndex: 0,
                }}
            />

            <Container maxWidth="sm" sx={{ position: 'relative', zIndex: 1, p: 0 }}>
                <Fade in timeout={800}>
                    <Paper
                        elevation={24}
                        sx={{
                            borderRadius: { xs: 4, sm: 6 },
                            bgcolor: alpha(theme.palette.background.default, 0.85),
                            backdropFilter: 'blur(20px)',
                            border: `1px solid ${alpha(theme.palette.common.white, 0.18)}`,
                            overflow: 'hidden',
                            transition: 'all 0.3s ease-in-out',
                            '&:hover': {
                                boxShadow: `0 20px 40px ${alpha(theme.palette.common.black, 0.2)}`,
                            },
                        }}
                    >
                        <Box sx={{ p: { xs: 3, sm: 4, md: 5 } }}>
                            {/* Logo Section */}
                            <Box
                                component="figure"
                                mb={4}
                                mx="auto"
                                textAlign="center"
                                sx={{
                                    animation: 'fadeInDown 0.8s ease-out',
                                    '@keyframes fadeInDown': {
                                        from: {
                                            opacity: 0,
                                            transform: 'translateY(-30px)',
                                        },
                                        to: {
                                            opacity: 1,
                                            transform: 'translateY(0)',
                                        },
                                    },
                                }}
                            >
                                <Link href={rootPaths.homeRoot} sx={{ display: 'inline-block' }}>
                                    <Image
                                        src={logoWithText}
                                        alt="logo with text"
                                        height={isMobile ? 50 : 65}
                                        sx={{
                                            transition: 'transform 0.3s ease',
                                            '&:hover': {
                                                transform: 'scale(1.05)',
                                            },
                                        }}
                                    />
                                </Link>
                            </Box>

                            <Stack spacing={4}>
                                {/* Title Section */}
                                <Box textAlign="center">
                                    <Typography
                                        variant="h3"
                                        sx={{ 
                                            fontWeight: 700,
                                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                            backgroundClip: 'text',
                                            WebkitBackgroundClip: 'text',
                                            WebkitTextFillColor: 'transparent',
                                            mb: 1,
                                            fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                                        }}
                                    >
                                        Welcome Back!
                                    </Typography>
                                    <Typography
                                        variant="body1"
                                        color="text.secondary"
                                        sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                                    >
                                        Sign in to continue your learning journey
                                    </Typography>
                                </Box>

                                {/* Sign Up Link */}
                                <Typography
                                    variant="body2"
                                    textAlign="center"
                                    color="text.secondary"
                                    sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                                >
                                    New to PalmFit?{' '}
                                    <Link
                                        href={paths.signup}
                                        underline="hover"
                                        sx={{
                                            fontWeight: 600,
                                            color: theme.palette.primary.main,
                                            '&:hover': {
                                                color: theme.palette.primary.dark,
                                            },
                                        }}
                                    >
                                        Create an account
                                    </Link>
                                </Typography>

                                {/* Login Form */}
                                <form onSubmit={handleSubmit} style={{ width: '100%' }}>
                                    <Stack spacing={3}>
                                        <TextField
                                            variant="filled"
                                            label="Email Address"
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            sx={modernInputStyles}
                                            fullWidth
                                            placeholder="teacher@school.com"
                                            InputProps={{
                                                disableUnderline: true,
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <IconifyIcon
                                                            icon="mdi:email-outline"
                                                            color={theme.palette.text.secondary}
                                                            width={20}
                                                        />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                        <TextField
                                            variant="filled"
                                            label="Password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            sx={modernInputStyles}
                                            fullWidth
                                            placeholder="Enter your password"
                                            InputProps={{
                                                disableUnderline: true,
                                                startAdornment: (
                                                    <InputAdornment position="start">
                                                        <IconifyIcon
                                                            icon="mdi:lock-outline"
                                                            color={theme.palette.text.secondary}
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
                                                            sx={{
                                                                mr: 1,
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

                                        {/* Remember Me & Forgot Password */}
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
                                                        sx={{
                                                            color: theme.palette.text.secondary,
                                                            '&.Mui-checked': {
                                                                color: theme.palette.primary.main,
                                                            },
                                                        }}
                                                    />
                                                }
                                                label="Remember me"
                                                sx={{
                                                    color: 'text.secondary',
                                                    '& .MuiTypography-root': {
                                                        fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                    },
                                                }}
                                            />
                                            <Link
                                                href="#"
                                                underline="hover"
                                                sx={{
                                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                    color: theme.palette.primary.main,
                                                    fontWeight: 500,
                                                    cursor: 'pointer',
                                                }}
                                            >
                                                Forgot Password?
                                            </Link>
                                        </Stack>

                                        {/* Login Button */}
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={loading}
                                            sx={{
                                                py: 1.5,
                                                borderRadius: '12px',
                                                fontWeight: 600,
                                                fontSize: '1rem',
                                                textTransform: 'none',
                                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                                '&:hover': {
                                                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                                                    transform: 'translateY(-2px)',
                                                    boxShadow: `0 6px 20px ${alpha(theme.palette.primary.main, 0.4)}`,
                                                },
                                                transition: 'all 0.3s ease',
                                                position: 'relative',
                                            }}
                                        >
                                            {loading ? (
                                                <CircularProgress size={24} sx={{ color: theme.palette.common.white }} />
                                            ) : (
                                                'Sign In'
                                            )}
                                        </Button>

                                        {/* Divider */}
                                        <Stack direction="row" alignItems="center" spacing={2}>
                                            <Divider sx={{ flex: 1 }} />
                                            <Typography variant="body2" color="text.secondary">
                                                OR
                                            </Typography>
                                            <Divider sx={{ flex: 1 }} />
                                        </Stack>

                                        {/* Social Login Buttons */}
                                        <Stack
                                            direction={{ xs: 'column', sm: 'row' }}
                                            spacing={2}
                                        >
                                            <Button
                                                startIcon={<IconifyIcon icon="flat-color-icons:google" width={24} />}
                                                variant="outlined"
                                                fullWidth
                                                sx={{
                                                    py: 1.2,
                                                    borderRadius: '12px',
                                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                    fontWeight: 500,
                                                    textTransform: 'none',
                                                    borderColor: alpha(theme.palette.divider, 0.5),
                                                    '&:hover': {
                                                        borderColor: theme.palette.primary.main,
                                                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                        transform: 'translateY(-1px)',
                                                    },
                                                    transition: 'all 0.2s ease',
                                                }}
                                            >
                                                Continue with Google
                                            </Button>
                                            <Button
                                                startIcon={<IconifyIcon icon="logos:facebook" width={24} />}
                                                variant="outlined"
                                                fullWidth
                                                sx={{
                                                    py: 1.2,
                                                    borderRadius: '12px',
                                                    fontSize: { xs: '0.75rem', sm: '0.875rem' },
                                                    fontWeight: 500,
                                                    textTransform: 'none',
                                                    borderColor: alpha(theme.palette.divider, 0.5),
                                                    '&:hover': {
                                                        borderColor: theme.palette.primary.main,
                                                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                                                        transform: 'translateY(-1px)',
                                                    },
                                                    transition: 'all 0.2s ease',
                                                }}
                                            >
                                                Continue with Facebook
                                            </Button>
                                        </Stack>
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
        </Box>
    );
};

export default Login;