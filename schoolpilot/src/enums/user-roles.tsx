export const UserRoles = {
    ADMIN: 'ADMIN',
    USER: 'USER',
} as const;

export type UserRoles = typeof UserRoles[keyof typeof UserRoles];
