import { UserRoles, type UserRoles as UserRoleType } from "./user-roles";

export const dummyUsers: {
    email: string;
    password: string;
    role: UserRoleType;
}[] = [
        { email: 'admin@example.com', password: 'admin123', role: UserRoles.ADMIN },
        { email: 'user1@example.com', password: 'user123', role: UserRoles.USER },
        { email: 'user2@example.com', password: 'user234', role: UserRoles.USER },
    ];
