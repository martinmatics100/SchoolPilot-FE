// src/utils/roleMapper.ts
import { UserRoles } from "../enums/user-roles";

export const mapNumericRole = (roleNumber: number): UserRoles | null => {
    switch (roleNumber) {
        case 1: return UserRoles.ADMIN;
        case 2: return UserRoles.TEACHER;
        case 3: return UserRoles.STUDENT;
        case 4: return UserRoles.PARENT;
        default: return null;
    }
};