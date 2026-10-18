import { UserRoles } from "../enums/user-roles";
import { type INavbarItem } from "../types/interfaces/i-navbar-items";

const superAdminNavItems: INavbarItem[] = [
    {
        id: 100,
        path: '/app/super-admin/dashboard',
        title: 'Overview',
        icon: 'mdi:view-dashboard',
        active: true,
        group: 'PLATFORM',
        roles: [UserRoles.SUPER_ADMIN],
    },
    {
        id: 101,
        path: '/app/super-admin/feedback',
        title: 'Feedback & Support',
        icon: 'mdi:school',
        active: true,
        group: 'PLATFORM',
        roles: [UserRoles.SUPER_ADMIN],
    },
];

export default superAdminNavItems;