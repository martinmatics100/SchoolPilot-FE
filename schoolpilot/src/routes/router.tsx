import { lazy, Suspense, type ReactElement, type PropsWithChildren } from 'react';
import { Navigate, Outlet, type RouteObject, createBrowserRouter } from 'react-router-dom';

import PageLoader from '../components/loading/pageLoader';
import Splash from '../components/loading/splash';
import { rootPaths } from './paths';
import paths from './paths';
import { useAuth } from '../context';
import NavigationHandler from '../helpers/navigation-helper';
import { ProtectedRoute } from './protected-route';

// Lazy-loaded components
const App = lazy<() => ReactElement>(() => import('./../App'));
const MainLayout = lazy<({ children }: PropsWithChildren) => ReactElement>(
    () => import('../../src/layouts/main-layout')
);
const AuthLayout = lazy<({ children }: PropsWithChildren) => ReactElement>(
    () => import('../../src/layouts/auth-layout')
);
const AccountSelection = lazy<() => ReactElement>(() => import('../../src/pages/common-pages/accounts/index'));
const Login = lazy<() => ReactElement>(() => import('../../src/pages/authentication/login/index'));
const AdminDashboard = lazy<() => ReactElement>(() => import('../../src/pages/admin-pages/dashboard/index'));
const UpgradeToPro = lazy<() => ReactElement>(() => import('../../src/pages/common-pages/payments/upgrade-to-pro'));
const PaymentForm = lazy<() => ReactElement>(() => import('../../src/pages/common-pages/payments/payment-page'));

const routes: RouteObject[] = [
    {
        element: (
            <Suspense fallback={<Splash />}>
                <NavigationHandler>
                    <App />
                </NavigationHandler>
            </Suspense>
        ),
        children: [
            // Account selection page (first page after login)
            {
                path: paths.home,
                element: (
                    <ProtectedRoute requireAccountSelection={false}>
                        <AccountSelection />
                    </ProtectedRoute>
                ),
            },

            // Main app routes (require account selection)
            {
                path: '/app',
                element: (
                    <ProtectedRoute requireAccountSelection={true}>
                        <MainLayout>
                            <Suspense fallback={<PageLoader />}>
                                <Outlet />
                            </Suspense>
                        </MainLayout>
                    </ProtectedRoute>
                ),
                children: [
                    {
                        path: 'dashboard',
                        element: <AdminDashboard />,
                    },
                    // Add other app routes here
                ],
            },

            // Payment routes
            {
                path: '/plan/upgrade',
                element: (
                    <ProtectedRoute requireAccountSelection={true}>
                        <Suspense fallback={<PageLoader />}>
                            <UpgradeToPro />
                        </Suspense>
                    </ProtectedRoute>
                ),
            },
            {
                path: '/plan/upgrade/payment',
                element: (
                    <ProtectedRoute requireAccountSelection={true}>
                        <Suspense fallback={<PageLoader />}>
                            <PaymentForm />
                        </Suspense>
                    </ProtectedRoute>
                ),
            },

            // Authentication routes
            {
                path: rootPaths.authRoot,
                element: (
                    <AuthLayout>
                        <Suspense fallback={<PageLoader />}>
                            <Outlet />
                        </Suspense>
                    </AuthLayout>
                ),
                children: [
                    {
                        path: paths.login,
                        element: <Login />,
                    },
                    // Add other auth routes here
                ],
            },
        ],
    },
];

const options: { basename: string } = {
    basename: '/schoolpilot',
};

const router = createBrowserRouter(routes, options);

export default router;