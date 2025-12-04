import React, { useEffect, useState } from 'react';
import {
    Alert,
    Box,
    Collapse,
    IconButton,
    Typography,
    useTheme,
    useMediaQuery
} from '@mui/material';
import {
    CheckCircle as SuccessIcon,
    Error as ErrorIcon,
    Warning as WarningIcon,
    Info as InfoIcon,
    Close as CloseIcon
} from '@mui/icons-material';

type MessageSeverity = 'error' | 'warning' | 'info' | 'success';

interface Message {
    text: string;
    severity: MessageSeverity;
}

interface AlertMessageProps {
    frontendMessage?: Message | null;
    backendMessage?: Message | null;
    autoHideDuration?: number; // in milliseconds
    onClose?: () => void;
}

const AlertMessage: React.FC<AlertMessageProps> = ({
    frontendMessage,
    backendMessage,
    autoHideDuration = 6000,
    onClose
}) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [open, setOpen] = useState(false);
    const [progress, setProgress] = useState(100);
    const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);

    // Set icons based on severity
    const getIcon = (severity: MessageSeverity) => {
        switch (severity) {
            case 'success':
                return <SuccessIcon fontSize="inherit" />;
            case 'error':
                return <ErrorIcon fontSize="inherit" />;
            case 'warning':
                return <WarningIcon fontSize="inherit" />;
            case 'info':
            default:
                return <InfoIcon fontSize="inherit" />;
        }
    };

    // Determine the highest severity for the alert color
    const getHighestSeverity = () => {
        if (displayedMessages.some(m => m.severity === 'error')) return 'error';
        if (displayedMessages.some(m => m.severity === 'warning')) return 'warning';
        if (displayedMessages.some(m => m.severity === 'success')) return 'success';
        return 'info';
    };

    // Combine and prioritize messages
    useEffect(() => {
        const messages: Message[] = [];
        if (frontendMessage) messages.push(frontendMessage);
        if (backendMessage) messages.push(backendMessage);
        setDisplayedMessages(messages);
        setOpen(messages.length > 0);
        setProgress(100);
    }, [frontendMessage, backendMessage]);

    // Auto-hide functionality with progress bar
    useEffect(() => {
        if (!open || !autoHideDuration) return;

        const totalSteps = autoHideDuration / 50;
        let step = 0;

        const timer = setInterval(() => {
            step += 1;
            setProgress(100 - (step / totalSteps) * 100);

            if (step >= totalSteps) {
                clearInterval(timer);
                setOpen(false);
                if (onClose) onClose();
            }
        }, 50);

        return () => clearInterval(timer);
    }, [open, autoHideDuration, onClose]);

    if (!open || displayedMessages.length === 0) return null;

    const highestSeverity = getHighestSeverity();

    return (
        <Box
            sx={{
                position: 'fixed',
                top: isMobile ? 16 : 24,
                left: '50%',
                transform: 'translateX(-50%)',
                width: isMobile ? '90%' : '60%',
                maxWidth: 400,
                zIndex: theme.zIndex.snackbar
            }}
        >
            <Collapse in={open}>
                <Alert
                    severity={highestSeverity}
                    icon={getIcon(highestSeverity)}
                    sx={{
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: theme.shadows[6],
                        '&:before': {
                            content: '""',
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            backgroundColor: theme.palette[highestSeverity].light,
                            transform: `scaleX(${progress / 100})`,
                            transformOrigin: 'left center',
                            transition: 'transform 0.05s linear'
                        }
                    }}
                    action={
                        <IconButton
                            size="small"
                            onClick={() => {
                                setOpen(false);
                                if (onClose) onClose();
                            }}
                        >
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    }
                >
                    <Box sx={{ width: '100%' }}>
                        {displayedMessages.map((message, index) => (
                            <Typography
                                key={index}
                                variant="body2"
                                sx={{
                                    fontWeight: index === 0 ? 600 : 400,
                                    color: theme.palette[message.severity].main,
                                    mb: index === 0 && displayedMessages.length > 1 ? 1 : 0
                                }}
                            >
                                {message.text}
                            </Typography>
                        ))}
                    </Box>
                </Alert>
            </Collapse>
        </Box>
    );
};

export default AlertMessage;