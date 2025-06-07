import { type INavbarItem } from "../../interfaces/sidebar/i-navbar-item";
import { rootPaths } from "../../routes/paths";

const navItems: INavbarItem[] = [


    /// /////////////////////////////
    /// ADMIN
    /// /////////////////////////////

    //Dashboard

    {
        id: 1,
        path: '/home/admin/my-dashboard',
        title: 'Overview',
        icon: 'mingcute:home-1-fill',
        active: true,
        group: 'DASHBOARD',
        roles: ["ADMIN"],
    },

    // User Management

    {
        id: 2,
        path: '/home/admin/manage-consumers',
        title: 'Manage Consumers',
        icon: 'mingcute:home-1-fill',
        active: true,
        group: 'User Management',
        roles: ["ADMIN"],
    },
    {
        id: 3,
        path: '/home/admin/manage-providers',
        title: 'Manage Providers',
        icon: 'mingcute:home-1-fill',
        active: true,
        group: 'User Management',
        roles: ["ADMIN"],
    },
    {
        id: 4,
        path: '/home/admin/verify-providers',
        title: 'Verify Providers',
        icon: 'mingcute:home-1-fill',
        active: true,
        group: 'User Management',
        roles: ["ADMIN"],
    },

    // Service Management
    {
        id: 5,
        path: '/home/admin/service-categories',
        title: 'Service-Category',
        icon: 'mingcute:home-1-fill',
        active: true,
        group: 'Service Management',
        roles: ["ADMIN"],
    },
    {
        id: 6,
        path: '/home/admin/listings',
        title: 'Listings',
        icon: 'mingcute:home-1-fill',
        active: true,
        group: 'Service Management',
        roles: ["ADMIN"],
    },
    {
        id: 7,
        path: '/home/admin/pricing-policies',
        title: 'Set Pricing Policy',
        icon: 'mingcute:home-1-fill',
        active: true,
        group: 'Service Management',
        roles: ["ADMIN"],
    },
]

export default navItems;