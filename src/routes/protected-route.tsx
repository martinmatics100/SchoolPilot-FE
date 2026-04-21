// src/routes/protected-route.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context';
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

    // IMPORTANT: Check for logout page FIRST - allow access without any checks
    const isLogoutPage = location.pathname === paths.logout;
    const isLoginPage = location.pathname === paths.login;
    const isLoginSuccessPage = location.pathname === '/authentication/welcome';
    const isAccountSelectionRoute = location.pathname === paths.home;

    // Allow access to logout page WITHOUT any authentication checks
    if (isLogoutPage) {
        return <>{children}</>;
    }

    // If on login page and authenticated, redirect to welcome
    if (isLoginPage && isAuthenticated) {
        return <Navigate to="/authentication/welcome" replace />;
    }

    // If not authenticated and trying to access protected routes
    if (!isAuthenticated && !isLoginPage && !isLoginSuccessPage) {
        // Use replace to prevent back button issues
        return <Navigate to={paths.login} state={{ from: location }} replace />;
    }

    // If authenticated but no account selected
    if (isAuthenticated && requireAccountSelection && !selectedAccount && !isAccountSelectionRoute && !isLoginSuccessPage) {
        return <Navigate to={paths.home} replace />;
    }

    return <>{children}</>;
};

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (isAuthenticated) {
        return <Navigate to={location.state?.from?.pathname || paths.home} replace />;
    }

    return <>{children}</>;
};