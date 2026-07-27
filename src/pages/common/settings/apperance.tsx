import React, { useContext, useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    useTheme,
    alpha,
    Stack,
} from '@mui/material';
import IconifyIcon from '../../../components/base/iconifyIcon';
import { ThemeModeContext } from '../../../theme/theme-toggle/themeModeContext';

const AppearanceSettings = () => {
    const theme = useTheme();
    const { themeMode, toggleThemeMode } = useContext(ThemeModeContext);

    const [systemPreference, setSystemPreference] = useState<'light' | 'dark' | null>(null);
    const [selectedMode, setSelectedMode] = useState<'light' | 'dark' | 'system'>(() => {
        const saved = localStorage.getItem('theme');
        if (saved === 'light' || saved === 'dark') return saved;
        return 'system';
    });

    // Detect system preference
    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = (e: MediaQueryListEvent) => {
            setSystemPreference(e.matches ? 'dark' : 'light');
        };

        setSystemPreference(mediaQuery.matches ? 'dark' : 'light');
        mediaQuery.addEventListener('change', handleChange);

        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    const handleModeSelect = (mode: 'light' | 'dark' | 'system') => {
        setSelectedMode(mode);

        if (mode === 'system') {
            const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            const currentMode = isDark ? 'dark' : 'light';
            if (currentMode !== themeMode) {
                toggleThemeMode();
            }
            localStorage.setItem('theme', 'system');
        } else {
            if (mode !== themeMode) {
                toggleThemeMode();
            }
            localStorage.setItem('theme', mode);
        }
    };

    const getCurrentDisplayMode = (): 'light' | 'dark' => {
        if (selectedMode === 'system') {
            return systemPreference || 'light';
        }
        return selectedMode;
    };

    const currentDisplayMode = getCurrentDisplayMode();

    // Theme option buttons
    const ThemeButton = ({
        mode,
        label,
        icon
    }: {
        mode: 'light' | 'dark' | 'system';
        label: string;
        icon: string;
    }) => {
        const isActive = selectedMode === mode;

        return (
            <Button
                fullWidth
                variant={isActive ? 'contained' : 'outlined'}
                onClick={() => handleModeSelect(mode)}
                startIcon={<IconifyIcon icon={icon} width={20} />}
                sx={{
                    flex: 1,
                    py: 1.5,
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.9rem',
                    minWidth: { xs: '100%', sm: 'auto' },
                    borderColor: isActive ? 'transparent' : alpha(theme.palette.divider, 0.5),
                    bgcolor: isActive
                        ? theme.palette.primary.main
                        : 'transparent',
                    color: isActive
                        ? theme.palette.primary.contrastText
                        : theme.palette.text.primary,
                    '&:hover': {
                        bgcolor: isActive
                            ? theme.palette.primary.dark
                            : alpha(theme.palette.primary.main, 0.05),
                        borderColor: isActive
                            ? 'transparent'
                            : theme.palette.primary.main,
                    },
                    transition: 'all 0.2s ease',
                }}
            >
                {label}
                {isActive && (
                    <Box
                        component="span"
                        sx={{
                            ml: 1,
                            display: 'inline-flex',
                            alignItems: 'center',
                        }}
                    >
                        <IconifyIcon icon="mdi:check-circle" width={16} />
                    </Box>
                )}
                {mode === 'system' && (
                    <Typography
                        component="span"
                        variant="caption"
                        sx={{
                            ml: 1,
                            opacity: 0.7,
                            fontWeight: 400,
                            fontSize: '0.65rem',
                        }}
                    >
                        ({systemPreference === 'dark' ? '🌙' : '☀️'})
                    </Typography>
                )}
            </Button>
        );
    };

    return (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
            {/* Header */}
            <Box sx={{ mb: 3 }}>
                <Typography
                    variant="h5"
                    sx={{
                        fontWeight: 700,
                        color: theme.palette.text.primary,
                        fontSize: { xs: '1.1rem', sm: '1.25rem' },
                        mb: 0.5,
                    }}
                >
                    Appearance
                </Typography>
                <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}
                >
                    Customize the look and feel of your interface
                </Typography>
            </Box>

            {/* Current theme indicator */}
            <Box
                sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1.5,
                    mb: 3,
                    p: 1.5,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                }}
            >
                <IconifyIcon
                    icon={currentDisplayMode === 'dark' ? 'mdi:weather-night' : 'mdi:weather-sunny'}
                    width={20}
                    color={theme.palette.primary.main}
                />
                <Typography variant="body2" color="text.secondary">
                    Currently:{' '}
                    <strong>
                        {selectedMode === 'system'
                            ? `System (${currentDisplayMode === 'dark' ? 'Dark' : 'Light'})`
                            : currentDisplayMode === 'dark' ? 'Dark' : 'Light'}
                    </strong>
                </Typography>
            </Box>

            {/* Theme buttons in a row */}
            <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={1.5}
                sx={{ width: '100%' }}
            >
                <ThemeButton
                    mode="system"
                    label="System"
                    icon="mdi:desktop-classic"
                />
                <ThemeButton
                    mode="light"
                    label="Light"
                    icon="mdi:weather-sunny"
                />
                <ThemeButton
                    mode="dark"
                    label="Dark"
                    icon="mdi:weather-night"
                />
            </Stack>

            {/* Optional: Small info note */}
            <Typography
                variant="caption"
                color="text.disabled"
                sx={{
                    display: 'block',
                    mt: 2,
                    fontSize: '0.7rem',
                }}
            >
                💡 Your preference is saved locally and persists across sessions.
            </Typography>
        </Box>
    );
};

export default AppearanceSettings;