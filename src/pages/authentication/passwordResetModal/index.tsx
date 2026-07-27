import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    Divider,
    Link,
    Stack,
    TextField,
    Typography,
    InputAdornment,
    CircularProgress,
    useMediaQuery,
    alpha,
    Alert,
    IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material';
import IconifyIcon from '../../../components/base/iconifyIcon';

interface PasswordResetModalProps {
    open: boolean;
    onClose: () => void;
    appName?: string;
    onSendOtp?: (email: string) => Promise<void>;
    onVerifyOtp?: (email: string, otp: string) => Promise<boolean>;
    onResetPassword?: (email: string, otp: string, newPassword: string) => Promise<void>;
}

type ResetStep = 'email' | 'otp' | 'password' | 'success';

const PasswordResetModal: React.FC<PasswordResetModalProps> = ({
    open,
    onClose,
    appName = 'SchoolPilot',
    onSendOtp,
    onVerifyOtp,
    onResetPassword,
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // State for step tracking
    const [currentStep, setCurrentStep] = useState<ResetStep>('email');
    const [email, setEmail] = useState<string>('');
    const [otp, setOtp] = useState<string[]>(['', '', '', '', '']);
    const [newPassword, setNewPassword] = useState<string>('');
    const [confirmPassword, setConfirmPassword] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [timer, setTimer] = useState<number>(60);
    const [showPassword, setShowPassword] = useState<boolean>(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState<boolean>(false);
    const [otpVerified, setOtpVerified] = useState<boolean>(false);

    // Refs for OTP inputs
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    // Timer for OTP resend
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (timer > 0 && currentStep === 'otp') {
            interval = setInterval(() => {
                setTimer((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timer, currentStep]);

    // Focus first OTP input when OTP step loads
    useEffect(() => {
        if (currentStep === 'otp' && inputRefs.current[0]) {
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 100);
        }
    }, [currentStep]);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!open) {
            resetState();
        }
    }, [open]);

    const resetState = () => {
        setCurrentStep('email');
        setEmail('');
        setOtp(['', '', '', '', '', '']);
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setTimer(60);
        setOtpVerified(false);
        setLoading(false);
    };

    const validateEmail = (value: string): boolean => {
        const emailRegex = /^[^\s@]+@([^\s@]+\.)+[^\s@]+$/;
        return emailRegex.test(value);
    };

    const validatePassword = (value: string): string | null => {
        if (value.length < 8) return 'Password must be at least 8 characters';
        if (!/[A-Z]/.test(value)) return 'Password must contain at least one uppercase letter';
        if (!/[a-z]/.test(value)) return 'Password must contain at least one lowercase letter';
        if (!/[0-9]/.test(value)) return 'Password must contain at least one number';
        return null;
    };

    const handleEmailSubmit = async () => {
        if (!email) {
            setError('Email is required');
            return;
        }
        if (!validateEmail(email)) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (onSendOtp) {
                await onSendOtp(email);
            } else {
                // Simulate API call
                await new Promise((resolve) => setTimeout(resolve, 1500));
            }

            setCurrentStep('otp');
            setTimer(60);
        } catch (err: any) {
            setError(err.message || 'Failed to send OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index: number, value: string) => {
        // Only allow digits
        const digit = value.replace(/\D/g, '').slice(0, 1);

        const newOtp = [...otp];
        newOtp[index] = digit;
        setOtp(newOtp);

        // Auto-focus next input
        if (digit && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text/plain').replace(/\D/g, '').slice(0, 5);
        const newOtp = [...otp];
        for (let i = 0; i < pastedData.length; i++) {
            newOtp[i] = pastedData[i];
        }
        setOtp(newOtp);

        // Focus the next empty input or the last filled one
        const nextEmptyIndex = newOtp.findIndex(d => d === '');
        if (nextEmptyIndex !== -1) {
            inputRefs.current[nextEmptyIndex]?.focus();
        } else {
            inputRefs.current[5]?.focus();
        }
    };

    const handleOtpVerify = async () => {
        const otpString = otp.join('');
        if (otpString.length !== 5) {
            setError('Please enter all 5 digits');
            return;
        }

        setLoading(true);
        setError('');

        try {
            let verified = false;
            if (onVerifyOtp) {
                verified = await onVerifyOtp(email, otpString);
            } else {
                // Simulate verification
                await new Promise((resolve) => setTimeout(resolve, 1000));
                verified = true;
            }

            if (verified) {
                setOtpVerified(true);
                setCurrentStep('password');
                setError('');
            } else {
                setError('Invalid OTP. Please try again.');
                setOtp(['', '', '', '', '', '']);
                inputRefs.current[0]?.focus();
            }
        } catch (err: any) {
            setError(err.message || 'OTP verification failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        if (timer > 0) return;

        setLoading(true);
        setError('');

        try {
            if (onSendOtp) {
                await onSendOtp(email);
            } else {
                await new Promise((resolve) => setTimeout(resolve, 1000));
            }
            setTimer(60);
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
            setError('');
        } catch (err: any) {
            setError(err.message || 'Failed to resend OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async () => {
        // Validate new password
        const passwordError = validatePassword(newPassword);
        if (passwordError) {
            setError(passwordError);
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        setError('');

        try {
            if (onResetPassword) {
                await onResetPassword(email, otp.join(''), newPassword);
            } else {
                await new Promise((resolve) => setTimeout(resolve, 1500));
            }

            setCurrentStep('success');
        } catch (err: any) {
            setError(err.message || 'Failed to reset password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (currentStep === 'success') {
            resetState();
            onClose();
        } else {
            // Only close if user confirms or cancels
            resetState();
            onClose();
        }
    };

    // Render Email Step
    const renderEmailStep = () => (
        <>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        mb: 1,
                    }}
                >
                    Request Password Reset
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                    Enter your email address and we'll send you a 6-digit OTP to reset your password.
                </Typography>
            </Box>

            <Stack spacing={3}>
                <TextField
                    label="Email Address"
                    type="email"
                    value={email}
                    onChange={(e) => {
                        setEmail(e.target.value);
                        setError('');
                    }}
                    error={!!error}
                    helperText={error}
                    fullWidth
                    placeholder="teacher@school.com"
                    disabled={loading}
                    size="medium"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <IconifyIcon
                                    icon="mdi:email-outline"
                                    color={error ? theme.palette.error.main : theme.palette.text.secondary}
                                    width={20}
                                />
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            bgcolor: alpha(theme.palette.background.default, 0.6),
                            '&:hover': {
                                bgcolor: alpha(theme.palette.background.default, 0.8),
                            },
                            '&.Mui-focused': {
                                bgcolor: alpha(theme.palette.background.default, 0.9),
                                boxShadow: `0 4px 12px ${alpha(theme.palette.background.default, 0.15)}`,
                            },
                        },
                    }}
                />

                <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        disabled={loading}
                        sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 3,
                            '&:hover': {
                                transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.2s ease',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleEmailSubmit}
                        variant="contained"
                        disabled={loading || !email}
                        sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 4,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            '&:hover': {
                                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                                transform: 'translateY(-1px)',
                                boxShadow: `0 4px 16px ${alpha(theme.palette.primary.main, 0.4)}`,
                            },
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {loading ? (
                            <CircularProgress size={22} sx={{ color: theme.palette.common.white }} />
                        ) : (
                            'Send OTP'
                        )}
                    </Button>
                </Stack>
            </Stack>
        </>
    );

    // Render OTP Step
    const renderOtpStep = () => (
        <>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                    }}
                >
                    <IconifyIcon
                        icon="mdi:shield-check-outline"
                        width={28}
                        color={theme.palette.primary.main}
                    />
                </Box>

                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        fontSize: { xs: '1rem', sm: '1.1rem' },
                        mb: 1,
                    }}
                >
                    Verify Your Identity
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                    We've sent a 6-digit OTP to <strong>{email}</strong>
                </Typography>
            </Box>

            <Stack spacing={3}>
                {/* OTP Input Fields */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        gap: { xs: 1, sm: 2 },
                        '& input': {
                            width: { xs: '40px', sm: '48px' },
                            height: { xs: '48px', sm: '56px' },
                            textAlign: 'center',
                            fontSize: { xs: '1.25rem', sm: '1.5rem' },
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                            borderRadius: '12px',
                            border: `2px solid ${alpha(theme.palette.divider, 0.2)}`,
                            backgroundColor: alpha(theme.palette.background.default, 0.6),
                            transition: 'all 0.2s ease',
                            '&:focus': {
                                borderColor: theme.palette.background.default,
                                boxShadow: `0 0 0 4px ${alpha(theme.palette.background.default, 0.1)}`,
                                outline: 'none',
                                backgroundColor: alpha(theme.palette.background.default, 0.9),
                            },
                            '&:hover': {
                                borderColor: alpha(theme.palette.background.default, 0.5),
                            },
                        },
                    }}
                >
                    {otp.map((digit, index) => (
                        <TextField
                            key={index}
                            inputRef={(el) => (inputRefs.current[index] = el)}
                            type="text"
                            value={digit}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                            onPaste={index === 0 ? handleOtpPaste : undefined}
                            disabled={loading}
                            inputProps={{
                                maxLength: 1,
                                inputMode: 'numeric',
                                pattern: '[0-9]*',
                            }}
                            sx={{
                                width: { xs: '40px', sm: '48px' },
                                '& .MuiOutlinedInput-root': {
                                    height: { xs: '48px', sm: '56px' },
                                    borderRadius: '12px',
                                    '& fieldset': {
                                        borderColor: alpha(theme.palette.divider, 0.2),
                                        borderWidth: '2px',
                                    },
                                    '&:hover fieldset': {
                                        borderColor: alpha(theme.palette.primary.main, 0.5),
                                    },
                                    '&.Mui-focused fieldset': {
                                        borderColor: theme.palette.primary.main,
                                        borderWidth: '2px',
                                    },
                                    '& input': {
                                        textAlign: 'center',
                                        padding: 0,
                                        fontSize: { xs: '1.25rem', sm: '1.5rem' },
                                        fontWeight: 600,
                                    },
                                },
                            }}
                        />
                    ))}
                </Box>

                {/* Error Message */}
                {error && (
                    <Alert
                        severity="error"
                        sx={{
                            borderRadius: '10px',
                            '& .MuiAlert-icon': {
                                alignItems: 'center',
                            },
                        }}
                        onClose={() => setError('')}
                    >
                        {error}
                    </Alert>
                )}

                {/* Timer and Resend */}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                        <IconifyIcon icon="mdi:clock-outline" width={16} style={{ marginRight: 4 }} />
                        {timer > 0 ? (
                            `Resend in ${timer}s`
                        ) : (
                            <Link
                                component="button"
                                onClick={handleResendOtp}
                                disabled={loading}
                                sx={{
                                    color: theme.palette.primary.main,
                                    fontWeight: 500,
                                    cursor: 'pointer',
                                    '&:hover': {
                                        color: theme.palette.primary.dark,
                                    },
                                    '&:disabled': {
                                        color: theme.palette.text.disabled,
                                        cursor: 'not-allowed',
                                    },
                                }}
                            >
                                Didn't receive OTP? Click here
                            </Link>
                        )}
                    </Typography>

                    <Button
                        onClick={handleOtpVerify}
                        variant="contained"
                        disabled={loading || otp.some(d => d === '')}
                        sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 600,
                            px: 4,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            '&:hover': {
                                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                                transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {loading ? (
                            <CircularProgress size={22} sx={{ color: theme.palette.common.white }} />
                        ) : (
                            'Verify OTP'
                        )}
                    </Button>
                </Box>

                {/* Cancel Button */}
                <Button
                    onClick={handleClose}
                    variant="outlined"
                    fullWidth
                    disabled={loading}
                    sx={{
                        borderRadius: '10px',
                        textTransform: 'none',
                        fontWeight: 600,
                        '&:hover': {
                            transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease',
                    }}
                >
                    Cancel
                </Button>
            </Stack>
        </>
    );

    // Render Password Step
    const renderPasswordStep = () => (
        <>
            <Box sx={{ textAlign: 'center', mb: 3 }}>
                <Box
                    sx={{
                        width: 56,
                        height: 56,
                        borderRadius: '50%',
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mx: 'auto',
                        mb: 2,
                    }}
                >
                    <IconifyIcon
                        icon="mdi:check-circle-outline"
                        width={28}
                        color={theme.palette.success.main}
                    />
                </Box>

                <Typography
                    variant="h6"
                    sx={{
                        fontWeight: 600,
                        color: 'text.primary',
                        fontSize: { xs: '1rem', sm: '1.1rem' },
                        mb: 1,
                    }}
                >
                    Create New Password
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                >
                    Create a strong password for your account
                </Typography>
            </Box>

            <Stack spacing={3}>
                <TextField
                    label="New Password"
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => {
                        setNewPassword(e.target.value);
                        setError('');
                    }}
                    error={!!error && !error.includes('match')}
                    helperText={error && !error.includes('match') ? error : 'Must be at least 8 characters with uppercase, lowercase, and number'}
                    fullWidth
                    placeholder="Enter new password"
                    disabled={loading}
                    size="medium"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <IconifyIcon
                                    icon="mdi:lock-outline"
                                    color={error ? theme.palette.error.main : theme.palette.text.secondary}
                                    width={20}
                                />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowPassword(!showPassword)}
                                    edge="end"
                                    disabled={loading}
                                >
                                    <IconifyIcon
                                        icon={showPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'}
                                        width={20}
                                    />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            bgcolor: alpha(theme.palette.background.paper, 0.6),
                            '&:hover': {
                                bgcolor: alpha(theme.palette.background.paper, 0.8),
                            },
                            '&.Mui-focused': {
                                bgcolor: alpha(theme.palette.background.paper, 0.9),
                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                            },
                        },
                    }}
                />

                <TextField
                    label="Confirm Password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setError('');
                    }}
                    error={!!error && error.includes('match')}
                    helperText={error && error.includes('match') ? error : ''}
                    fullWidth
                    placeholder="Confirm new password"
                    disabled={loading}
                    size="medium"
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <IconifyIcon
                                    icon="mdi:lock-check-outline"
                                    color={error && error.includes('match') ? theme.palette.error.main : theme.palette.text.secondary}
                                    width={20}
                                />
                            </InputAdornment>
                        ),
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    edge="end"
                                    disabled={loading}
                                >
                                    <IconifyIcon
                                        icon={showConfirmPassword ? 'mdi:eye-off-outline' : 'mdi:eye-outline'}
                                        width={20}
                                    />
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: '12px',
                            bgcolor: alpha(theme.palette.background.paper, 0.6),
                            '&:hover': {
                                bgcolor: alpha(theme.palette.background.paper, 0.8),
                            },
                            '&.Mui-focused': {
                                bgcolor: alpha(theme.palette.background.paper, 0.9),
                                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
                            },
                        },
                    }}
                />

                {error && error.includes('match') && (
                    <Alert
                        severity="error"
                        sx={{ borderRadius: '10px' }}
                        onClose={() => setError('')}
                    >
                        {error}
                    </Alert>
                )}

                <Stack direction="row" spacing={2}>
                    <Button
                        onClick={handleClose}
                        variant="outlined"
                        fullWidth
                        disabled={loading}
                        sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 600,
                            '&:hover': {
                                transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.2s ease',
                        }}
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handlePasswordSubmit}
                        variant="contained"
                        fullWidth
                        disabled={loading || !newPassword || !confirmPassword || newPassword !== confirmPassword}
                        sx={{
                            borderRadius: '10px',
                            textTransform: 'none',
                            fontWeight: 600,
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            '&:hover': {
                                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                                transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.2s ease',
                        }}
                    >
                        {loading ? (
                            <CircularProgress size={22} sx={{ color: theme.palette.common.white }} />
                        ) : (
                            'Reset Password'
                        )}
                    </Button>
                </Stack>
            </Stack>
        </>
    );

    // Render Success Step
    const renderSuccessStep = () => (
        <Box sx={{ textAlign: 'center', py: 2 }}>
            <Box
                sx={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    bgcolor: alpha(theme.palette.success.main, 0.12),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mx: 'auto',
                    mb: 2,
                }}
            >
                <IconifyIcon
                    icon="mdi:check-circle-outline"
                    width={40}
                    color={theme.palette.success.main}
                />
            </Box>

            <Typography
                variant="h6"
                sx={{
                    fontWeight: 600,
                    color: 'text.primary',
                    fontSize: { xs: '1.1rem', sm: '1.2rem' },
                    mb: 1.5,
                }}
            >
                Password Reset Successful!
            </Typography>

            <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                    fontSize: { xs: '0.85rem', sm: '0.9rem' },
                    mb: 3,
                    lineHeight: 1.6,
                }}
            >
                Your password has been reset successfully.
                <br />
                You can now login with your new password.
            </Typography>

            <Button
                onClick={handleClose}
                variant="contained"
                fullWidth
                sx={{
                    borderRadius: '10px',
                    textTransform: 'none',
                    fontWeight: 600,
                    py: 1.2,
                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                    '&:hover': {
                        background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                        transform: 'translateY(-1px)',
                    },
                    transition: 'all 0.2s ease',
                }}
            >
                Return to Login
            </Button>
        </Box>
    );

    return (
        <Dialog
            open={open}
            onClose={(event, reason) => {
                // Only allow closing on backdrop click if in success state
                if (reason === 'backdropClick') {
                    if (currentStep === 'success') {
                        handleClose();
                    }
                    return;
                }
                handleClose();
            }}
            maxWidth="sm"
            fullWidth
            fullScreen={isMobile}
            PaperProps={{
                sx: {
                    borderRadius: { xs: 0, sm: 4 },
                    bgcolor: alpha(theme.palette.background.default, 0.95),
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${alpha(theme.palette.common.white, 0.12)}`,
                    maxWidth: '480px',
                    width: '100%',
                    m: { xs: 0, sm: 2 },
                    position: 'relative',
                    overflow: 'hidden',
                },
            }}
        >
            {/* Decorative background elements */}
            <Box
                sx={{
                    position: 'absolute',
                    top: -100,
                    right: -100,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(theme.palette.primary.light, 0.15)} 0%, transparent 70%)`,
                    zIndex: 0,
                }}
            />
            <Box
                sx={{
                    position: 'absolute',
                    bottom: -80,
                    left: -80,
                    width: 180,
                    height: 180,
                    borderRadius: '50%',
                    background: `radial-gradient(circle, ${alpha(theme.palette.secondary.light, 0.12)} 0%, transparent 70%)`,
                    zIndex: 0,
                }}
            />

            <DialogContent sx={{ position: 'relative', zIndex: 1, p: { xs: 3, sm: 4 } }}>
                {/* App Name */}
                <Box sx={{ mb: 3, textAlign: 'center' }}>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            fontSize: { xs: '1.25rem', sm: '1.5rem' },
                            background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                            backgroundClip: 'text',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}
                    >
                        {appName}
                    </Typography>
                    <Divider sx={{ mt: 2, mb: 3 }} />
                </Box>

                {/* Render Current Step */}
                {currentStep === 'email' && renderEmailStep()}
                {currentStep === 'otp' && renderOtpStep()}
                {currentStep === 'password' && renderPasswordStep()}
                {currentStep === 'success' && renderSuccessStep()}
            </DialogContent>
        </Dialog>
    );
};

export default PasswordResetModal;