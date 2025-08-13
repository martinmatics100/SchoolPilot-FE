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
} from '@mui/material';
import IconifyIcon from '../../../components/base/iconifyIcon';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { rootPaths } from '../../../routes/paths';
import Image from '../../../components/base/image';
import logoWithText from '../../../assets/palmfitLogoWithText.png';
import { useAuth } from '../../../context';
import paths from '../../../routes/paths';
import { useMessage } from '../../../context/messageContext';


const Login = () => {
    const { login, isAuthenticated, selectedAccount, role } = useAuth();
    const { showMessage } = useMessage(); // Get the showMessage function
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [email, setEmail] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [shouldNavigate, setShouldNavigate] = useState<boolean>(false);

    useEffect(() => {
        console.log("Auth changed", { isAuthenticated, selectedAccount, role });
    }, [isAuthenticated, selectedAccount, role]);

    useEffect(() => {
        if (isAuthenticated) {
            // Ensure at least 100ms delay to allow role/account to update
            const timer = setTimeout(() => {
                if (selectedAccount || role) {
                    navigate('/app/dashboard', { replace: true });
                } else {
                    navigate(paths.home, { replace: true });
                }
            }, 20000); // Short delay to allow context updates

            return () => clearTimeout(timer);
        }
    }, [isAuthenticated, selectedAccount, role, navigate]);


    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setLoading(true);

        try {
            const success = await login(email, password);
            if (success) {
                showMessage('Login successful! Redirecting...', 'success');

                // Create a promise that resolves after 10 seconds
                await new Promise(resolve => {
                    const timer = setTimeout(resolve, 10000);

                    // Store the timer so we can clean it up if component unmounts
                    return () => clearTimeout(timer);
                });

                // Only navigate if still mounted and not already navigated
                if (selectedAccount || role) {
                    navigate('/app/dashboard', { replace: true });
                } else {
                    navigate(paths.home, { replace: true });
                }
            } else {
                showMessage('Login failed. Please check your credentials.', 'error');
            }
        } catch (err) {
            console.error("Login attempt failed:", err);
            let errorMsg = 'An unexpected error occurred during login.';
            if (err instanceof Error) errorMsg = err.message;
            else if (typeof err === 'string') errorMsg = err;
            showMessage(errorMsg, 'error');
        } finally {
            setLoading(false);
        }
    };


    const handleClickShowPassword = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    const handleCloseAlert = () => {
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
                        Don't have an account?{' '}
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
        </>
    )
}

export default Login;