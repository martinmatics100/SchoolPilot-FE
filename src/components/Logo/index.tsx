import React from 'react';
import { Box, Typography, useTheme, type SxProps, type Theme } from '@mui/material';
import { keyframes } from '@mui/system';

interface LogoProps {
    variant?: 'full' | 'icon' | 'text';
    size?: 'small' | 'medium' | 'large' | number;
    animated?: boolean;
    sx?: SxProps<Theme>;
    onClick?: () => void;
}

// Animation keyframes
const pilotGlide = keyframes`
  0%, 100% { transform: translateX(0) rotate(0deg); }
  50% { transform: translateX(3px) rotate(2deg); }
`;

const starPulse = keyframes`
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 1; transform: scale(1.2); }
`;

export const Logo: React.FC<LogoProps> = ({
    variant = 'full',
    size = 'medium',
    animated = false,
    sx,
    onClick
}) => {
    const theme = useTheme();

    // Size mapping
    const getSize = () => {
        if (typeof size === 'number') return size;
        switch (size) {
            case 'small': return 32;
            case 'large': return 80;
            default: return 48;
        }
    };

    const iconSize = getSize();
    const fontSize = typeof size === 'number' ? size * 0.5 :
        size === 'small' ? 20 : size === 'large' ? 40 : 28;

    // Icon-only variant
    const IconLogo = () => (
        <Box
            sx={{
                position: 'relative',
                width: iconSize,
                height: iconSize,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                animation: animated ? `${pilotGlide} 3s ease-in-out infinite` : 'none',
            }}
        >
            <svg
                width="100%"
                height="100%"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{ position: 'absolute' }}
            >
                {/* Cap Base */}
                <path
                    d="M20 45 L50 25 L80 45 L50 65 L20 45Z"
                    fill="currentColor"
                    opacity="0.9"
                />
                {/* Cap Top */}
                <rect
                    x="42"
                    y="15"
                    width="16"
                    height="12"
                    fill="currentColor"
                    opacity="0.7"
                />
                {/* Tassel */}
                <path
                    d="M58 18 Q68 10 62 5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                />
                <circle cx="62" cy="5" r="3" fill="currentColor" opacity="0.8" />

                {/* Open Book / Wings */}
                <path
                    d="M25 55 L50 70 L75 55"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    fill="none"
                    strokeLinecap="round"
                />
                <path
                    d="M50 70 L50 85"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                />

                {/* Navigation Star */}
                <polygon
                    points="50,35 53,44 62,44 55,50 58,59 50,54 42,59 45,50 38,44 47,44"
                    fill="currentColor"
                    opacity="0.7"
                    style={{
                        animation: animated ? `${starPulse} 2s ease-in-out infinite` : 'none',
                    }}
                />
            </svg>
        </Box>
    );

    // Fixed Text-only variant - shows both School and Pilot
    const TextLogo = () => (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 0.5,
                whiteSpace: 'nowrap',
            }}
        >
            <Typography
                component="span"
                sx={{
                    fontFamily: "'Poppins', 'Inter', system-ui, -apple-system, sans-serif",
                    fontWeight: 800,
                    fontSize: fontSize,
                    letterSpacing: '-0.5px',
                    color: theme.palette.text.primary,
                    display: 'inline-block',
                }}
            >
                School
            </Typography>
            <Typography
                component="span"
                sx={{
                    fontFamily: "'Poppins', 'Inter', system-ui, -apple-system, sans-serif",
                    fontWeight: 600,
                    fontSize: fontSize,
                    letterSpacing: '-0.5px',
                    color: theme.palette.primary.main,
                    display: 'inline-block',
                    position: 'relative',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        bottom: -2,
                        left: 0,
                        right: 0,
                        height: 2,
                        background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
                        transform: 'scaleX(0)',
                        transition: 'transform 0.3s ease',
                    },
                    '&:hover::after': {
                        transform: 'scaleX(1)',
                    },
                }}
            >
                Pilot
            </Typography>
        </Box>
    );

    // Full logo (icon + text) - fixed to show both words
    const FullLogo = () => (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: onClick ? 'pointer' : 'default',
                transition: 'transform 0.2s ease',
                '&:hover': {
                    transform: 'scale(1.02)',
                },
                ...sx
            }}
            onClick={onClick}
        >
            <Box sx={{ color: theme.palette.primary.main, flexShrink: 0 }}>
                <IconLogo />
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography
                    sx={{
                        fontFamily: "'Poppins', 'Inter', system-ui, -apple-system, sans-serif",
                        fontWeight: 800,
                        fontSize: fontSize * 0.7,
                        lineHeight: 1.2,
                        color: theme.palette.text.primary,
                    }}
                >
                    School
                </Typography>
                <Typography
                    sx={{
                        fontFamily: "'Poppins', 'Inter', system-ui, -apple-system, sans-serif",
                        fontWeight: 600,
                        fontSize: fontSize * 0.6,
                        lineHeight: 1.2,
                        color: theme.palette.primary.main,
                    }}
                >
                    Pilot
                </Typography>
            </Box>
        </Box>
    );

    // Alternative horizontal full logo (shows both words side by side)
    const HorizontalFullLogo = () => (
        <Box
            sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1.5,
                cursor: onClick ? 'pointer' : 'default',
                transition: 'transform 0.2s ease',
                '&:hover': {
                    transform: 'scale(1.02)',
                },
                ...sx
            }}
            onClick={onClick}
        >
            <Box sx={{ color: theme.palette.primary.main, flexShrink: 0 }}>
                <IconLogo />
            </Box>
            <TextLogo />
        </Box>
    );

    // Render based on variant
    if (variant === 'icon') {
        return (
            <Box
                sx={{
                    color: theme.palette.primary.main,
                    cursor: onClick ? 'pointer' : 'default',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                        transform: 'scale(1.05)',
                        color: theme.palette.secondary.main,
                    },
                    ...sx
                }}
                onClick={onClick}
            >
                <IconLogo />
            </Box>
        );
    }

    if (variant === 'text') {
        return <TextLogo />;
    }

    // For sidebar, use horizontal layout to ensure both words show
    return <HorizontalFullLogo />;
};

// Alternative simplified logo for smaller spaces
export const SimpleLogo: React.FC<{ size?: number; sx?: SxProps<Theme> }> = ({
    size = 32,
    sx
}) => {
    const theme = useTheme();

    return (
        <Box
            sx={{
                width: size,
                height: size,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 2,
                background: `linear-gradient(135deg, ${theme.palette.background.default}, ${theme.palette.background.default})`,
                color: theme.palette.text.secondary,
                fontWeight: 'bold',
                fontSize: size * 0.5,
                boxShadow: theme.shadows[2],
                transition: 'all 0.2s ease',
                '&:hover': {
                    transform: 'scale(1.05)',
                    boxShadow: theme.shadows[4],
                },
                ...sx
            }}
        >
            SP
        </Box>
    );
};

export default Logo;