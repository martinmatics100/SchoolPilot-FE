// src/routes/protected-route.tsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context';
import paths from './paths';
import {
    getFirstRouteForRole,
    roleHasAccessToPath,
} from '../utils/roleNavigation';
import { UserRoles } from "../enums/user-roles";

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAccountSelection?: boolean;
    /** Optional: restrict this route to specific roles (e.g. ['Admin']) */
    allowedRoles?: string[];
}

export const ProtectedRoute = ({
    children,
    requireAccountSelection = true,
    allowedRoles,
}: ProtectedRouteProps) => {
    const { isAuthenticated, selectedAccount, role } = useAuth();
    const location = useLocation();

    const isSuperAdminUser = role === UserRoles.SUPER_ADMIN;
    const isLogoutPage = location.pathname === paths.logout;
    const isLoginPage = location.pathname === paths.login;
    const isLoginSuccessPage = location.pathname === '/authentication/welcome';
    const isAccountSelectionRoute = location.pathname === paths.home;
    const isSuperAdminRoute = location.pathname.startsWith('/app/super-admin');

    // ── Always allow logout ─────────────────────────────────
    if (isLogoutPage) return <>{children}</>;

    // ── Login page: bounce to welcome if already authenticated ──
    if (isLoginPage && isAuthenticated) {
        return <Navigate to="/authentication/welcome" replace />;
    }

    // ── Unauthenticated → login ─────────────────────────────
    if (!isAuthenticated && !isLoginPage && !isLoginSuccessPage) {
        return <Navigate to={paths.login} state={{ from: location }} replace />;
    }

    // ── Super admin: bypass account-selection entirely ───────
    // They have no school to pick. If they land on the account
    // selection page or a school-only page, send them straight
    // to their dashboard.
    if (isAuthenticated && isSuperAdminUser) {
        // If they're on the account-selection route (paths.home),
        // redirect to the super admin dashboard.
        if (isAccountSelectionRoute) {
            return <Navigate to="/app/super-admin/dashboard" replace />;
        }

        // If they somehow land on a non-super-admin route inside /app,
        // redirect to their dashboard.
        if (
            location.pathname.startsWith('/app') &&
            !isSuperAdminRoute &&
            !isLoginSuccessPage
        ) {
            return <Navigate to="/app/super-admin/dashboard" replace />;
        }

        // Otherwise let them through (their own routes, welcome page, etc.)
        return <>{children}</>;
    }

    // ── Non-super-admin flows (unchanged) ────────────────────

    // Authenticated but no account selected → account selection page
    if (requireAccountSelection && !selectedAccount) {
        return <Navigate to={paths.home} replace />;
    }

    // Authenticated with account, but on the account-selection page →
    // they don't need to be there, send them to their home.
    if (
        isAuthenticated &&
        selectedAccount &&
        isAccountSelectionRoute
    ) {
        return <Navigate to={getFirstRouteForRole(role)} replace />;
    }

    // ── Role-based access check ─────────────────────────────
    if (
        isAuthenticated &&
        selectedAccount &&
        requireAccountSelection &&
        !isLoginSuccessPage &&
        !isAccountSelectionRoute
    ) {
        if (allowedRoles && allowedRoles.length > 0) {
            if (!role || !allowedRoles.includes(role)) {
                return <Navigate to={getFirstRouteForRole(role)} replace />;
            }
        } else {
            if (!roleHasAccessToPath(role, location.pathname)) {
                return <Navigate to={getFirstRouteForRole(role)} replace />;
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