import { lazy, Suspense, type ReactElement, type PropsWithChildren } from 'react';
import { Navigate, Outlet, type RouteObject, createBrowserRouter } from 'react-router-dom';
import PageLoader from '../components/loading/pageLoader';
import Splash from '../components/loading/splash';
import { rootPaths } from './paths';
import paths from './paths';
import NavigationHandler from '../helpers/navigation-helper';
import { ProtectedRoute } from './protected-route';
import ErrorBoundary from '../components/error-boundary';


const App = lazy<() => ReactElement>(() => import('./../App'));
const MainLayout = lazy<({ children }: PropsWithChildren) => ReactElement>(
    () => import('../../src/layouts/main-layout')
);
const AuthLayout = lazy<({ children }: PropsWithChildren) => ReactElement>(
    () => import('../../src/layouts/auth-layout')
);

const LoginPage = lazy<() => ReactElement>(() => import('../pages/authentication/login/index'));
const AccountSelection = lazy<() => ReactElement>(() => import('../pages/account-selection/index'));
const WelcomePage = lazy(() => import('../../src/pages/admin/welcome/index'));
const LoginSuccessPage = lazy<() => ReactElement>(() => import('../pages/authentication/login/login-success'));
const AdminUserListManagementPage = lazy<() => ReactElement>(() => import('../pages/admin/users/user-list/index'));
const AdminCreateUserPage = lazy<() => ReactElement>(() => import('../pages/admin/users/create-user/index'));
const AdminStudentListManagementPage = lazy<() => ReactElement>(() => import('../pages/admin/students/student-list/index'));
const AdminCreateStudentPage = lazy<() => ReactElement>(() => import('../pages/admin/students/create-student/index'));
const AdminDashboardAnalytics = lazy<() => ReactElement>(() => import('../pages/admin/dashboard-analytics/index'));
const AdminPermissions = lazy(() => import('../pages/admin/permission/index'));
const ActivityLogPage = lazy(() => import('../pages/admin/audit-trails/activity-log'));
const SchoolTerms = lazy(() => import('../pages/admin/academics/terms/index'));
const SchoolLevels = lazy(() => import('../pages/admin/academics/levels/index'));
const SchoolClasses = lazy(() => import('../pages/admin/academics/classes/index'));
const ScoreSheetInput = lazy(() => import('../pages/staffs/result-scores/index'));

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
                        path: 'welcome',
                        element: (
                            <ErrorBoundary>
                                <WelcomePage />
                            </ErrorBoundary>
                        ),
                    },
                    {
                        path: 'analytics',
                        element: (
                            <ErrorBoundary>
                                <AdminDashboardAnalytics />
                            </ErrorBoundary>
                        ),
                    },
                    {
                        path: 'users',
                        element: <Outlet />,
                        children: [
                            {
                                index: true,
                                element: (
                                    <ErrorBoundary>
                                        <AdminUserListManagementPage />
                                    </ErrorBoundary>
                                ),
                            },
                            {
                                path: "create-user",
                                element: (
                                    <ErrorBoundary>
                                        <AdminCreateUserPage />
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
                                        <AdminStudentListManagementPage />
                                    </ErrorBoundary>
                                ),
                            },
                            {
                                path: "create-student",
                                element: (
                                    <ErrorBoundary>
                                        <AdminCreateStudentPage />
                                    </ErrorBoundary>
                                ),
                            }
                        ]
                    },
                    {
                        path: 'permission',
                        element: (
                            <ErrorBoundary>
                                <AdminPermissions />
                            </ErrorBoundary>
                        ),
                    },
                    {
                        path: 'audit',
                        element: (
                            <ErrorBoundary>
                                <ActivityLogPage />
                            </ErrorBoundary>
                        ),
                    },
                    {
                        path: 'academics/terms',
                        element: (
                            <ErrorBoundary>
                                <SchoolTerms />
                            </ErrorBoundary>
                        ),
                    },
                    {
                        path: 'academics/levels',
                        element: (
                            <ErrorBoundary>
                                <SchoolLevels />
                            </ErrorBoundary>
                        ),
                    },
                    {
                        path: 'academics/classes',
                        element: (
                            <ErrorBoundary>
                                <SchoolClasses />
                            </ErrorBoundary>
                        ),
                    },
                    {
                        path: 'score-sheet',
                        element: (
                            <ErrorBoundary>
                                <ScoreSheetInput />
                            </ErrorBoundary>
                        ),
                    },
                ]
            },
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
                                <LoginPage />
                            </ProtectedRoute>
                        ),
                    },
                    {
                        path: 'welcome',
                        element: (
                            <ProtectedRoute requireAccountSelection={false}>
                                <LoginSuccessPage />
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
            // {
            //     path: paths.signup,
            //     element: (
            //         <Suspense fallback={<PageLoader />}>
            //             <ErrorBoundary>
            //                 <CreatSchoolAccountPage />
            //             </ErrorBoundary>
            //         </Suspense>
            //     ),
            // },
            {
                path: rootPaths.authRoot,
                element: <Navigate to={paths.login} replace />,
            },
        ]
    }
]

const options: { basename: string } = {
    basename: '/schoolpilot',
};

const router = createBrowserRouter(routes, options);

export default router;