import { UserRoles } from "../enums/user-roles";
import { type INavbarItem } from "../types/interfaces/i-navbar-items";

const navItems: INavbarItem[] = [

    {
        id: 1,
        path: '/app/welcome',
        title: 'Overview',
        icon: 'mdi:view-dashboard',
        active: true,
        group: 'DASHBOARD',
        roles: [UserRoles.ADMIN, UserRoles.TEACHER],
    },
    {
        id: 2,
        path: '/app/analytics',
        title: 'Analytics',
        icon: 'mdi:chart-bar',
        active: true,
        group: 'DASHBOARD',
        roles: [UserRoles.ADMIN],
    },




    {
        id: 21,
        path: '/app/users',
        title: 'Users',
        icon: 'mdi:account-group',
        active: true,
        group: 'MANAGMENT',
        roles: [UserRoles.ADMIN],
    },
    {
        id: 22,
        path: '/app/students',
        title: 'Students',
        icon: 'mdi:school',
        active: true,
        group: 'MANAGMENT',
        roles: [UserRoles.ADMIN, UserRoles.TEACHER],
    },



    {
        id: 41,
        path: '/app/dashboard',
        title: 'Attendance Dashboard',
        icon: 'mdi:view-dashboard-outline',
        active: true,
        group: 'ATTENDANCE',
        roles: [UserRoles.ADMIN],
    },
    {
        id: 42,
        path: '/app/attendance',
        title: 'Attendance Sessions',
        icon: 'mdi:clipboard-check',
        active: true,
        group: 'ATTENDANCE',
        roles: [UserRoles.ADMIN, UserRoles.TEACHER],
    },
    {
        id: 43,
        path: '/app/weekly-attendance',
        title: 'Weekly Attendance',
        icon: 'mdi:google-classroom',
        active: true,
        group: 'ATTENDANCE',
        roles: [UserRoles.ADMIN, UserRoles.TEACHER],
    },




    {
        id: 61,
        path: '/app/permission',
        title: 'Permissions',
        icon: 'mdi:shield-account',
        active: true,
        group: 'Access Control',
        roles: [UserRoles.ADMIN],
    },
    {
        id: 62,
        path: '/app/audit',
        title: 'Audit Trails',
        icon: 'mdi:clipboard-list',
        active: true,
        group: 'Access Control',
        roles: [UserRoles.ADMIN],
    },




    {
        id: 81,
        path: '/app/academics/terms',
        title: 'Terms-Assessments',
        icon: 'mdi:calendar',
        active: true,
        group: 'Academics',
        roles: [UserRoles.ADMIN],
    },
    {
        id: 82,
        path: '/app/academics/classes',
        title: 'Classes',
        icon: 'mdi:google-classroom',
        active: true,
        group: 'Academics',
        roles: [UserRoles.ADMIN],
    },
    {
        id: 83,
        path: '/app/academics/subjects',
        title: 'Subjects',
        icon: 'mdi:book-open-blank-variant',
        active: true,
        group: 'Academics',
        roles: [UserRoles.ADMIN],
    },





    {
        id: 101,
        path: '/app/score-sheet',
        title: 'Scores Sheet',
        icon: 'mdi:cog',
        active: true,
        group: 'Results',
        roles: [UserRoles.TEACHER],
    },
    {
        id: 102,
        path: '/app/exam-sheet',
        title: 'Result BroadSheet',
        icon: 'mdi:cog',
        active: true,
        group: 'Results',
        roles: [UserRoles.ADMIN, UserRoles.TEACHER],
    },
    {
        id: 103,
        path: '/app/results-hub',
        title: 'Result Hub',
        icon: 'mdi:cog',
        active: true,
        group: 'Results',
        roles: [UserRoles.ADMIN, UserRoles.TEACHER],
    },




    {
        id: 121,
        path: '/app/my-profile',
        title: 'My Profile',
        icon: 'mdi:cog',
        active: true,
        group: 'Settings',
        roles: [UserRoles.ADMIN, UserRoles.TEACHER, UserRoles.PARENT],
    },
    {
        id: 122,
        path: '/app/my-signature',
        title: 'My Signature',
        icon: 'mdi:cog',
        active: true,
        group: 'Settings',
        roles: [UserRoles.ADMIN, UserRoles.TEACHER],
    },
    {
        id: 123,
        path: '/app/my-feedback',
        title: 'Feedback & Support',
        icon: 'mdi:school',
        active: true,
        group: 'Settings',
        roles: [UserRoles.ADMIN, UserRoles.TEACHER],
    },
    {
        id: 124,
        path: '/app/settings',
        title: 'General',
        icon: 'mdi:cog',
        active: true,
        group: 'Settings',
        roles: [UserRoles.ADMIN],
    },
    {
        id: 125,
        path: '/app/affective-skills',
        title: 'Affective Skills',
        icon: 'mdi:cog',
        active: true,
        group: 'Settings',
        roles: [UserRoles.ADMIN, UserRoles.TEACHER],
    },
    {
        id: 126,
        path: '/app/remarks',
        title: 'Remarks',
        icon: 'mdi:cog',
        active: true,
        group: 'Settings',
        roles: [UserRoles.ADMIN, UserRoles.TEACHER],
    },
    {
        id: 127,
        path: '/app/comment-bank',
        title: 'Comments Bank',
        icon: 'mdi:cog',
        active: true,
        group: 'Settings',
        roles: [UserRoles.ADMIN],
    },




    {
        id: 141,
        path: '/app/my-children',
        title: 'My Children',
        icon: 'mdi:cog',
        active: true,
        group: 'School Portal',
        roles: [UserRoles.PARENT],
    },
]

export default navItems;