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

const API_BASE_URL = 'https://localhost:7029/api';

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
        getAccounts: async (userId: string, page: number = 1, pageLength: number = 10): Promise<PagedResult<AccountModel>> => {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageLength: pageLength.toString(),
                userId: userId
            }).toString();

            const url = `/v1/accounts?${queryParams}`; // Assuming /api/v1/accounts based on your C# query
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
    removeLocalStorageItem('appEnums')
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

        if (decodedToken.exp * 1000 < Date.now()) {
            console.warn("JWT token has expired.");
            clearAuthData();
            return null;
        }

        const rawRoles = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

        let roles: UserRoles[] = [];

        if (Array.isArray(rawRoles)) {
            roles = rawRoles
                .map(role => {
                    // Handle numeric roles if they come from API
                    if (role === '1') return UserRoles.ADMIN;
                    if (role === '2') return UserRoles.TEACHER;
                    if (role === '3') return UserRoles.STUDENT;
                    if (role === '4') return UserRoles.PARENT;

                    const upperRole = role.toUpperCase();
                    return isUserRole(upperRole) ? upperRole : null;
                })
                .filter((role): role is UserRoles => role !== null);
        } else if (typeof rawRoles === 'string') {

            const role = rawRoles;
            if (role === '1') roles = [UserRoles.ADMIN];
            else if (role === '2') roles = [UserRoles.TEACHER];
            else if (role === '3') roles = [UserRoles.STUDENT];
            else if (role === '4') roles = [UserRoles.PARENT];
            else {
                const upperRole = role.toUpperCase();
                if (isUserRole(upperRole)) {
                    roles = [upperRole];
                }
            }
        }

        const userId = decodedToken.sub;

        return {
            email: decodedToken.email,
            roles: roles,
            accountId: decodedToken.accountId || null,
            userId: userId,
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
