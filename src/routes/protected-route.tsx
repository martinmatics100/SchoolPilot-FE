// src/routes/protected-route.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context';
import paths from './paths';
import {
    getFirstRouteForRole,
    roleHasAccessToPath,
} from '../utils/roleNavigation';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAccountSelection?: boolean;
    /** Optional: restrict this route to specific roles (e.g. ['ADMIN']) */
    allowedRoles?: string[];
}

export const ProtectedRoute = ({
    children,
    requireAccountSelection = true,
    allowedRoles,
}: ProtectedRouteProps) => {
    const { isAuthenticated, selectedAccount, role } = useAuth();
    const location = useLocation();

    // ── Special-case routes (no checks needed) ─────────────────────
    const isLogoutPage = location.pathname === paths.logout;
    const isLoginPage = location.pathname === paths.login;
    const isLoginSuccessPage = location.pathname === '/authentication/welcome';
    const isAccountSelectionRoute = location.pathname === paths.home;

    // Allow logout page always
    if (isLogoutPage) return <>{children}</>;

    // If on login page and already authenticated → go to welcome
    if (isLoginPage && isAuthenticated) {
        return <Navigate to="/authentication/welcome" replace />;
    }

    // Not authenticated → login
    if (!isAuthenticated && !isLoginPage && !isLoginSuccessPage) {
        return (
            <Navigate to={paths.login} state={{ from: location }} replace />
        );
    }

    // Authenticated but no account selected → account selection page
    if (
        isAuthenticated &&
        requireAccountSelection &&
        !selectedAccount &&
        !isAccountSelectionRoute &&
        !isLoginSuccessPage
    ) {
        return <Navigate to={paths.home} replace />;
    }

    // ✅ NEW: Role-based access check
    // Only runs for pages that require an account selection
    // (skip for login / welcome / logout pages)
    if (
        isAuthenticated &&
        selectedAccount &&
        requireAccountSelection &&
        !isLoginSuccessPage &&
        !isAccountSelectionRoute
    ) {
        // 1) If this route declares specific allowed roles, enforce them
        if (allowedRoles && allowedRoles.length > 0) {
            if (!role || !allowedRoles.includes(role)) {
                return (
                    <Navigate to={getFirstRouteForRole(role)} replace />
                );
            }
        } else {
            // 2) Otherwise, use the global sidebar-based check
            if (!roleHasAccessToPath(role, location.pathname)) {
                return (
                    <Navigate to={getFirstRouteForRole(role)} replace />
                );
            }
        }
    }

    return <>{children}</>;
};

export const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    const location = useLocation();

    if (isAuthenticated) {
        return (
            <Navigate
                to={location.state?.from?.pathname || paths.home}
                replace
            />
        );
    }

    return <>{children}</>;
};