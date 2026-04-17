import * as React from 'react';
import Button from '@mui/material/Button';
import { Link } from 'react-router-dom';
import { type SxProps, alpha, useTheme } from '@mui/material/styles';

interface NavigationButtonProps {
    to?: string;
    children?: React.ReactNode;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    variant?: 'text' | 'outlined' | 'contained';
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
    size?: 'small' | 'medium' | 'large';
    sx?: SxProps;
    onClick?: () => void;
    disabled?: boolean;
    fullWidth?: boolean;
}

export const NavigationButton: React.FC<NavigationButtonProps> = ({
    to,
    children,
    startIcon,
    endIcon,
    variant = 'contained',
    color = 'primary',
    size = 'medium',
    sx = {},
    onClick,
    disabled = false,
    fullWidth = false,
}) => {
    const theme = useTheme();

    // Size configurations
    const sizeConfig = {
        small: {
            py: 0.5,
            px: 1.5,
            fontSize: '0.75rem',
            iconSize: 16,
        },
        medium: {
            py: 0.75,
            px: 2,
            fontSize: '0.813rem',
            iconSize: 18,
        },
        large: {
            py: 1,
            px: 2.5,
            fontSize: '0.875rem',
            iconSize: 20,
        },
    };

    const currentSize = sizeConfig[size];

    // Variant styles
    const getVariantStyles = () => {
        if (variant === 'contained') {
            return {
                bgcolor: `${color}.main`,
                color: 'white',
                boxShadow: 'none',
                '&:hover': {
                    bgcolor: `${color}.dark`,
                    boxShadow: `0 2px 8px ${alpha(theme.palette[color].main, 0.3)}`,
                    transform: 'translateY(-1px)',
                },
            };
        }
        if (variant === 'outlined') {
            return {
                borderColor: alpha(theme.palette[color].main, 0.5),
                color: `${color}.main`,
                bgcolor: 'transparent',
                '&:hover': {
                    borderColor: `${color}.main`,
                    bgcolor: alpha(theme.palette[color].main, 0.04),
                    transform: 'translateY(-1px)',
                },
            };
        }
        return {
            color: `${color}.main`,
            bgcolor: 'transparent',
            '&:hover': {
                bgcolor: alpha(theme.palette[color].main, 0.04),
                transform: 'translateY(-1px)',
            },
        };
    };

    return (
        <Button
            component={to ? Link : 'button'}
            to={to}
            variant={variant}
            startIcon={startIcon}
            endIcon={endIcon}
            onClick={onClick}
            disabled={disabled}
            fullWidth={fullWidth}
            size={size}
            sx={{
                py: currentSize.py,
                px: currentSize.px,
                fontSize: currentSize.fontSize,
                fontWeight: 500,
                textTransform: 'none',
                borderRadius: 2,
                letterSpacing: '0.3px',
                transition: 'all 0.2s ease-in-out',
                minWidth: { xs: fullWidth ? '100%' : 'auto', sm: 'auto' },
                whiteSpace: 'nowrap',
                ...getVariantStyles(),
                '& .MuiButton-startIcon': {
                    marginRight: 0.75,
                    '& svg': {
                        fontSize: currentSize.iconSize,
                    },
                },
                '& .MuiButton-endIcon': {
                    marginLeft: 0.75,
                    '& svg': {
                        fontSize: currentSize.iconSize,
                    },
                },
                '&:active': {
                    transform: 'translateY(0)',
                },
                '&.Mui-disabled': {
                    opacity: 0.5,
                    transform: 'none',
                },
                ...sx,
            }}
        >
            {children}
        </Button>
    );
};