import { UserRoles, type UserRoles as UserRoleType } from "./user-roles";

export const dummyUsers: {
    email: string;
    password: string;
    role: UserRoleType;
}[] = [
        { email: 'admin@example.com', password: 'admin123', role: UserRoles.ADMIN },
    ];
