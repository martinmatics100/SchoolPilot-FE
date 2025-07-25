import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context';
import { CircularProgress, Box } from '@mui/material';
import paths from './paths';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAccountSelection?: boolean;
}

export const ProtectedRoute = ({
    children,
    requireAccountSelection = true
}: ProtectedRouteProps) => {
    const { isAuthenticated, selectedAccount } = useAuth();
    const location = useLocation();

    // If trying to access login page while authenticated
    if (location.pathname === paths.login && isAuthenticated) {
        return <Navigate to={selectedAccount ? '/app/dashboard' : paths.home} replace />;
    }

    if (!isAuthenticated && location.pathname !== paths.login) {
        return <Navigate to={paths.login} state={{ from: location }} replace />;
    }

    if (requireAccountSelection && !selectedAccount && location.pathname !== paths.home) {
        return <Navigate to={paths.home} replace />;
    }

    if (!requireAccountSelection && selectedAccount && location.pathname === paths.home) {
        return <Navigate to="/app/dashboard" replace />;
    }

    return <>{children}</>;
};

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    return isAuthenticated ? (
        <Navigate to={location.state?.from?.pathname || paths.home} replace />
    ) : (
        <>{children}</>
    );
};