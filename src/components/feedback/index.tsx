// src/components/feedback/FeedbackModal.tsx
import { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    Typography,
    Alert,
    IconButton,
    Box,
    CircularProgress,
    alpha,
    useMediaQuery,
} from '@mui/material';
import IconifyIcon from '../base/iconifyIcon';
import { useTheme } from '@mui/material';
import { getEnum } from '../../api/enumsApi';

interface FeedbackModalProps {
    open: boolean;
    onClose: () => void;
}

interface EnumOption {
    value: number;
    name: string;
    displayName?: string;
}

export const FeedbackModal = ({ open, onClose }: FeedbackModalProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // ── Form state ─────────────────────────────────────────────────────────
    const [feedbackType, setFeedbackType] = useState<number | ''>('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // ── Enum state ─────────────────────────────────────────────────────────
    const [feedbackOptions, setFeedbackOptions] = useState<EnumOption[]>([]);
    const [mounted, setMounted] = useState(false);

    // Trigger entrance animations
    useEffect(() => {
        if (open) {
            const t = setTimeout(() => setMounted(true), 50);
            return () => clearTimeout(t);
        } else {
            setMounted(false);
        }
    }, [open]);

    // ── Load the FeedbackAndSupport enum ───────────────────────────────────
    useEffect(() => {
        if (!open) return;

        const loadEnum = async () => {
            setLoading(true);
            try {
                const options = await getEnum('FeedbackAndSupport');
                // Normalize: prefer displayName, fall back to name
                const normalized: EnumOption[] = (options || []).map((o: any) => ({
                    value: o.value ?? o.Value,
                    name: o.name ?? o.Name,
                    displayName: o.displayName ?? o.DisplayName,
                }));
                setFeedbackOptions(normalized);
            } catch (err) {
                console.error('Failed to load FeedbackAndSupport enum:', err);
                setError('We could not load feedback options. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        loadEnum();
    }, [open]);

    // ── Reset when modal reopens ───────────────────────────────────────────
    const resetForm = () => {
        setFeedbackType('');
        setTitle('');
        setDescription('');
        setEmail('');
        setError(null);
    };

    const handleClose = () => {
        if (submitting) return;
        resetForm();
        setSubmitted(false);
        onClose();
    };

    // ── Submit ─────────────────────────────────────────────────────────────
    const handleSubmit = async () => {
        if (feedbackType === '' || !title.trim() || !description.trim()) return;

        setSubmitting(true);
        setError(null);

        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    // ✅ Enum VALUE goes to the backend (as a number)
                    type: feedbackType,
                    title: title.trim(),
                    description: description.trim(),
                    email: email.trim() || undefined,
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    timestamp: new Date().toISOString(),
                }),
            });

            if (!response.ok) throw new Error('Request failed');

            setSubmitted(true);
            setTimeout(() => {
                handleClose();
            }, 2200);
        } catch (err) {
            console.error('Failed to submit feedback:', err);
            setError('Something went wrong. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    const isFormValid =
        feedbackType !== '' && title.trim() && description.trim();

    // ── Selected option for icon display ───────────────────────────────────
    const selectedOption = feedbackOptions.find((o) => o.value === feedbackType);
    const getOptionLabel = (o: EnumOption) => o.displayName || o.name;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: { xs: 3, sm: 4 },
                    bgcolor: 'background.default',
                    overflow: 'hidden',
                    position: 'relative',

                    // Entrance
                    opacity: mounted ? 1 : 0,
                    transform: mounted
                        ? 'translateY(0) scale(1)'
                        : 'translateY(20px) scale(0.98)',
                    transition:
                        'opacity 0.3s ease, transform 0.3s ease',

                    // Animated top bar
                    '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main}, ${theme.palette.primary.main})`,
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 4s linear infinite',
                        '@keyframes shimmer': {
                            '0%': { backgroundPosition: '0% 0%' },
                            '100%': { backgroundPosition: '200% 0%' },
                        },
                    },
                },
            }}
        >
            {!submitted ? (
                <>
                    {/* ── Title ──────────────────────────────────────── */}
                    <DialogTitle sx={{ pb: 1, pt: 3 }}>
                        <Stack
                            direction="row"
                            alignItems="flex-start"
                            spacing={1.5}
                        >
                            <Box
                                sx={{
                                    width: 44,
                                    height: 44,
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                    boxShadow: `0 10px 24px ${alpha(
                                        theme.palette.primary.main,
                                        0.35,
                                    )}`,
                                    flexShrink: 0,
                                }}
                            >
                                <IconifyIcon
                                    icon="solar:chat-round-like-bold"
                                    width={22}
                                    color={theme.palette.common.white}
                                />
                            </Box>

                            <Box sx={{ flex: 1, minWidth: 0 }}>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: {
                                            xs: '1.05rem',
                                            sm: '1.15rem',
                                        },
                                        mb: 0.25,
                                    }}
                                >
                                    Help Improve SchoolPilot
                                </Typography>
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                        fontSize: {
                                            xs: '0.7rem',
                                            sm: '0.75rem',
                                        },
                                        display: 'block',
                                        lineHeight: 1.5,
                                    }}
                                >
                                    Your feedback helps us build a better
                                    school management system
                                </Typography>
                            </Box>

                            <IconButton
                                onClick={handleClose}
                                size="small"
                                disabled={submitting}
                                sx={{
                                    color: 'text.secondary',
                                    '&:hover': {
                                        color: 'text.primary',
                                        bgcolor: alpha(
                                            theme.palette.action.hover,
                                            0.8,
                                        ),
                                    },
                                }}
                            >
                                <IconifyIcon icon="mdi:close" width={20} />
                            </IconButton>
                        </Stack>
                    </DialogTitle>

                    <DialogContent sx={{ pt: 2 }}>
                        <Stack spacing={2.5}>
                            {/* ── Feedback type dropdown ───────────── */}
                            <FormControl fullWidth required>
                                <InputLabel id="feedback-type-label">
                                    What would you like to share?
                                </InputLabel>
                                <Select
                                    labelId="feedback-type-label"
                                    id="feedback-type"
                                    value={feedbackType}
                                    onChange={(e) =>
                                        setFeedbackType(
                                            e.target.value as number,
                                        )
                                    }
                                    label="What would you like to share?"
                                    disabled={loading || submitting}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: { borderRadius: 2, mt: 1 },
                                        },
                                    }}
                                    sx={{
                                        borderRadius: '12px',
                                        '& .MuiOutlinedInput-notchedOutline':
                                        {
                                            borderColor: alpha(
                                                theme.palette.text.primary,
                                                0.15,
                                            ),
                                        },
                                        '&:hover .MuiOutlinedInput-notchedOutline':
                                        {
                                            borderColor:
                                                theme.palette.primary.main,
                                        },
                                        '&.Mui-focused .MuiOutlinedInput-notchedOutline':
                                        {
                                            borderColor:
                                                theme.palette.primary.main,
                                            borderWidth: 2,
                                        },
                                    }}
                                    endAdornment={
                                        loading ? (
                                            <CircularProgress
                                                size={18}
                                                sx={{
                                                    mr: 3,
                                                    color: theme.palette
                                                        .primary.main,
                                                }}
                                            />
                                        ) : undefined
                                    }
                                >
                                    {feedbackOptions.map((option) => (
                                        <MenuItem
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {getOptionLabel(option)}
                                        </MenuItem>
                                    ))}
                                </Select>
                                {loading && (
                                    <Typography
                                        variant="caption"
                                        color="text.secondary"
                                        sx={{ mt: 0.75, ml: 1.5 }}
                                    >
                                        Loading options...
                                    </Typography>
                                )}
                            </FormControl>

                            {/* ── Title ─────────────────────────────── */}
                            <TextField
                                fullWidth
                                label="Title"
                                placeholder="Brief summary of your feedback"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                disabled={submitting}
                                size="small"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                    },
                                }}
                            />

                            {/* ── Description ───────────────────────── */}
                            <TextField
                                fullWidth
                                label="Description"
                                placeholder="Please provide details..."
                                value={description}
                                onChange={(e) =>
                                    setDescription(e.target.value)
                                }
                                multiline
                                rows={4}
                                required
                                disabled={submitting}
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                    },
                                }}
                            />

                            {/* ── Email ─────────────────────────────── */}
                            <TextField
                                fullWidth
                                label="Email (Optional)"
                                placeholder="We may contact you for clarification"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                size="small"
                                disabled={submitting}
                                helperText="We'll only use this to follow up on your feedback"
                                sx={{
                                    '& .MuiOutlinedInput-root': {
                                        borderRadius: '12px',
                                    },
                                }}
                            />

                            {/* ── Error ─────────────────────────────── */}
                            {error && (
                                <Alert
                                    severity="error"
                                    sx={{ borderRadius: 2, fontSize: '0.85rem' }}
                                >
                                    {error}
                                </Alert>
                            )}

                            {/* ── Info note ─────────────────────────── */}
                            <Alert
                                severity="info"
                                icon={
                                    <IconifyIcon
                                        icon="solar:info-circle-bold"
                                        width={20}
                                    />
                                }
                                sx={{
                                    borderRadius: 2,
                                    bgcolor: alpha(
                                        theme.palette.info.main,
                                        0.08,
                                    ),
                                    color: theme.palette.info.dark,
                                    border: `1px solid ${alpha(
                                        theme.palette.info.main,
                                        0.15,
                                    )}`,
                                    '& .MuiAlert-icon': {
                                        color: theme.palette.info.main,
                                    },
                                }}
                            >
                                <Typography
                                    variant="caption"
                                    sx={{
                                        fontSize: {
                                            xs: '0.72rem',
                                            sm: '0.78rem',
                                        },
                                        lineHeight: 1.5,
                                    }}
                                >
                                    We read every piece of feedback! Your input
                                    helps make SchoolPilot better for schools
                                    worldwide.
                                </Typography>
                            </Alert>
                        </Stack>
                    </DialogContent>

                    {/* ── Actions ────────────────────────────────────── */}
                    <DialogActions
                        sx={{
                            p: { xs: 2, sm: 3 },
                            pt: 0,
                            gap: 1,
                            flexDirection: {
                                xs: 'column-reverse',
                                sm: 'row',
                            },
                            '& > :not(:first-of-type)': {
                                ml: { xs: 0, sm: 1 },
                            },
                        }}
                    >
                        <Button
                            onClick={handleClose}
                            disabled={submitting}
                            fullWidth={isMobile}
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 600,
                                py: 1,
                                color: 'text.secondary',
                                '&:hover': {
                                    color: 'text.primary',
                                    bgcolor: alpha(
                                        theme.palette.action.hover,
                                        0.8,
                                    ),
                                },
                            }}
                        >
                            Cancel
                        </Button>

                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={!isFormValid || submitting || loading}
                            fullWidth={isMobile}
                            startIcon={
                                submitting ? (
                                    <CircularProgress
                                        size={16}
                                        sx={{
                                            color: theme.palette.common.white,
                                        }}
                                    />
                                ) : (
                                    <IconifyIcon
                                        icon="solar:send-bold"
                                        width={18}
                                    />
                                )
                            }
                            sx={{
                                borderRadius: '12px',
                                textTransform: 'none',
                                fontWeight: 700,
                                py: 1.1,
                                px: 3,
                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                boxShadow: `0 10px 24px ${alpha(
                                    theme.palette.primary.main,
                                    0.35,
                                )}`,
                                transition: 'all 0.25s ease',
                                '&:hover': {
                                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                                    transform: 'translateY(-2px)',
                                    boxShadow: `0 14px 32px ${alpha(
                                        theme.palette.primary.main,
                                        0.5,
                                    )}`,
                                },
                                '&:active': { transform: 'translateY(0)' },
                                '&.Mui-disabled': {
                                    background: alpha(
                                        theme.palette.text.disabled,
                                        0.12,
                                    ),
                                    color: alpha(
                                        theme.palette.text.primary,
                                        0.4,
                                    ),
                                    boxShadow: 'none',
                                },
                            }}
                        >
                            {submitting ? 'Sending...' : 'Send Feedback'}
                        </Button>
                    </DialogActions>
                </>
            ) : (
                    /* ── Success state ────────────────────────────────── */
                    <DialogContent
                        sx={{
                            textAlign: 'center',
                            py: 6,
                            px: 3,
                        }}
                    >
                        <Box
                            sx={{
                                width: 88,
                                height: 88,
                                borderRadius: '50%',
                                mx: 'auto',
                                mb: 2.5,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
                                boxShadow: `0 15px 40px ${alpha(
                                    theme.palette.success.main,
                                    0.45,
                                )}`,
                                position: 'relative',
                                animation:
                                    'popIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                                '@keyframes popIn': {
                                    '0%': {
                                        transform: 'scale(0.3)',
                                        opacity: 0,
                                    },
                                    '100%': {
                                        transform: 'scale(1)',
                                        opacity: 1,
                                    },
                                },
                                '&::after': {
                                    content: '""',
                                    position: 'absolute',
                                    inset: -8,
                                    borderRadius: '50%',
                                    border: `2px solid ${alpha(
                                        theme.palette.success.main,
                                        0.4,
                                    )}`,
                                    animation: 'pulse 2s ease-out infinite',
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
                                icon="solar:check-circle-bold"
                                width={44}
                                color={theme.palette.common.white}
                            />
                        </Box>

                        <Typography
                            variant="h6"
                            sx={{ fontWeight: 800, mb: 1, fontSize: '1.25rem' }}
                        >
                            Thank you! 🙏
                    </Typography>
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                maxWidth: 320,
                                mx: 'auto',
                                lineHeight: 1.6,
                                fontSize: '0.875rem',
                            }}
                        >
                            Your feedback has been sent successfully. We
                            appreciate you helping make SchoolPilot better!
                    </Typography>
                </DialogContent>
            )}
        </Dialog>
    );
};