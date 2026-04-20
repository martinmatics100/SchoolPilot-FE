// src/components/common/action-button.tsx
import * as React from 'react';
import Button from '@mui/material/Button';
import { type SxProps, alpha, useTheme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

interface ActionButtonProps {
    children?: React.ReactNode;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    variant?: 'text' | 'outlined' | 'contained';
    color?: 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
    size?: 'small' | 'medium' | 'large';
    sx?: SxProps;
    onClick: () => void | Promise<void>;
    disabled?: boolean;
    loading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    fullWidth?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
    children,
    startIcon,
    endIcon,
    variant = 'contained',
    color = 'primary',
    size = 'small',
    sx = {},
    onClick,
    disabled = false,
    loading = false,
    type = 'button',
    fullWidth = false
}) => {
    const theme = useTheme();

    // Size configurations
    const sizeConfig = {
        small: {
            py: 0.5,
            px: 1.5,
            fontSize: '0.75rem',
            iconSize: 16,
            minHeight: '32px',
        },
        medium: {
            py: 0.75,
            px: 2,
            fontSize: '0.813rem',
            iconSize: 18,
            minHeight: '36px',
        },
        large: {
            py: 1,
            px: 2.5,
            fontSize: '0.875rem',
            iconSize: 20,
            minHeight: '40px',
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
                '&:active': {
                    transform: 'translateY(0)',
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
                '&:active': {
                    transform: 'translateY(0)',
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
            '&:active': {
                transform: 'translateY(0)',
            },
        };
    };

    return (
        <Button
            variant={variant}
            startIcon={!loading && startIcon}
            endIcon={!loading && endIcon}
            onClick={onClick}
            disabled={disabled || loading}
            type={type}
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
                minWidth: fullWidth ? '100%' : 'auto',
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
                '&.Mui-disabled': {
                    opacity: 0.5,
                    transform: 'none',
                },
                ...sx,
            }}
        >
            {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress
                        size={currentSize.iconSize}
                        sx={{
                            color: variant === 'contained' ? 'white' : `${color}.main`,
                        }}
                    />
                    {children}
                </Box>
            ) : (
                children
            )}
        </Button>
    );
};