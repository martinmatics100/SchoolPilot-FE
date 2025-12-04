import { UserRoles } from "../../enums/user-roles";

export interface AccountModel {
    Id: string;
    Name: string;
    Disabled: boolean;
    CreatedOn: string;
    ModifiedOn: string;
    DisabledOn?: string;
    Status: number;
}

export interface PagedResult<T> {
    items: T[];
    TotalCount: number;
    Page: number;
    PageLength: number;
    TotalPages: number;
}

export interface DecodedToken {
    sub: string;
    auth_time: string;
    given_name: string;
    family_name: string;
    email: string;
    client_id: string;
    "http://schemas.microsoft.com/ws/2008/06/identity/claims/role": string | string[];
    exp: number;
    iss: string;
    aud: string;
    accountId?: string;
}

export interface LocationModel {
    id: string;
    name: string;
}

export interface SchoolResponse {
    regularSchools: Array<{
        id: string;
        name: string;
        isDefault: boolean;
        locations: LocationModel[];
    }>;
    readonlySchools: Array<{
        id: string;
        name: string;
        isDefault: boolean;
        locations: LocationModel[];
    }>;
}

export interface Subject {
    id: string;
    subjectName: string;
    subjectCode: string;
}

export interface GetAccountsParams {
    userId: string;
    role: string;
    page?: number;
    pageLength?: number;
}

export interface CurrentUser {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    isSupportUser: boolean;
    allowEmergencyAcessRequest: boolean;
}

export interface LoginResult {
    success: boolean;
    status: number;
    message: string | null;
    accessToken?: string | null;
    tokenType?: string;
    expiresIn?: Date;
}

export interface ApiClientConfig {
    selectedAccount?: string | null;
    accessToken?: string | null;
    timeZone?: string;
}

export interface CurrentUserFromToken {
    email: string;
    roles: UserRoles[];
    accountId: string | null;
    userId: string;
}