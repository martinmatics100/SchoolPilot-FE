// Create a new file at: src/components/common/navigation-button.tsx
import * as React from 'react';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import { type SxProps } from '@mui/material/styles';

interface NavigationButtonProps {
    to: string;
    children?: React.ReactNode;
    startIcon?: React.ReactNode;
    variant?: 'text' | 'outlined' | 'contained';
    sx?: SxProps;
}

export const NavigationButton: React.FC<NavigationButtonProps> = ({
    to,
    children,
    startIcon,
    variant = 'contained',
    sx = {}
}) => {
    return (
        <Button
            component={Link}
            to={to}
            variant={variant}
            startIcon={startIcon}
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