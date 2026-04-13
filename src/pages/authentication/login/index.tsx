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

    // Custom input styles
    const customInputStyles = {
        '& .MuiFilledInput-root': {
            bgcolor: theme.palette.background.default, // Light red background
            '&:hover': {
                bgcolor: theme.palette.background.default, // Darker red on hover
            },
            '&.Mui-focused': {
                bgcolor: theme.palette.action.focus, // Darker red when focused
            },
        },
        '& .MuiInputLabel-root': {
            color: theme.palette.text.secondary, // Red label color
            '&.Mui-focused': {
                color: theme.palette.text.secondary, // Darker red when focused
            },
        },
        '& .MuiFilledInput-input': {
            color: '#1a1a1a', // Dark text for contrast
        },
        '& .MuiFormHelperText-root': {
            color: '#c62828',
        },
        borderRadius: 2,
    };


    return (
        <>
            <Box
                sx={{
                    bgcolor: 'common.black',
                }}
                component="figure"
                mb={5}
                mx="auto"
                textAlign="center"
            >
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
                        sx={customInputStyles}
                        InputProps={{
                            disableUnderline: false, // Keep underline for better UX
                        }}
                    />
                    <TextField
                        variant="filled"
                        label="Password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        sx={customInputStyles}
                        InputProps={{
                            disableUnderline: false,
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
                {messageProps && <MessageDisplay {...messageProps} />}
            </Paper>
        </>
    );
};

export default Login;