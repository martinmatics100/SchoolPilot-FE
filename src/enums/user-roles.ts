export const UserRoles = {
    ADMIN: 'Admin',
    TEACHER: 'Teacher',
    PARENT: 'Parent',
    ACCOUNTANT: 'Accountant',
    NONACADEMICSTAFF: 'NonAcademicStaff',
    PRINCIPAL: 'Principal'
} as const;

export type UserRoles = typeof UserRoles[keyof typeof UserRoles];

export const isUserRole = (role: string): role is UserRoles => {
    return Object.values(UserRoles).includes(role as UserRoles);
};
