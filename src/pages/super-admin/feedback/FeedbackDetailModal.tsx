import React, { useEffect, useState } from 'react';
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
    Box,
    Divider,
    Chip,
    IconButton,
    CircularProgress,
    Alert,
    alpha,
    useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material';
import IconifyIcon from '../../../components/base/iconifyIcon';
import type { FeedbackItem } from '../../../api/feedbackService';

interface FeedbackDetailModalProps {
    open: boolean;
    feedback: FeedbackItem | null;
    statusOptions: Array<{ value: number; label: string }>;
    typeLabelFor: (type: number) => string;
    isSaving: boolean;
    onClose: () => void;
    onSave: (payload: {
        status: number;
        publicReply: string | null;
        internalNotes: string | null;
    }) => Promise<void>;
}

export const FeedbackDetailModal = ({
    open,
    feedback,
    statusOptions,
    typeLabelFor,
    isSaving,
    onClose,
    onSave,
}: FeedbackDetailModalProps) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const [status, setStatus] = useState<number>(1);
    const [publicReply, setPublicReply] = useState('');
    const [internalNotes, setInternalNotes] = useState('');
    const [saveError, setSaveError] = useState<string | null>(null);

    // Seed local state whenever the modal opens with a new item.
    useEffect(() => {
        if (open && feedback) {
            setStatus(feedback.status);
            setPublicReply(feedback.publicReply ?? '');
            setInternalNotes(feedback.internalNotes ?? '');
            setSaveError(null);
        }
    }, [open, feedback]);

    const handleSave = async () => {
        setSaveError(null);
        try {
            await onSave({
                status,
                publicReply: publicReply.trim() || null,
                internalNotes: internalNotes.trim() || null,
            });
        } catch (err: any) {
            setSaveError(err?.message ?? 'Could not save changes. Please try again.');
        }
    };

    if (!feedback) return null;

    return (
        <Dialog
            open={open}
            onClose={isSaving ? undefined : onClose}
            maxWidth="md"
            fullWidth
            fullScreen={isMobile}
            PaperProps={{
                sx: {
                    borderRadius: { xs: 0, sm: 3 },
                    bgcolor: 'background.default',
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 2,
                    pb: 2,
                }}
            >
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ minWidth: 0 }}>
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                            flexShrink: 0,
                        }}
                    >
                        <IconifyIcon icon="solar:chat-round-dots-bold" width={22} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                        <Typography variant="h6" sx={{ fontWeight: 700 }} noWrap>
                            {feedback.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Submitted {feedback.createdOn
                                ? new Date(feedback.createdOn).toLocaleString()
                                : '—'}
                        </Typography>
                    </Box>
                </Stack>
                <IconButton
                    onClick={onClose}
                    disabled={isSaving}
                    size="small"
                    aria-label="close"
                >
                    <IconifyIcon icon="mdi:close" width={22} />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers sx={{ pt: 2 }}>
                <Stack spacing={2.5}>
                    {/* ── Submitter + account block ── */}
                    <Box
                        sx={{
                            display: 'grid',
                            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                            gap: 2,
                        }}
                    >
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                Submitted by
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {feedback.submittedByName || '—'}
                            </Typography>
                            <Typography variant="caption" color="text.disabled">
                                {feedback.submittedByEmail || ''}
                            </Typography>
                        </Box>
                        <Box>
                            <Typography variant="caption" color="text.secondary">
                                School
                            </Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>
                                {feedback.accountName || '—'}
                            </Typography>
                        </Box>
                    </Box>

                    {/* ── Type + severity + page url ── */}
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        <Chip
                            size="small"
                            label={typeLabelFor(feedback.type)}
                            sx={{
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: theme.palette.primary.main,
                                fontWeight: 600,
                                borderRadius: 1.5,
                            }}
                        />
                        {feedback.severity && (
                            <Chip
                                size="small"
                                label={`Severity: ${feedback.severity}`}
                                sx={{
                                    bgcolor: alpha(theme.palette.warning.main, 0.1),
                                    color: theme.palette.warning.dark,
                                    fontWeight: 600,
                                    borderRadius: 1.5,
                                }}
                            />
                        )}
                        {feedback.pageUrl && (
                            <Chip
                                size="small"
                                component="a"
                                href={feedback.pageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                clickable
                                icon={<IconifyIcon icon="mdi:link-variant" width={14} />}
                                label="Open page"
                                sx={{
                                    bgcolor: alpha(theme.palette.info.main, 0.1),
                                    color: theme.palette.info.dark,
                                    fontWeight: 600,
                                    borderRadius: 1.5,
                                }}
                            />
                        )}
                    </Stack>

                    <Divider />

                    {/* ── Full description ── */}
                    <Box>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{ textTransform: 'uppercase', letterSpacing: 0.8, fontWeight: 700 }}
                        >
                            Description
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                mt: 1,
                                whiteSpace: 'pre-wrap',
                                lineHeight: 1.7,
                                color: 'text.primary',
                            }}
                        >
                            {feedback.description}
                        </Typography>
                    </Box>

                    <Divider />

                    {/* ── Editable fields ── */}
                    <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 700, color: theme.palette.primary.main }}
                    >
                        Take action
                    </Typography>

                    <FormControl fullWidth size="small" disabled={isSaving}>
                        <InputLabel id="status-label">Status</InputLabel>
                        <Select
                            labelId="status-label"
                            value={status}
                            onChange={(e) => setStatus(Number(e.target.value))}
                            label="Status"
                        >
                            {statusOptions.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>
                                    {opt.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        maxRows={8}
                        label="Public reply"
                        placeholder="Optional — shown to the submitter"
                        value={publicReply}
                        onChange={(e) => setPublicReply(e.target.value)}
                        disabled={isSaving}
                        helperText="Visible to the user who submitted this feedback."
                        slotProps={{ htmlInput: { maxLength: 4000 } }}
                    />

                    <TextField
                        fullWidth
                        multiline
                        minRows={3}
                        maxRows={10}
                        label="Internal notes"
                        placeholder="Private — only the platform team sees this"
                        value={internalNotes}
                        onChange={(e) => setInternalNotes(e.target.value)}
                        disabled={isSaving}
                        helperText="Not shown to the submitter."
                        slotProps={{ htmlInput: { maxLength: 4000 } }}
                    />

                    {saveError && (
                        <Alert severity="error" sx={{ borderRadius: 2 }}>
                            {saveError}
                        </Alert>
                    )}
                </Stack>
            </DialogContent>

            <DialogActions
                sx={{
                    p: { xs: 2, sm: 3 },
                    flexDirection: { xs: 'column-reverse', sm: 'row' },
                    gap: 1,
                }}
            >
                <Button
                    onClick={onClose}
                    disabled={isSaving}
                    fullWidth={isMobile}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={isSaving}
                    fullWidth={isMobile}
                    startIcon={
                        isSaving ? (
                            <CircularProgress size={16} color="inherit" />
                        ) : (
                            <IconifyIcon icon="mdi:content-save" width={18} />
                        )
                    }
                    sx={{
                        textTransform: 'none',
                        fontWeight: 700,
                        minWidth: 140,
                    }}
                >
                    {isSaving ? 'Saving…' : 'Save changes'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};