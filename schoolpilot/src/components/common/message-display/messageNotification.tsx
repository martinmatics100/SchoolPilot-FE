// MessageNotification.tsx
import { Snackbar, Alert, type AlertProps } from '@mui/material';

interface MessageNotificationProps {
    open: boolean;
    message: string;
    severity: AlertProps['severity'];
    onClose: () => void;
}

export const MessageNotification = ({
    open,
    message,
    severity,
    onClose,
}: MessageNotificationProps) => {
    return (
        <Snackbar
            open={open}
            autoHideDuration={6000}
            onClose={onClose}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
            sx={{ maxWidth: '80%' }}
        >
            <Alert
                onClose={onClose}
                severity={severity}
                variant="filled"
                sx={{ width: '100%' }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
};