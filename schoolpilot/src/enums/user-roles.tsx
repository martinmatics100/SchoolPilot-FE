export const UserRoles = {
    ADMIN: 'ADMIN',
    TEACHER: 'TEACHER',
    STUDENT: 'STUDENT',
    PARENT: 'PARENT'
} as const;

export type UserRoles = typeof UserRoles[keyof typeof UserRoles];

// Helper function to check if a string is a valid UserRole
export const isUserRole = (role: string): role is UserRoles => {
    return Object.values(UserRoles).includes(role as UserRoles);
};
