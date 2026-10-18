export const UserRoles = {
    ADMIN: 'Admin',
    TEACHER: 'Teacher',
    PARENT: 'Parent',
    ACCOUNTANT: 'Accountant',
    NONACADEMICSTAFF: 'NonAcademicStaff',
    PRINCIPAL: 'Principal',
    SUPER_ADMIN: 'SuperAdmin',   // ← new
} as const;

export type UserRoles = typeof UserRoles[keyof typeof UserRoles];

export const isUserRole = (role: string): role is UserRoles => {
    return Object.values(UserRoles).includes(role as UserRoles);
};

/** True for the platform operator — used to skip school-specific flows. */
export const isSuperAdmin = (role: UserRoles | null | undefined): boolean =>
    role === UserRoles.SUPER_ADMIN;