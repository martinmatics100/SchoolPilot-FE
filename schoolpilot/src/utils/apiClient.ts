// src/utils/apiClient.ts

import { decryptData } from './encryption';
import { UserRoles } from '../enums/user-roles';
import { jwtDecode } from 'jwt-decode';
import { isUserRole } from '../enums/user-roles';

export interface AccountModel {
    Id: string;
    Name: string;
    Disabled: boolean;
    CreatedOn: string;
    ModifiedOn: string;
    DisabledOn?: string;
    Status: number;
    // As per your C# handler, branches are NOT part of AccountModel.
    // So, we don't add them here. Branches will be added in the AuthProvider's context.
    // If your backend *does* return branches for an account, uncomment/add it:
    // Branches?: string[];
}

interface PagedResult<T> {
    items: T[];
    TotalCount: number;
    Page: number;
    PageLength: number;
    TotalPages: number;
}

interface DecodedToken {
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

// Updated Location interface
export interface LocationModel {
    id: string;
    name: string;
}

interface SchoolResponse {
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

interface GetAccountsParams {
    userId: string;
    role: string; // Add role parameter
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

export const getNumericRoleValue = (role: UserRoles): string => {
    switch (role) {
        case UserRoles.ADMIN:
            return '1';
        case UserRoles.TEACHER:
            return '2';
        case UserRoles.PARENT:
            return '3';
        case UserRoles.ACCOUNTANT:
            return '4';
        case UserRoles.NONACADEMICSTAFF:
            return '5';
        case UserRoles.PRINCIPAL:
            return '6';
        default:
            return '0'; // Unknown role
    }
};

const getLocalStorageItem = (key: string): string | null => {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.error(`Error accessing localStorage key "${key}":`, error);
        return null;
    }
};

const setLocalStorageItem = (key: string, value: string): void => {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.error(`Error setting localStorage key "${key}":`, error);
    }
};

const removeLocalStorageItem = (key: string): void => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Error removing localStorage key "${key}":`, error);
    }
};

export const parseJwt = (token: string): DecodedToken | null => {
    try {
        return jwtDecode<DecodedToken>(token);
    } catch (e) {
        console.error("Failed to parse JWT", e);
        return null;
    }
};

export const API_BASE_URL = 'https://localhost:7029/api';

export const createApiClient = ({
    selectedAccount,
    accessToken,
    timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
}: {
    selectedAccount?: string | null;
    accessToken?: string | null;
    timeZone?: string;
} = {}) => {
    const currentAccessToken = accessToken ?? getLocalStorageItem('accessToken');
    const storedSelectedAccount = selectedAccount ?? getLocalStorageItem('selectedAccount');
    const currentTimeZone = timeZone ?? getLocalStorageItem('timeZone') ??
        Intl.DateTimeFormat().resolvedOptions().timeZone;

    let accountIdFromToken: string | null = null;
    if (currentAccessToken) {
        const decoded = parseJwt(currentAccessToken);
        accountIdFromToken = decoded?.accountId || null;
    }

    const effectiveAccountId = accountIdFromToken || storedSelectedAccount || selectedAccount;

    const baseHeaders: HeadersInit = {
        'Content-Type': 'application/json',
        ...(effectiveAccountId && { 'X-Account-Id': effectiveAccountId }),
        ...(currentAccessToken && { 'Authorization': `Bearer ${currentAccessToken}` }),
        'X-Time-Zone': currentTimeZone
    };

    return {
        get: async <T = any>(url: string): Promise<T> => {
            const response = await fetch(`${API_BASE_URL}${url}`, {
                method: 'GET',
                headers: baseHeaders
            });
            return handleResponse(response);
        },
        post: async <T = any>(url: string, body: any): Promise<T> => {
            const response = await fetch(`${API_BASE_URL}${url}`, {
                method: 'POST',
                headers: baseHeaders,
                body: JSON.stringify(body)
            });
            return handleResponse(response);
        },
        put: async <T = any>(url: string, body: any): Promise<T> => {
            const response = await fetch(`${API_BASE_URL}${url}`, {
                method: 'PUT',
                headers: baseHeaders,
                body: JSON.stringify(body)
            });
            return handleResponse(response);
        },
        delete: async <T = any>(url: string): Promise<T> => {
            const response = await fetch(`${API_BASE_URL}${url}`, {
                method: 'DELETE',
                headers: baseHeaders
            });
            return handleResponse(response);
        },
        // Update the getAccounts method in the apiClient
        getAccounts: async ({ userId, role, page = 1, pageLength = 10 }: GetAccountsParams): Promise<PagedResult<AccountModel>> => {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageLength: pageLength.toString(),
                userId: userId,
                role: getNumericRoleValue(role as UserRoles) // Convert to numeric value
            }).toString();

            const url = `/v1/accounts?${queryParams}`;
            const response = await fetch(`${API_BASE_URL}${url}`, {
                method: 'GET',
                headers: baseHeaders
            });
            return handleResponse<PagedResult<AccountModel>>(response);
        },

        getDefaultSchools: async (accountId: string): Promise<SchoolResponse> => {
            const response = await fetch(`${API_BASE_URL}/v1/accounts/all-default?accountId=${encodeURIComponent(accountId)}`, {
                method: 'GET',
                headers: baseHeaders
            });
            return handleResponse<SchoolResponse>(response);
        },

        getSubjects: async (): Promise<Subject[]> => {
            const response = await fetch(`${API_BASE_URL}/v1/subjects`, {
                method: 'GET',
                headers: baseHeaders
            });
            return handleResponse<Subject[]>(response);
        },

        getCurrentUser: async (): Promise<CurrentUser> => {
            const response = await fetch(`${API_BASE_URL}/v1/users/current`, {
                method: 'GET',
                headers: baseHeaders
            });
            return handleResponse<CurrentUser>(response);
        }
    };
};

const handleResponse = async <T = any>(response: Response): Promise<T> => {
    if (!response.ok) {
        try {
            const errorData = await response.json();
            throw new Error(errorData.message || JSON.stringify(errorData));
        } catch {
            throw new Error(await response.text());
        }
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
        return response.json();
    }
    return {} as T;
};

export const setAuthData = (
    accessToken: string,
    timeZone?: string,
    persistAccountId?: boolean
) => {
    setLocalStorageItem('accessToken', accessToken);

    const decoded = parseJwt(accessToken);
    if (persistAccountId && decoded?.accountId) {
        setLocalStorageItem('selectedAccount', decoded.accountId);
    }

    if (timeZone) {
        setLocalStorageItem('timeZone', timeZone);
    }
};

export const clearAuthData = () => {
    removeLocalStorageItem('accessToken');
    removeLocalStorageItem('selectedAccount');
    removeLocalStorageItem('timeZone');
    removeLocalStorageItem('authData');
    removeLocalStorageItem('selectedBranches');
    removeLocalStorageItem('appEnums');
    removeLocalStorageItem('selectedRole')
};

export const getInitialAuthData = () => {
    const accessToken = getLocalStorageItem('accessToken');
    const storedSelectedAccount = getLocalStorageItem('selectedAccount');
    const timeZone = getLocalStorageItem('timeZone') ??
        Intl.DateTimeFormat().resolvedOptions().timeZone;

    let accountIdFromToken: string | null = null;
    if (accessToken) {
        const decoded = parseJwt(accessToken);
        accountIdFromToken = decoded?.accountId || null;
    }

    const selectedAccount = accountIdFromToken || storedSelectedAccount || null;

    return { accessToken, selectedAccount, timeZone };
};

export const getCurrentUser = () => {
    const accessToken = getLocalStorageItem('accessToken');
    if (!accessToken) return null;

    try {
        const decodedToken: DecodedToken = jwtDecode(accessToken);

        // Get role from localStorage instead of token
        const role = localStorage.getItem('selectedRole') as UserRoles | null;

        return {
            email: decodedToken.email,
            roles: role ? [role] : [], // Use the localStorage role
            accountId: decodedToken.accountId || null,
            userId: decodedToken.sub,
        };
    } catch (error) {
        console.error("Error decoding JWT token or token invalid:", error);
        clearAuthData();
        return null;
    }
};

export const createAuthClient = () => {
    const baseHeaders: HeadersInit = {
        'Content-Type': 'application/json'
    };

    return {
        login: async (email: string, password: string) => {
            const response = await fetch(`${API_BASE_URL}/v2/auth/login`, {
                method: 'POST',
                headers: baseHeaders,
                body: JSON.stringify({ email, password })
            });
            return handleResponse<{
                accessToken: string;
                expiresIn: number;
                tokenType: string;
            }>(response);
        }
    };
};

export const createAuthenticatedClient = (accessToken: string) => {
    return createApiClient({ accessToken });
};
