// src/components/feedback/FeedbackModal.tsx
import { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Stack,
    Typography,
    Alert,
    IconButton,
    Box,
    Chip,
} from '@mui/material';
import IconifyIcon from '../base/iconifyIcon';
import { useTheme } from '@mui/material';

type FeedbackType = 'suggestion' | 'bug' | 'feature' | 'compliment' | 'question';

interface FeedbackModalProps {
    open: boolean;
    onClose: () => void;
}

const feedbackTypes: { value: FeedbackType; label: string; icon: string; color: string }[] = [
    { value: 'suggestion', label: '💡 Feature Suggestion', icon: 'solar:lightbulb-bold', color: '#FF9800' },
    { value: 'bug', label: '🐛 Report Bug/Issue', icon: 'solar:bug-bold', color: '#F44336' },
    { value: 'feature', label: '✨ Request Feature', icon: 'solar:star-bold', color: '#4CAF50' },
    { value: 'compliment', label: '❤️ Compliment', icon: 'solar:heart-bold', color: '#E91E63' },
    { value: 'question', label: '❓ Question', icon: 'solar:question-circle-bold', color: '#2196F3' },
];

export const FeedbackModal = ({ open, onClose }: FeedbackModalProps) => {
    const theme = useTheme();
    const [feedbackType, setFeedbackType] = useState<FeedbackType>('suggestion');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) return;

        setLoading(true);

        // Send feedback to your backend
        try {
            const response = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: feedbackType,
                    title,
                    description,
                    email: email || undefined,
                    userAgent: navigator.userAgent,
                    url: window.location.href,
                    timestamp: new Date().toISOString(),
                }),
            });

            if (response.ok) {
                setSubmitted(true);
                setTimeout(() => {
                    onClose();
                    setSubmitted(false);
                    resetForm();
                }, 2000);
            }
        } catch (error) {
            console.error('Failed to submit feedback:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setFeedbackType('suggestion');
        setTitle('');
        setDescription('');
        setEmail('');
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    bgcolor: theme.palette.background.default,
                }
            }}
        >
            {!submitted ? (
                <>
                    <DialogTitle sx={{ pb: 1 }}>
                        <Stack direction="row" alignItems="center" spacing={1}>
                            <IconifyIcon
                                icon="solar:chat-round-like-bold"
                                width={28}
                                height={28}
                                sx={{ color: theme.palette.primary.main }}
                            />
                            <Box>
                                <Typography variant="h6" fontWeight={700}>
                                    Help Improve SchoolPilot
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                    Your feedback helps us build a better school management system
                                </Typography>
                            </Box>
                            <IconButton onClick={onClose} sx={{ ml: 'auto' }}>
                                <IconifyIcon icon="mdi:close" width={20} />
                            </IconButton>
                        </Stack>
                    </DialogTitle>

                    <DialogContent>
                        <Stack spacing={3} sx={{ mt: 1 }}>
                            <FormControl component="fieldset">
                                <FormLabel component="legend" sx={{ mb: 1, fontWeight: 600 }}>
                                    What would you like to share?
                                </FormLabel>
                                <RadioGroup
                                    row
                                    value={feedbackType}
                                    onChange={(e) => setFeedbackType(e.target.value as FeedbackType)}
                                >
                                    {feedbackTypes.map((type) => (
                                        <FormControlLabel
                                            key={type.value}
                                            value={type.value}
                                            control={<Radio />}
                                            label={
                                                <Stack direction="row" alignItems="center" spacing={0.5}>
                                                    <span>{type.label}</span>
                                                </Stack>
                                            }
                                        />
                                    ))}
                                </RadioGroup>
                            </FormControl>

                            <TextField
                                fullWidth
                                label="Title"
                                placeholder="Brief summary of your feedback"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                size="small"
                            />

                            <TextField
                                fullWidth
                                label="Description"
                                placeholder="Please provide details..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                multiline
                                rows={4}
                                required
                            />

                            <TextField
                                fullWidth
                                label="Email (Optional)"
                                placeholder="We may contact you for clarification"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                type="email"
                                size="small"
                                helperText="We'll only use this to follow up on your feedback"
                            />

                            <Alert severity="info" sx={{ fontSize: '0.75rem', bgcolor: theme.palette.grey[900] }}>
                                <Typography variant="caption">
                                    We read every feedback! Your input helps make SchoolPilot better for schools worldwide.
                                </Typography>
                            </Alert>
                        </Stack>
                    </DialogContent>

                    <DialogActions sx={{ p: 3, pt: 0 }}>
                        <Button onClick={onClose}>Cancel</Button>
                        <Button
                            variant="contained"
                            onClick={handleSubmit}
                            disabled={!title.trim() || !description.trim() || loading}
                            startIcon={<IconifyIcon icon="solar:send-bold" />}
                        >
                            {loading ? 'Sending...' : 'Send Feedback'}
                        </Button>
                    </DialogActions>
                </>
            ) : (
                <DialogContent sx={{ textAlign: 'center', py: 6 }}>
                    <IconifyIcon
                        icon="solar:check-circle-bold"
                        width={64}
                        height={64}
                        sx={{ color: theme.palette.success.main, mb: 2 }}
                    />
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                        Thank You! 🙏
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                        Your feedback has been submitted successfully.
                        <br />
                        We appreciate you helping improve SchoolPilot!
                    </Typography>
                </DialogContent>
            )}
        </Dialog>
    );
};