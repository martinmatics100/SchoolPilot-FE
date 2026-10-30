import React, { useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export interface MessageDisplayProps {
    feMessage?: string | null;
    beMessage?: string | null;
    httpStatus?: number;
}

const MessageDisplay: React.FC<MessageDisplayProps> = ({
    feMessage,
    beMessage,
    httpStatus,
}) => {
    useEffect(() => {
        // Determine toast type from httpStatus
        let toastType: 'success' | 'info' | 'warning' | 'error' = 'info';
        if (httpStatus) {
            switch (httpStatus) {
                case 200:
                case 201:
                    toastType = 'success';
                    break;
                case 400:
                case 401:
                case 403:
                case 500:
                    toastType = 'error';
                    break;
                case 404:
                    toastType = 'warning';
                    break;
                default:
                    toastType = 'info';
            }
        }

        const show = (msg: string) => {
            switch (toastType) {
                case 'success': toast.success(msg); break;
                case 'info': toast.info(msg); break;
                case 'warning': toast.warn(msg); break;
                case 'error': toast.error(msg); break;
            }
        };

        const fe = feMessage?.trim();
        const be = beMessage?.trim();

        // BE takes precedence visually (shown last so it sits on top),
        // but both display when both are provided and non-empty.
        if (fe) show(fe);
        if (be && be !== fe) show(be);
    }, [feMessage, beMessage, httpStatus]);

    return (
        <ToastContainer
            position="top-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            theme="light"
        />
    );
};

export default MessageDisplay;