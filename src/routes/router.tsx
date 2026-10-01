import {
  lazy,
  Suspense,
  type ReactElement,
  type PropsWithChildren,
} from "react";
import {
  Navigate,
  Outlet,
  type RouteObject,
  createBrowserRouter,
} from "react-router-dom";
import PageLoader from "../components/loading/pageLoader";
import Splash from "../components/loading/splash";
import { rootPaths } from "./paths";
import paths from "./paths";
import NavigationHandler from "../helpers/navigation-helper";
import { ProtectedRoute } from "./protected-route";
import ErrorBoundary from "../components/error-boundary";

const App = lazy<() => ReactElement>(() => import("./../App"));
const MainLayout = lazy<({ children }: PropsWithChildren) => ReactElement>(
  () => import("../../src/layouts/main-layout"),
);
const AuthLayout = lazy<({ children }: PropsWithChildren) => ReactElement>(
  () => import("../../src/layouts/auth-layout"),
);

const LoginPage = lazy<() => ReactElement>(
  () => import("../pages/authentication/login/index"),
);

const LogOutPage = lazy<() => ReactElement>(
  () => import("../pages/authentication/logout/index"),
);

const CreatSchoolAccountPage = lazy<() => ReactElement>(
  () => import("../pages/authentication/create-school/index"),
);
const AccountSelection = lazy<() => ReactElement>(
  () => import("../pages/account-selection/index"),
);
const WelcomePage = lazy(() => import("../../src/pages/admin/welcome/index"));
const LoginSuccessPage = lazy<() => ReactElement>(
  () => import("../pages/authentication/login/login-success"),
);
const AdminUserListManagementPage = lazy<() => ReactElement>(
  () => import("../pages/admin/users/user-list/index"),
);
const AdminCreateUserPage = lazy<() => ReactElement>(
  () => import("../pages/admin/users/create-user/index"),
);
const AdminStudentListManagementPage = lazy<() => ReactElement>(
  () => import("../pages/admin/students/student-list/index"),
);
const AdminCreateStudentPage = lazy(() =>
  import("../pages/admin/students/create-student")
);

const ImportStudentsPage = lazy<() => ReactElement>(
  () => import("../pages/admin/students/CSVImport/index"),
);
const AdminDashboardAnalytics = lazy<() => ReactElement>(
  () => import("../pages/admin/dashboard-analytics/index"),
);
const AdminPermissions = lazy(() => import("../pages/admin/permission/index"));
const ActivityLogPage = lazy(
  () => import("../pages/admin/audit-trails/activity-log"),
);
const SchoolTerms = lazy(() => import("../pages/admin/academics/terms/index"));
const SchoolLevels = lazy(
  () => import("../pages/admin/academics/levels/index"),
);
const SchoolSubjects = lazy(
  () => import("../pages/admin/academics/subjects/index"),
);
// const CreateSubject = lazy(
//   () => import("../pages/admin/academics/subjects/createSubject"),
// );
const SchoolClasses = lazy(
  () => import("../pages/admin/academics/classes/index"),
);
const CreateClass = lazy(
  () => import("../pages/admin/academics/classes/createClass"),
);
const ScoreSheetInput = lazy(
  () => import("../pages/staffs/result-scores/index"),
);
const GradingSystems = lazy(
  () => import("../pages/admin/grading-systems/index"),
);
const CommentBank = lazy(() => import("../pages/admin/comments-bank/index"));
const ReportPreference = lazy(
  () => import("../pages/admin/result-preference/index"),
);
const ExamBroadSheet = lazy(
  () => import("../pages/admin/broad-sheet/examsheet"),
);
const ResultHubPage = lazy(
  () => import("../pages/admin/ResultsHub/index"),
);
const ClassResultsViewerPage = lazy(
  () => import("../pages/admin/ResultsHub/classResultsViewer"),
);
const PrintReportCardsPage = lazy(
  () => import("../pages/admin/ResultsHub/PrintReportCards"),
);
const PublishResultsPage = lazy(
  () => import("../pages/admin/ResultsHub/PublishResults"),
);
const SubjectsAllocation = lazy(
  () => import("../pages/admin/academics/subject-allocation/index"),
);
// const Assessment = lazy(
//   () => import("../pages/admin/academics/assessment/index"),
// );
const SettingsPage = lazy(
  () => import("../pages/common/settings/index"),
);

const AttendanceSessionList = lazy(
  () => import("../pages/admin/Attendance/Sessions/session-list/index"),
);

const AttendanceSessionForm = lazy(
  () => import("../pages/admin/Attendance/Sessions/create-session/index"),
);

const TakeAttendancePage = lazy(
  () => import("../pages/admin/Attendance/TakeAttendance/index"),
);

const AttendanceDashboardPage = lazy(
  () => import("../pages/admin/Attendance/AttendanceDashboard/index"),
);

const WeeklyAttendancePage = lazy(
  () => import("../pages/admin/Attendance/WeeklyAttendancePage/index"),
);

const AffectiveSkillsPage = lazy(
  () => import("../pages/admin/affective-skills/index"),
);

const ParentsPortalPage = lazy(
  () => import("../pages/Parents/ParentPortal"),
);


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
        path: "/app",
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
            path: "welcome",
            element: (
              <ErrorBoundary>
                <WelcomePage />
              </ErrorBoundary>
            ),
          },
          {
            path: "analytics",
            element: (
              <ErrorBoundary>
                <AdminDashboardAnalytics />
              </ErrorBoundary>
            ),
          },
          {
            path: "users",
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
              },
            ],
          },
          {
            path: "students",
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
              },
              {
                path: "bulk-import-students",
                element: (
                  <ErrorBoundary>
                    <ImportStudentsPage />
                  </ErrorBoundary>
                ),
              },
            ],
          },
          {
            path: "permission",
            element: (
              <ErrorBoundary>
                <AdminPermissions />
              </ErrorBoundary>
            ),
          },
          {
            path: "audit",
            element: (
              <ErrorBoundary>
                <ActivityLogPage />
              </ErrorBoundary>
            ),
          },
          {
            path: "academics/terms",
            element: (
              <ErrorBoundary>
                <SchoolTerms />
              </ErrorBoundary>
            ),
          },
          {
            path: "academics/levels",
            element: (
              <ErrorBoundary>
                <SchoolLevels />
              </ErrorBoundary>
            ),
          },
          // {
          //   path: "academics/classes",
          //   element: (
          //     <ErrorBoundary>
          //       <SchoolClasses />
          //     </ErrorBoundary>
          //   ),
          // },
          {
            path: "academics/subjects-allocation",
            element: (
              <ErrorBoundary>
                <SubjectsAllocation />
              </ErrorBoundary>
            ),
          },
          {
            path: "academics/subjects",
            element: <Outlet />,
            children: [
              {
                index: true,
                element: (
                  <ErrorBoundary>
                    <SchoolSubjects />
                  </ErrorBoundary>
                ),
              },
            ],
          },
          {
            path: "academics/classes",
            element: <Outlet />,
            children: [
              {
                index: true,
                element: (
                  <ErrorBoundary>
                    <SchoolClasses />
                  </ErrorBoundary>
                ),
              },
              {
                path: "create-class",
                element: (
                  <ErrorBoundary>
                    <CreateClass />
                  </ErrorBoundary>
                ),
              },
            ],
          },
          {
            path: "score-sheet",
            element: (
              <ErrorBoundary>
                <ScoreSheetInput />
              </ErrorBoundary>
            ),
          },
          {
            path: "grading-system",
            element: (
              <ErrorBoundary>
                <GradingSystems />
              </ErrorBoundary>
            ),
          },
          {
            path: "affective-skills",
            element: (
              <ErrorBoundary>
                <AffectiveSkillsPage />
              </ErrorBoundary>
            ),
          },
          {
            path: "comment-bank",
            element: (
              <ErrorBoundary>
                <CommentBank />
              </ErrorBoundary>
            ),
          },
          {
            path: "report-reference",
            element: (
              <ErrorBoundary>
                <ReportPreference />
              </ErrorBoundary>
            ),
          },
          {
            path: "exam-sheet",
            element: (
              <ErrorBoundary>
                <ExamBroadSheet />
              </ErrorBoundary>
            ),
          },
          {
            path: "results-hub",
            element: <Outlet />,
            children: [
              {
                index: true,
                element: (
                  <ErrorBoundary>
                    <ResultHubPage />
                  </ErrorBoundary>
                ),
              },
              {
                path: "classes",
                element: (
                  <ErrorBoundary>
                    <ClassResultsViewerPage />
                  </ErrorBoundary>
                ),
              },
              {
                path: "print-report-cards",
                element: (
                  <ErrorBoundary>
                    <PrintReportCardsPage />
                  </ErrorBoundary>
                ),
              },
              {
                path: "publish-results",
                element: (
                  <ErrorBoundary>
                    <PublishResultsPage />
                  </ErrorBoundary>
                ),
              },
            ]
          },
          {
            path: "settings",
            element: (
              <ErrorBoundary>
                <SettingsPage />
              </ErrorBoundary>
            ),
          },
          {
            path: "attendance",
            element: <Outlet />,
            children: [
              {
                index: true,
                element: (
                  <ErrorBoundary>
                    <AttendanceSessionList />
                  </ErrorBoundary>
                ),
              },
              {
                path: "create-session",
                element: (
                  <ErrorBoundary>
                    <AttendanceSessionForm />
                  </ErrorBoundary>
                ),
              },
              {
                path: ":sessionId",
                element: (
                  <ErrorBoundary>
                    <TakeAttendancePage />
                  </ErrorBoundary>
                ),
              },
            ],
          },
          {
            path: "dashboard",
            element: (
              <ErrorBoundary>
                <AttendanceDashboardPage />
              </ErrorBoundary>
            ),
          },
          {
            path: "weekly-attendance",
            element: (
              <ErrorBoundary>
                <WeeklyAttendancePage />
              </ErrorBoundary>
            ),
          },
          {
            path: "my-children",
            element: (
              <ErrorBoundary>
                <ParentsPortalPage />
              </ErrorBoundary>
            ),
          },
        ],
      },

      // Payment routes
      // {
      //   path: '/plan/upgrade',
      //   element: (
      //     <ProtectedRoute requireAccountSelection={true}>
      //       <Suspense fallback={<PageLoader />}>
      //         <UpgradeToPro />
      //       </Suspense>
      //     </ProtectedRoute>
      //   ),
      // },
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
            path: paths.logout,
            element: (
              <ProtectedRoute requireAccountSelection={false}>
                <LogOutPage />,
              </ProtectedRoute>
            ),
          },
          {
            path: "welcome",
            element: (
              <ProtectedRoute requireAccountSelection={false}>
                <LoginSuccessPage />
              </ProtectedRoute>
            ),
          },
          {
            path: "*",
            element: (
              <ProtectedRoute>
                <Navigate to={paths.home} replace />
              </ProtectedRoute>
            ),
          },
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

// const options: { basename: string } = {
//   basename: "/schoolpilot",
// };

// const router = createBrowserRouter(routes, options);

const router = createBrowserRouter(routes, {
  basename: import.meta.env.PROD ? '/' : '/schoolpilot'
});

export default router;
