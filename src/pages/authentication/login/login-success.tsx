import {
    Box,
    Paper,
    Stack,
    Button,
    Typography,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import paths from '../../../routes/paths';
import { useEffect } from 'react';
import { useTheme } from '@mui/material/styles';

const LoginSuccess = () => {

    const theme = useTheme();

    const navigate = useNavigate();
    // const { selectedAccount, role } = useAuth();

    // Prevent browser navigation (back/forward buttons)
    useEffect(() => {
        // Disable back button
        const handleBackButton = (e: PopStateEvent) => {
            // Prevent default back navigation
            window.history.pushState(null, '', window.location.pathname);
        };

        // Disable forward button
        window.history.pushState(null, '', window.location.pathname);

        // Add event listener for popstate (back/forward navigation)
        window.addEventListener('popstate', handleBackButton);

        // Push another state to prevent back navigation to login
        window.history.pushState(null, '', window.location.pathname);

        return () => {
            window.removeEventListener('popstate', handleBackButton);
        };
    }, []);

    const handleOk = () => {
        // Clear the history and navigate to account selection
        window.history.replaceState(null, '', paths.home);
        navigate(paths.home, { replace: true });
    };

    const handleCancel = () => {
        // Clear the history and navigate back to login
        window.history.replaceState(null, '', paths.login);
        navigate(paths.login, { replace: true });
    };

    return (
        <Box
            sx={{
                minHeight: '80vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: theme.palette.background.default,
                p: 2
            }}
        >
            <Paper
                sx={{
                    py: 8,
                    px: { xs: 4, sm: 6 },
                    maxWidth: 500,
                    width: '100%',
                    textAlign: 'center',
                    bgcolor: theme.palette.background.default
                }}
            >
                <Stack gap={4}>
                    {/* <Typography variant="h4" component="h1" color="text.primary">
                        Welcome to School Pilot
                    </Typography>

                    <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
                        where school activities are simplified
                    </Typography> */}

                    <Typography variant="h4" color="success.main" sx={{ fontWeight: 'bold' }}>
                        Login is successful.
                    </Typography>

                    <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                        Welcome to School Pilot where school activities are simplified
                    </Typography>

                    <Typography variant="h6" color="text.secondary">
                        Click OK to continue
                    </Typography>

                    <Stack direction="row" gap={2} justifyContent="center" sx={{ mt: 2 }}>
                        <Button
                            variant="outlined"
                            onClick={handleCancel}
                            sx={{ minWidth: 100 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleOk}
                            sx={{ minWidth: 100 }}
                        >
                            OK
                        </Button>
                    </Stack>
                </Stack>
            </Paper>
        </Box>
    );
};

export default LoginSuccess;