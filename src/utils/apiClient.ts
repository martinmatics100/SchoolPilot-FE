import { decryptData } from "./encryption";
import { UserRoles } from "../enums/user-roles";
import { jwtDecode } from 'jwt-decode';

import {
    API_BASE_URL,
    STORAGE_KEYS,
    DEFAULT_TIME_ZONE,
    DEFAULT_PAGE,
    DEFAULT_PAGE_LENGTH
} from '../constants/apiConstants';

import {
    type AccountModel,
    type PagedResult,
    type DecodedToken,
    type LocationModel,
    type SchoolResponse,
    type Subject,
    type GetAccountsParams,
    type CurrentUser,
    type LoginResult,
    type ApiClientConfig,
    type CurrentUserFromToken
} from '../types/apiTypes/apiTypes';

// Re-export types for backward compatibility
export type { AccountModel, LocationModel, Subject, CurrentUser, LoginResult };


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
            return '0';
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


export const createApiClient = ({
    selectedAccount,
    accessToken,
    timeZone = DEFAULT_TIME_ZONE
}: ApiClientConfig = {}) => {
    const currentAccessToken = accessToken ?? getLocalStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
    const storedSelectedAccount = selectedAccount ?? getLocalStorageItem(STORAGE_KEYS.SELECTED_ACCOUNT);
    const currentTimeZone = timeZone ?? getLocalStorageItem(STORAGE_KEYS.TIME_ZONE) ?? DEFAULT_TIME_ZONE;

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
            return handleResponse<T>(response);
        },

        post: async <T = any>(url: string, body: any): Promise<T> => {
            const response = await fetch(`${API_BASE_URL}${url}`, {
                method: 'POST',
                headers: baseHeaders,
                body: JSON.stringify(body)
            });
            return handleResponse<T>(response);
        },

        put: async <T = any>(url: string, body: any): Promise<T> => {
            const response = await fetch(`${API_BASE_URL}${url}`, {
                method: 'PUT',
                headers: baseHeaders,
                body: JSON.stringify(body)
            });
            return handleResponse<T>(response);
        },

        delete: async <T = any>(url: string): Promise<T> => {
            const response = await fetch(`${API_BASE_URL}${url}`, {
                method: 'DELETE',
                headers: baseHeaders
            });
            return handleResponse<T>(response);
        },

        getAccounts: async ({
            userId,
            role,
            page = DEFAULT_PAGE,
            pageLength = DEFAULT_PAGE_LENGTH
        }: GetAccountsParams): Promise<PagedResult<AccountModel>> => {
            const queryParams = new URLSearchParams({
                page: page.toString(),
                pageLength: pageLength.toString(),
                userId: userId,
                role: getNumericRoleValue(role as UserRoles)
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
    const responseText = await response.text();
    let data: T;
    try {
        data = responseText ? JSON.parse(responseText) as T : {} as T;
    } catch {
        data = {} as T;
    }
    return data;
};

export const setAuthData = (
    accessToken: string,
    timeZone?: string,
    persistAccountId?: boolean
) => {
    setLocalStorageItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

    const decoded = parseJwt(accessToken);
    if (persistAccountId && decoded?.accountId) {
        setLocalStorageItem(STORAGE_KEYS.SELECTED_ACCOUNT, decoded.accountId);
    }

    if (timeZone) {
        setLocalStorageItem(STORAGE_KEYS.TIME_ZONE, timeZone);
    }
};

export const clearAuthData = () => {
    Object.values(STORAGE_KEYS).forEach(key => {
        removeLocalStorageItem(key);
    });
};

export const getInitialAuthData = () => {
    const accessToken = getLocalStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
    const storedSelectedAccount = getLocalStorageItem(STORAGE_KEYS.SELECTED_ACCOUNT);
    const timeZone = getLocalStorageItem(STORAGE_KEYS.TIME_ZONE) ?? DEFAULT_TIME_ZONE;

    let accountIdFromToken: string | null = null;
    if (accessToken) {
        const decoded = parseJwt(accessToken);
        accountIdFromToken = decoded?.accountId || null;
    }

    const selectedAccount = accountIdFromToken || storedSelectedAccount || null;

    return { accessToken, selectedAccount, timeZone };
};

export const getCurrentUser = (): CurrentUserFromToken | null => {
    const accessToken = getLocalStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (!accessToken) return null;

    try {
        const decodedToken: DecodedToken = jwtDecode(accessToken);

        // Get role from localStorage instead of token
        const role = localStorage.getItem(STORAGE_KEYS.SELECTED_ROLE) as UserRoles | null;

        return {
            email: decodedToken.email,
            roles: role ? [role] : [],
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
        login: async (email: string, password: string): Promise<LoginResult> => {
            const response = await fetch(`${API_BASE_URL}/v2/auth/login`, {
                method: 'POST',
                headers: baseHeaders,
                body: JSON.stringify({ email, password })
            });
            return handleResponse<LoginResult>(response);
        }
    };
};

export const createAuthenticatedClient = (accessToken: string) => {
    return createApiClient({ accessToken });
};