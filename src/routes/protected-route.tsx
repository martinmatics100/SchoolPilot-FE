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

    // Allow access to login success page when authenticated
    const isLoginSuccessPage = location.pathname === '/authentication/welcome';
    const isAccountSelectionRoute = location.pathname === paths.home;

    // If trying to access login page while authenticated, redirect to login success
    if (location.pathname === paths.login && isAuthenticated) {
        return <Navigate to="/authentication/welcome" replace />;
    }

    // If not authenticated and trying to access protected routes (except login)
    if (!isAuthenticated && location.pathname !== paths.login && !isLoginSuccessPage) {
        return <Navigate to={paths.login} state={{ from: location }} replace />;
    }

    // If authenticated but on account selection without selection required
    if (!requireAccountSelection && selectedAccount && location.pathname === paths.home) {
        return <Navigate to="/app/welcome" replace />;
    }

    // If account selection is required but no account selected and not on allowed pages
    if (requireAccountSelection && !selectedAccount && !isAccountSelectionRoute && !isLoginSuccessPage) {
        return <Navigate to={paths.home} replace />;
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