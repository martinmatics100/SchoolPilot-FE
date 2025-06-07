import React from 'react';
import { Box, Typography, IconButton, Stack } from '@mui/material';
import IconifyIcon from '../../base/iconifyIcon';
import { Transition } from 'react-transition-group';

interface MessageDisplayProps {
    message: string;
    type: 'error' | 'success';
    source: 'frontend' | 'backend';
    open: boolean;
    onClose: () => void;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({
    message,
    type,
    source,
    open,
    onClose,
}) => {
    return (
        <Transition in={open} timeout={300} unmountOnExit>
            {(state) => (
                <Box
                    sx={{
                        position: 'fixed',
                        top: 0,
                        left: '50%',
                        transform: 'translateX(-50%)',
                        width: '90%',
                        maxWidth: 600,
                        zIndex: 9999,
                        backgroundColor: type === 'error' ? 'red' : 'green',
                        color: 'white',
                        padding: 2,
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        opacity: state === 'entered' ? 1 : 0,
                        transition: 'opacity 300ms ease',
                    }}
                >
                    <Stack direction="row" alignItems="center" gap={2}>
                        {type === 'error' ? (
                            <IconifyIcon icon="carbon:error" color="white" />
                        ) : (
                            <IconifyIcon icon="fluent-mdl2:checkmark" color="white" />
                        )}
                        <Typography variant="body1">{message}</Typography>
                    </Stack>
                    <IconButton
                        onClick={onClose}
                        sx={{
                            color: 'white',
                        }}
                    >
                        <IconifyIcon icon="eva:close-fill" />
                    </IconButton>
                </Box>
            )}
        </Transition>
    );
};

export default MessageDisplay;
