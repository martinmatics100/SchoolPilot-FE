// src/pages/authentication/login/index.tsx
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
    Alert,
} from '@mui/material';
import IconifyIcon from '../../../components/base/iconifyIcon';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rootPaths } from '../../../routes/paths';
import Image from '../../../components/base/image';
import logoWithText from '../../../assets/palmfitLogoWithText.png';
import { useAuth } from '../../../context';
import paths from '../../../routes/paths';
import MessageDisplay from '../../../components/common/message-display';


const Login = () => {
    const { login, isAuthenticated, selectedAccount, role } = useAuth();
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string>('');
    const [message, setMessage] = useState<string>(''); // For success message
    const [loading, setLoading] = useState<boolean>(false);
    const [openMessage, setOpenMessage] = useState<boolean>(false);
    const [shouldNavigate, setShouldNavigate] = useState<boolean>(false); // New state to control navigation

    // This useEffect will now handle redirection after a successful login state change
    useEffect(() => {
        if (isAuthenticated && shouldNavigate) {
            if (selectedAccount || role) { // If an account is already selected (e.g., persistent login)
                navigate('/app/dashboard', { replace: true });
            } else { // If authenticated but no account selected, go to account selection
                navigate(paths.home, { replace: true });
            }
            // Reset shouldNavigate after navigation to prevent re-triggering
            setShouldNavigate(false);
        }
    }, [isAuthenticated, shouldNavigate, navigate, selectedAccount, role]); // Add selectedAccount and role to dependencies

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);
        setError(''); // Clear previous errors
        setMessage(''); // Clear previous messages
        setOpenMessage(false); // Close any existing messages
        setShouldNavigate(false); // Reset navigation flag

        try {
            const success = await login(email, password); // Await the async login call
            if (success) {
                setMessage('Login successful!');
                setOpenMessage(true);
                // The useEffect will handle navigation
                // Set a timeout to allow the message to display before navigating
                setTimeout(() => {
                    setOpenMessage(false); // Close the message
                    setShouldNavigate(true); // Trigger navigation
                }, 3000); // Display message for 1.5 seconds
            } else {
                setError('Login failed. Please check your credentials.');
                setOpenMessage(true);
                setTimeout(() => {
                    setOpenMessage(false);
                }, 3000);
            }
        } catch (err) {
            console.error("Login attempt failed:", err);
            setError('An unexpected error occurred during login.');
            setOpenMessage(true);
            setTimeout(() => {
                setOpenMessage(false);
            }, 3000);
        } finally {
            setLoading(false); // Stop loading after login attempt (success or failure)
        }
    };

    const handleClickShowPassword = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    const handleCloseMessage = () => {
        setOpenMessage(false);
    };

    return (
        <>
            <Box
                sx={{
                    bgcolor: 'common.black',
                }}
                component="figure" mb={5} mx="auto" textAlign="center">
                <Link href={rootPaths.homeRoot}>
                    <Image src={logoWithText} alt="logo with text" height={60} />
                </Link>
            </Box>

            <Paper
                sx={{
                    py: 6,
                    px: { xs: 5, sm: 7.5 },
                    bgcolor: 'common.black',
                }}
            >
                <Stack justifyContent="center" gap={5}>
                    <Typography variant="h3" textAlign="center" color="text.secondary">
                        Log In
                    </Typography>
                    <Typography variant="h6" fontWeight={500} textAlign="center" color="text.primary">
                        Don’t have an account?{' '}
                        <Link href={paths.signup} underline="none">
                            Enroll your school
                        </Link>
                    </Typography>
                    <TextField
                        variant="filled"
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        sx={{
                            '.MuiFilledInput-root': {
                                bgcolor: 'grey.A100',
                                ':hover': {
                                    bgcolor: 'background.default',
                                },
                                ':focus': {
                                    bgcolor: 'background.default',
                                },
                                ':focus-within': {
                                    bgcolor: 'background.default',
                                },
                            },
                            borderRadius: 2,
                        }}
                    />
                    <TextField
                        variant="filled"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={{
                            '.MuiFilledInput-root': {
                                bgcolor: 'grey.A100',
                                ':hover': {
                                    bgcolor: 'background.default',
                                },
                                ':focus': {
                                    bgcolor: 'background.default',
                                },
                                ':focus-within': {
                                    bgcolor: 'background.default',
                                },
                            },
                            borderRadius: 2,
                        }}
                        InputProps={{
                            endAdornment: (
                                <InputAdornment position="end">
                                    <IconButton
                                        aria-label="toggle password visibility"
                                        onClick={handleClickShowPassword}
                                        size="small"
                                        edge="end"
                                        sx={{
                                            mr: 2,
                                        }}
                                    >
                                        {showPassword ? (
                                            <IconifyIcon icon="el:eye-open" color="text.secondary" />
                                        ) : (
                                            <IconifyIcon icon="el:eye-close" color="text.primary" />
                                        )}
                                    </IconButton>
                                </InputAdornment>
                            ),
                        }}
                    />
                    <FormGroup sx={{ ml: 1, width: 'fit-content' }}>
                        <FormControlLabel
                            control={<Checkbox />}
                            label="Keep me signed in"
                            sx={{
                                color: 'text.secondary',
                            }}
                        />
                    </FormGroup>
                    <Button
                        onClick={handleSubmit}
                        sx={{
                            fontWeight: 'fontWeightRegular',
                            position: 'relative',
                        }}
                        disabled={loading}
                    >
                        {loading ? (
                            <CircularProgress size={24} sx={{ position: 'absolute', left: '50%', top: '50%', marginLeft: '-12px', marginTop: '-12px' }} />
                        ) : (
                            'Log In'
                        )}
                    </Button>
                    <Divider />
                    <Typography textAlign="center" color="text.secondary" variant="body1">
                        Or sign in using:
                    </Typography>
                    <Stack gap={1.5} direction="row" justifyContent="space-between">
                        <Button
                            startIcon={<IconifyIcon icon="flat-color-icons:google" />}
                            variant="outlined"
                            fullWidth
                            sx={{
                                fontSize: 'subtitle2.fontSize',
                                fontWeight: 'fontWeightRegular',
                            }}
                        >
                            Google
                        </Button>
                        <Button
                            startIcon={<IconifyIcon icon="logos:facebook" />}
                            variant="outlined"
                            fullWidth
                            sx={{
                                fontSize: 'subtitle2.fontSize',
                                fontWeight: 'fontWeightRegular',
                            }}
                        >
                            Facebook
                        </Button>
                    </Stack>
                </Stack>
            </Paper>

            <MessageDisplay
                message={error || message}
                type={error ? 'error' : 'success'}
                source="frontend"
                open={openMessage}
                onClose={handleCloseMessage}
            />
        </>
    )
}

export default Login;