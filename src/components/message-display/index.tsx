// src/components/common/message-display.tsx
import React, { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export interface MessageDisplayProps {
    feMessage?: string | null; // Frontend message (optional)
    beMessage?: string | null; // Backend message (optional)
    httpStatus?: number; // HTTP status code (optional)
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({ feMessage, beMessage, httpStatus }) => {
    useEffect(() => {
        let messageToDisplay = '';
        let toastType: 'success' | 'info' | 'warning' | 'error' = 'info';

        if (feMessage) {
            messageToDisplay = feMessage;
        }
        if (beMessage) {
            messageToDisplay = beMessage;
        }
        if (httpStatus) {
            switch (httpStatus) {
                case 200:
                case 201:
                    // messageToDisplay = beMessage || 'Operation successful';
                    toastType = 'success';
                    break;
                case 400:
                case 401:
                case 403:
                    // messageToDisplay = beMessage || 'Invalid request or unauthorized access';
                    toastType = 'error';
                    break;
                case 404:
                    // messageToDisplay = beMessage || 'Resource not found';
                    toastType = 'warning';
                    break;
                case 500:
                    // messageToDisplay = beMessage || 'Server error, please try again later';
                    toastType = 'error';
                    break;
                default:
                    // messageToDisplay = beMessage || feMessage || 'Unknown status';
                    toastType = 'info';
            }
        }

        if (messageToDisplay) {
            switch (toastType) {
                case 'success':
                    toast.success(messageToDisplay);
                    break;
                case 'info':
                    toast.info(messageToDisplay);
                    break;
                case 'warning':
                    toast.warn(messageToDisplay);
                    break;
                case 'error':
                    toast.error(messageToDisplay);
                    break;
            }
        }
    }, [feMessage, beMessage, httpStatus]);

    return <ToastContainer position="top-center" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick theme='light' />;
};

export default MessageDisplay;