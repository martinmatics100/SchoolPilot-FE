import { lazy, Suspense, type ReactElement, type PropsWithChildren } from 'react';
import { Navigate, Outlet, type RouteObject, createBrowserRouter } from 'react-router-dom';

import PageLoader from '../components/loading/pageLoader';
import Splash from '../components/loading/splash';
import { rootPaths } from './paths';
import paths from './paths';
import { useAuth } from '../context';
import NavigationHandler from '../helpers/navigation-helper';
import { ProtectedRoute } from './protected-route';
import ErrorBoundary from '../components/error-boundary';

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
const AdminStaffManagementPage = lazy<() => ReactElement>(() => import('../../src/pages/admin-pages/staffs/index'));
const CreateStaffPage = lazy<() => ReactElement>(() => import('../../src/pages/admin-pages/staffs/createStaff'));
const CreateStudentPage = lazy<() => ReactElement>(() => import('../../src/pages/admin-pages/students/CreateStudent'));
const CreatSchoolAccountPage = lazy<() => ReactElement>(() => import('../../src/pages/authentication/create-school/index'));
const PermissionsPage = lazy(() => import('../../src/pages/admin-pages/permission-page/index'));

const AdminStudentListPage = lazy<() => ReactElement>(() => import('../../src/pages/admin-pages/students/index'));


const routes: RouteObject[] = [
    {
        element: (
            <ErrorBoundary>
                <Suspense fallback={<Splash />}>
                    <NavigationHandler>
                        <App />
                    </NavigationHandler>
                </Suspense>
            </ErrorBoundary>
        ),
        children: [
            // Account selection page (first page after login)
            {
                path: paths.home,
                element: (
                    <ErrorBoundary>
                        <ProtectedRoute requireAccountSelection={false}>
                            <AccountSelection />
                        </ProtectedRoute>
                    </ErrorBoundary>
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
                        element: (
                            <ErrorBoundary>
                                <AdminDashboard />
                            </ErrorBoundary>
                        ),
                    },
                    {
                        path: 'staffs',
                        element: <Outlet />,
                        children: [
                            {
                                index: true,
                                element: (
                                    <ErrorBoundary>
                                        <AdminStaffManagementPage />
                                    </ErrorBoundary>
                                ),
                            },
                            {
                                path: "create-staff",
                                element: (
                                    <ErrorBoundary>
                                        <CreateStaffPage />
                                    </ErrorBoundary>
                                ),
                            }
                        ]
                    },
                    {
                        path: 'students',
                        element: <Outlet />,
                        children: [
                            {
                                index: true,
                                element: (
                                    <ErrorBoundary>
                                        <AdminStudentListPage />
                                    </ErrorBoundary>
                                ),
                            },
                            {
                                path: "create-student",
                                element: (
                                    <ErrorBoundary>
                                        <CreateStudentPage />
                                    </ErrorBoundary>
                                ),
                            }
                        ]
                    },
                    {
                        path: 'permission',
                        element: (
                            <ErrorBoundary>
                                <PermissionsPage />
                            </ErrorBoundary>
                        ),
                    },
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
                        element: (
                            <ProtectedRoute requireAccountSelection={false}>
                                <Login />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: '*',
                        element: (
                            <ProtectedRoute>
                                <Navigate to={paths.home} replace />
                            </ProtectedRoute>
                        ),
                    }
                ],
            },
            {
                path: paths.signup,
                element: (
                    <Suspense fallback={<PageLoader />}>
                        <ErrorBoundary>
                            <CreatSchoolAccountPage />
                        </ErrorBoundary>
                    </Suspense>
                ),
            },

            {
                path: rootPaths.authRoot,
                element: <Navigate to={paths.login} replace />,
            },
        ],
    },
];

const options: { basename: string } = {
    basename: '/schoolpilot',
};

const router = createBrowserRouter(routes, options);

export default router;