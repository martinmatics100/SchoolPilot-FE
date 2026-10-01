import { UserRoles } from "../enums/user-roles";
import { type INavbarItem } from "../types/interfaces/i-navbar-items";

const navItems: INavbarItem[] = [

    /// /////////////////////////////
    /// ADMIN
    /// /////////////////////////////

    //Dashboard

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

    // User Management
    {
        id: 3,
        path: '/app/users',
        title: 'Users',
        icon: 'mdi:account-group',
        active: true,
        group: 'MANAGMENT',
        roles: [UserRoles.ADMIN],
    },
    {
        id: 4,
        path: '/app/students',
        title: 'Students',
        icon: 'mdi:school',
        active: true,
        group: 'MANAGMENT',
        roles: [UserRoles.ADMIN, UserRoles.TEACHER],
    },

    /// /////////////////////////////
    /// ATTENDANCE 👈 NEW SECTION
    /// /////////////////////////////

    {
        id: 20,
        // path: '/app/attendance/dashboard',
        path: '/app/dashboard',
        title: 'Attendance Dashboard',
        icon: 'mdi:view-dashboard-outline',
        active: true,
        group: 'ATTENDANCE',
        roles: [UserRoles.ADMIN],
    },
    {
        id: 21,
        path: '/app/attendance',
        title: 'Attendance Sessions',
        icon: 'mdi:clipboard-check',
        active: true,
        group: 'ATTENDANCE',
        roles: [UserRoles.ADMIN],
    },
    {
        id: 29,
        path: '/app/weekly-attendance',
        title: 'Weekly Attendance',
        icon: 'mdi:google-classroom',
        active: true,
        group: 'ATTENDANCE',
        roles: [UserRoles.ADMIN],
    },

    // Access Control

    {
        id: 5,
        path: '/app/permission',
        title: 'Permissions',
        icon: 'mdi:shield-account',
        active: true,
        group: 'Access Control',
        roles: [UserRoles.ADMIN],
    },
    {
        id: 6,
        path: '/app/audit',
        title: 'Audit Trails',
        icon: 'mdi:clipboard-list',
        active: true,
        group: 'Access Control',
        roles: [UserRoles.ADMIN],
    },

    // Academics

    {
        id: 7,
        path: '/app/academics/terms',
        title: 'Terms-Assessments',
        icon: 'mdi:calendar',
        active: true,
        group: 'Academics',
        roles: [UserRoles.ADMIN],
    },

    {
        id: 9,
        path: '/app/academics/classes',
        title: 'Classes',
        icon: 'mdi:google-classroom',
        active: true,
        group: 'Academics',
        roles: [UserRoles.ADMIN],
    },

    {
        id: 10,
        path: '/app/academics/subjects',
        title: 'Subjects',
        icon: 'mdi:book-open-blank-variant',
        active: true,
        group: 'Academics',
        roles: [UserRoles.ADMIN],
    },

    // Results
    {
        id: 11,
        path: '/app/score-sheet',
        title: 'Scores Sheet',
        icon: 'mdi:cog',
        active: true,
        group: 'Results',
        roles: [UserRoles.TEACHER],
    },

    {
        id: 13,
        path: '/app/exam-sheet',
        title: 'Result BroadSheet',
        icon: 'mdi:cog',
        active: true,
        group: 'Results',
        roles: [UserRoles.ADMIN],
    },

    {
        id: 72,
        path: '/app/results-hub',
        title: 'Result Hub',
        icon: 'mdi:cog',
        active: true,
        group: 'Results',
        roles: [UserRoles.ADMIN],
    },


    // Settings


    {
        id: 18,
        path: '/app/settings',
        title: 'General',
        icon: 'mdi:cog',
        active: true,
        group: 'Settings',
        roles: [UserRoles.ADMIN, UserRoles.TEACHER],
    },
    {
        id: 17,
        path: '/app/affective-skills',
        title: 'Affective Skills',
        icon: 'mdi:cog',
        active: true,
        group: 'Settings',
        roles: [UserRoles.ADMIN],
    },
    {
        id: 14,
        path: '/app/grading-system',
        title: 'Grading Systems',
        icon: 'mdi:cog',
        active: true,
        group: 'Settings',
        roles: [UserRoles.ADMIN],
    },

    {
        id: 15,
        path: '/app/comment-bank',
        title: 'Comments Bank',
        icon: 'mdi:cog',
        active: true,
        group: 'Settings',
        roles: [UserRoles.ADMIN],
    },

    {
        id: 34,
        path: '/app/my-children',
        title: 'My Children',
        icon: 'mdi:cog',
        active: true,
        group: 'School Portal',
        roles: [UserRoles.PARENT],
    },
]

export default navItems;