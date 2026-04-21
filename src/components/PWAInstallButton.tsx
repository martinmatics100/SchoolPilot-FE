// src/components/PWAInstallButton.tsx
import { useState, useEffect } from 'react';
import { Button, Snackbar, Alert, Box, Typography, Fab } from '@mui/material';
import IconifyIcon from './base/iconifyIcon';

interface BeforeInstallPromptEvent extends Event {
    prompt: () => Promise<void>;
    userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

// Store the install prompt globally so it can be triggered from anywhere
declare global {
    interface Window {
        deferredPrompt: BeforeInstallPromptEvent | null;
        triggerPWAInstall: (() => void) | null;
    }
}

export const PWAInstallButton = () => {
    const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
    const [isInstalled, setIsInstalled] = useState(false);
    const [showSnackbar, setShowSnackbar] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e as BeforeInstallPromptEvent);
            window.deferredPrompt = e as BeforeInstallPromptEvent;
            setShowSnackbar(true);
        };

        window.addEventListener('beforeinstallprompt', handler);

        window.addEventListener('appinstalled', () => {
            setIsInstalled(true);
            setInstallPrompt(null);
            window.deferredPrompt = null;
            setShowSnackbar(false);
        });

        // Expose trigger function globally
        window.triggerPWAInstall = () => {
            if (installPrompt) {
                handleInstallClick();
            }
        };

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            window.triggerPWAInstall = null;
        };
    }, [installPrompt]);

    const handleInstallClick = async () => {
        if (!installPrompt) return;

        await installPrompt.prompt();
        const result = await installPrompt.userChoice;

        if (result.outcome === 'accepted') {
            console.log('User accepted the install prompt');
            setIsInstalled(true);
        }

        setInstallPrompt(null);
        window.deferredPrompt = null;
        setShowSnackbar(false);
    };

    if (isInstalled) return null;

    return (
        <>
            {/* Floating Action Button for Desktop */}
            {installPrompt && (
                <Fab
                    variant="extended"
                    onClick={handleInstallClick}
                    color="primary"
                    sx={{
                        position: 'fixed',
                        bottom: 20,
                        right: 20,
                        zIndex: 1300,
                        gap: 1,
                        animation: 'pulse 2s infinite',
                        '@keyframes pulse': {
                            '0%': { transform: 'scale(1)', boxShadow: 3 },
                            '50%': { transform: 'scale(1.05)', boxShadow: 6 },
                            '100%': { transform: 'scale(1)', boxShadow: 3 },
                        },
                    }}
                >
                    <IconifyIcon icon="solar:download-bold" width={20} />
                    Install App
                </Fab>
            )}

            {/* Mobile Snackbar Prompt */}
            <Snackbar
                open={showSnackbar && !isInstalled}
                autoHideDuration={10000}
                onClose={() => setShowSnackbar(false)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert
                    severity="info"
                    variant="filled"
                    onClose={() => setShowSnackbar(false)}
                    sx={{ width: '100%' }}
                >
                    <Typography variant="body2" fontWeight={600}>
                        Install SchoolPilot App
                    </Typography>
                    <Typography variant="caption" display="block" sx={{ mb: 1 }}>
                        Get faster access and offline capabilities
                    </Typography>
                    <Button
                        size="small"
                        variant="contained"
                        color="inherit"
                        onClick={handleInstallClick}
                    >
                        Install Now
                    </Button>
                </Alert>
            </Snackbar>
        </>
    );
};