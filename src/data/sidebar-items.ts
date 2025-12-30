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
        title: 'Welcome Overview',
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
        title: 'Terms',
        icon: 'mdi:calendar',
        active: true,
        group: 'Academics',
        roles: [UserRoles.ADMIN],
    },

    {
        id: 8,
        path: '/app/academics/levels',
        title: 'Levels',
        icon: 'mdi:stairs',
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

    {
        id: 11,
        path: '/app/academics/subjects-allocation',
        title: 'Subjects Allocation',
        icon: 'mdi:book-open-blank-variant',
        active: true,
        group: 'Academics',
        roles: [UserRoles.ADMIN],
    },
    {
        id: 12,
        path: '/app/academics/assessment',
        title: 'Assessments',
        icon: 'mdi:book-open-blank-variant',
        active: true,
        group: 'Academics',
        roles: [UserRoles.ADMIN],
    },

    // Results
    {
        id: 11,
        path: 'score-sheet',
        title: 'Scores Sheet',
        icon: 'mdi:cog',
        active: true,
        group: 'Results',
        roles: [UserRoles.TEACHER],
    },

    {
        id: 11,
        path: '#',
        title: 'Result Checker',
        icon: 'mdi:cog',
        active: true,
        group: 'Results',
        roles: [UserRoles.ADMIN],
    },

    {
        id: 11,
        path: 'exam-sheet',
        title: 'Result BroadSheet',
        icon: 'mdi:cog',
        active: true,
        group: 'Results',
        roles: [UserRoles.ADMIN],
    },

    // Settings

    {
        id: 13,
        path: 'grading-system',
        title: 'Grading Systems',
        icon: 'mdi:cog',
        active: true,
        group: 'Result Settings',
        roles: [UserRoles.ADMIN],
    },

    {
        id: 14,
        path: 'comment-bank',
        title: 'Comments Bank',
        icon: 'mdi:cog',
        active: true,
        group: 'Result Settings',
        roles: [UserRoles.ADMIN],
    },

    {
        id: 15,
        path: 'j',
        title: 'Cognitive Skills',
        icon: 'mdi:cog',
        active: true,
        group: 'Result Settings',
        roles: [UserRoles.ADMIN],
    },

    {
        id: 16,
        path: 'report-reference',
        title: 'Result Preference',
        icon: 'mdi:cog',
        active: true,
        group: 'Result Settings',
        roles: [UserRoles.ADMIN],
    },




    {
        id: 12,
        path: '#',
        title: 'School Settings',
        icon: 'mdi:cog',
        active: true,
        group: 'Settings',
        roles: [UserRoles.ADMIN],
    },
]

export default navItems;