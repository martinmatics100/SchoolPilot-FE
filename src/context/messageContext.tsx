// MessageContext.tsx
import { createContext, useContext, useState } from 'react';
import { type AlertColor } from '@mui/material';
import { MessageNotification } from '../components/message-display/messageNotification';

interface MessageContextType {
    showMessage: (message: string, severity?: AlertColor) => void;
}

const MessageContext = createContext<MessageContextType>({
    showMessage: () => { },
});

export const useMessage = () => useContext(MessageContext);

export const MessageProvider = ({ children }: { children: React.ReactNode }) => {
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [severity, setSeverity] = useState<AlertColor>('info');

    const showMessage = (newMessage: string, newSeverity: AlertColor = 'info') => {
        setMessage(newMessage);
        setSeverity(newSeverity);
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    return (
        <MessageContext.Provider value={{ showMessage }}>
            {children}
            <MessageNotification
                open={open}
                message={message}
                severity={severity}
                onClose={handleClose}
            />
        </MessageContext.Provider>
    );
};