import { UserRoles } from "../../enums/user-roles";
import { type INavbarItem } from "../../interfaces/sidebar/i-navbar-item";
import { rootPaths } from "../../routes/paths";

const navItems: INavbarItem[] = [


    /// /////////////////////////////
    /// ADMIN
    /// /////////////////////////////

    //Dashboard

    {
        id: 1,
        path: '/app/dashboard',
        title: 'Overview',
        icon: 'mingcute:home-1-fill',
        active: true,
        group: 'DASHBOARD',
        roles: [UserRoles.ADMIN],
    },

    // User Management

    {
        id: 2,
        path: '/app/staffs',
        title: 'Staffs',
        icon: 'mingcute:home-1-fill',
        active: true,
        group: 'MANAGMENT',
        roles: [UserRoles.ADMIN],
    },
    {
        id: 3,
        path: '/app/students',
        title: 'Students',
        icon: 'mingcute:home-1-fill',
        active: true,
        group: 'MANAGMENT',
        roles: [UserRoles.ADMIN],
    },

    // Access Control

    {
        id: 2,
        path: '/app/permission',
        title: 'Permissions',
        icon: 'mingcute:home-1-fill',
        active: true,
        group: 'Access Control',
        roles: [UserRoles.ADMIN],
    },
    {
        id: 3,
        path: '#',
        title: 'Audit Trails',
        icon: 'mingcute:home-1-fill',
        active: false,
        group: 'Access Control',
        roles: [UserRoles.ADMIN],
    },
]

export default navItems;