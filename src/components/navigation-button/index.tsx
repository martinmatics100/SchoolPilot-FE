import * as React from 'react';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import { type SxProps } from '@mui/material/styles';

interface NavigationButtonProps {
    to?: string; // Made optional to allow buttons without navigation
    children?: React.ReactNode;
    startIcon?: React.ReactNode;
    variant?: 'text' | 'outlined' | 'contained';
    sx?: SxProps;
    onClick?: () => void; // Added onClick prop
    disabled?: boolean; // Added disabled prop
}

export const NavigationButton: React.FC<NavigationButtonProps> = ({
    to,
    children,
    startIcon,
    variant = 'contained',
    sx = {},
    onClick,
    disabled = false, // Default to false
}) => {
    return (
        <Button
            component={to ? Link : 'button'} // Use Link if 'to' is provided, else use 'button'
            to={to}
            variant={variant}
            startIcon={startIcon}
            onClick={onClick}
            disabled={disabled}
            sx={{
                marginBottom: 2,
                marginTop: 5,
                maxHeight: '10rem',
                maxWidth: '100%',
                fontSize: '1rem',
                ...sx,
            }}
        >
            {children}
        </Button>
    );
};