export const UserRoles = {
    ADMIN: 'Admin',
    TEACHER: 'Teacher',
    PARENT: 'Parent',
    ACCOUNTANT: 'Accountant',
    NONACADEMICSTAFF: 'NonAcademicStaff',
    PRINCIPAL: 'Principal'
} as const;

export type UserRoles = typeof UserRoles[keyof typeof UserRoles];

// Helper function to check if a string is a valid UserRole
export const isUserRole = (role: string): role is UserRoles => {
    return Object.values(UserRoles).includes(role as UserRoles);
};
