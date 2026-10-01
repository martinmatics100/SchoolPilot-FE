import navItems from '../data/sidebar-items';
import { UserRoles } from '../enums/user-roles';

/**
 * Returns the first accessible route for a given role.
 * Looks at navItems in order, and picks the first one the role has access to.
 *
 * Returns a fallback of `/app/welcome` if nothing matches (safety net).
 */
export const getFirstRouteForRole = (role: string | null | undefined): string => {
    if (!role) return '/authentication/login';

    // navItems is already ordered top-to-bottom as shown in the sidebar
    const firstItem = navItems.find((item) => item.roles.includes(role as UserRoles));

    return firstItem?.path || '/app/welcome';
};

/**
 * Checks whether a role has access to a given path.
 * Matches the exact path OR any child path (e.g. /app/attendance/xyz).
 */
export const roleHasAccessToPath = (
    role: string | null | undefined,
    path: string,
): boolean => {
    if (!role) return false;

    return navItems.some((item) => {
        const isAllowed = item.roles.includes(role as UserRoles);
        const matches =
            path === item.path || path.startsWith(`${item.path}/`);
        return isAllowed && matches;
    });
};

/**
 * Returns all paths the given role can access.
 * Useful for preloading or building custom redirect maps.
 */
export const getAccessiblePaths = (role: string | null | undefined): string[] => {
    if (!role) return [];
    return navItems
        .filter((item) => item.roles.includes(role as UserRoles))
        .map((item) => item.path);
};