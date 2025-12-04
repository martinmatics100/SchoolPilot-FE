// src/components/common/action-button.tsx
import * as React from 'react';
import Button from '@mui/material/Button';
import { type SxProps } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

interface ActionButtonProps {
    children?: React.ReactNode;
    startIcon?: React.ReactNode;
    variant?: 'text' | 'outlined' | 'contained';
    sx?: SxProps;
    onClick: () => void | Promise<void>;
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

export const ActionButton: React.FC<ActionButtonProps> = ({
    children,
    startIcon,
    variant = 'contained',
    sx = {},
    onClick,
    disabled = false,
    loading = false,
    type = 'button'
}) => {
    return (
        <Button
            variant={variant}
            startIcon={loading ? <CircularProgress size={20} /> : startIcon}
            onClick={onClick}
            disabled={disabled || loading}
            type={type}
            sx={{
                marginBottom: 2,
                marginTop: 5,
                maxHeight: "3rem",
                maxWidth: "100%",
                ...sx
            }}
        >
            {children}
        </Button>
    );
};