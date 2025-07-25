import React, { Component, type ReactNode } from 'react';
import { Button, Typography, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

interface ErrorBoundaryProps {
    children: ReactNode;
    fallback?: ReactNode;
}

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
    state = { hasError: false, error: null };

    static getDerivedStateFromError(error: Error) {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
        // You can add error logging service calls here
    }

    render() {
        if (this.state.hasError) {
            return this.props.fallback || <DefaultErrorPage error={this.state.error} />;
        }
        return this.props.children;
    }
}

// Default error page component
const DefaultErrorPage = ({ error }: { error: Error | null }) => {
    const navigate = useNavigate();

    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 3,
            textAlign: 'center'
        }}>
            <Typography variant="h4" gutterBottom>
                Oops! Something went wrong
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
                {error?.message || 'An unexpected error occurred'}
            </Typography>
            <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <Button
                    variant="contained"
                    onClick={() => window.location.reload()}
                >
                    Refresh Page
                </Button>
                <Button
                    variant="outlined"
                    onClick={() => navigate('/')}
                >
                    Submit a ticket
                </Button>
            </Box>
        </Box>
    );
};

export default ErrorBoundary;