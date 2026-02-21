import { decryptData } from "./encryption";
import { UserRoles } from "../enums/user-roles";
import {jwtDecode} from 'jwt-decode';

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

// Re-export types
export type { AccountModel, LocationModel, Subject, CurrentUser, LoginResult };

// --- Helper functions ---
export const getNumericRoleValue = (role: UserRoles): string => {
  switch (role) {
    case UserRoles.ADMIN: return '1';
    case UserRoles.TEACHER: return '2';
    case UserRoles.PARENT: return '3';
    case UserRoles.ACCOUNTANT: return '4';
    case UserRoles.NONACADEMICSTAFF: return '5';
    case UserRoles.PRINCIPAL: return '6';
    default: return '0';
  }
};

const getLocalStorageItem = (key: string) => {
  try { return localStorage.getItem(key); } 
  catch (error) { console.error(`Error accessing localStorage key "${key}":`, error); return null; }
};
const setLocalStorageItem = (key: string, value: string) => {
  try { localStorage.setItem(key, value); } 
  catch (error) { console.error(`Error setting localStorage key "${key}":`, error); }
};
const removeLocalStorageItem = (key: string) => {
  try { localStorage.removeItem(key); } 
  catch (error) { console.error(`Error removing localStorage key "${key}":`, error); }
};

export const parseJwt = (token: string): DecodedToken | null => {
  try { return jwtDecode<DecodedToken>(token); } 
  catch (e) { console.error("Failed to parse JWT", e); return null; }
};

export const isTokenExpired = (token: string | null, bufferSeconds = 30): boolean => {
  if (!token) return true;
  const decoded = parseJwt(token);
  if (!decoded?.exp) return true;
  const now = Math.floor(Date.now() / 1000);
  return decoded.exp < now + bufferSeconds;
};

// --- Auth Storage Functions ---
export const setAuthData = (accessToken: string, timeZone?: string, persistAccountId?: boolean) => {
  setLocalStorageItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);

  const decoded = parseJwt(accessToken);
  if (persistAccountId && decoded?.accountId) {
    setLocalStorageItem(STORAGE_KEYS.SELECTED_ACCOUNT, decoded.accountId);
  }
  if (timeZone) setLocalStorageItem(STORAGE_KEYS.TIME_ZONE, timeZone);
};

export const clearAuthData = () => {
  Object.values(STORAGE_KEYS).forEach(key => removeLocalStorageItem(key));
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

// --- Token Refresh ---
let refreshPromise: Promise<string | null> | null = null;
export const refreshAccessToken = async (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/v2/auth/refresh`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) return null;

      const data = await response.json();
      if (data?.accessToken) {
        setAuthData(data.accessToken);
        return data.accessToken;
      }
      return null;
    } catch { return null; } 
    finally { refreshPromise = null; }
  })();

  return refreshPromise;
};

// --- Safe Fetch Wrapper ---
const safeFetch = async (input: RequestInfo, init: RequestInit = {}): Promise<Response> => {
  let accessToken = getLocalStorageItem(STORAGE_KEYS.ACCESS_TOKEN);

  if (isTokenExpired(accessToken)) {
    accessToken = await refreshAccessToken();
    if (!accessToken) {
      clearAuthData();
      window.location.href = "/schoolpilot/authentication/login";
      throw new Error("Session expired");
    }
  }

  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${accessToken}`);

  let response = await fetch(input, { ...init, headers, credentials: "include" });

  if (response.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) { clearAuthData(); window.location.href = "/schoolpilot/authentication/login"; throw new Error("Session expired"); }
    headers.set("Authorization", `Bearer ${newToken}`);
    response = await fetch(input, { ...init, headers, credentials: "include" });
  }

  return response;
};

// 1. Update handleResponse to check for blob requirement
const handleResponse = async <T = any>(response: Response, isBlob: boolean = false): Promise<T> => {
  if (isBlob) {
    return (await response.blob()) as unknown as T;
  }

  const responseText = await response.text();
  try {
    return responseText ? (JSON.parse(responseText) as T) : ({} as T);
  } catch {
    return {} as T;
  }
};

// --- API Client ---
export const createApiClient = ({
  selectedAccount,
  accessToken,
  timeZone = DEFAULT_TIME_ZONE
}: ApiClientConfig = {}) => {
  const storedSelectedAccount = selectedAccount ?? getLocalStorageItem(STORAGE_KEYS.SELECTED_ACCOUNT);
  const currentAccessToken = accessToken ?? getLocalStorageItem(STORAGE_KEYS.ACCESS_TOKEN);
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
    'X-Time-Zone': currentTimeZone,
  };

  const requestWithTokenRefresh = async <T>(url: string, options: RequestInit = {}, isBlob: boolean = false): Promise<T> => {
    const headers = { ...baseHeaders, ...options.headers };
    const response = await safeFetch(`${API_BASE_URL}${url}`, { ...options, headers });
    return handleResponse<T>(response, isBlob);
  };

  return {
    get: <T = any>(url: string) => requestWithTokenRefresh<T>(url, { method: 'GET' }),
    // 3. Update post signature to allow a boolean flag for blobs
    post: <T = any>(url: string, body: any, isBlob: boolean = false) =>
      requestWithTokenRefresh<T>(url, {
        method: 'POST',
        body: body ? JSON.stringify(body) : null
      }, isBlob),
    put: <T = any>(url: string, body: any) => requestWithTokenRefresh<T>(url, { method: 'PUT', body: JSON.stringify(body) }),
    delete: <T = any>(url: string) => requestWithTokenRefresh<T>(url, { method: 'DELETE' }),

    getAccounts: async ({ userId, role, page = DEFAULT_PAGE, pageLength = DEFAULT_PAGE_LENGTH }: GetAccountsParams) => {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageLength: pageLength.toString(),
        userId,
        role: getNumericRoleValue(role as UserRoles)
      }).toString();
      return requestWithTokenRefresh<PagedResult<AccountModel>>(`/v1/accounts?${queryParams}`, { method: 'GET' });
    },

    getDefaultSchools: async (accountId: string) =>
      requestWithTokenRefresh<SchoolResponse>(`/v1/accounts/all-default?accountId=${encodeURIComponent(accountId)}`, { method: 'GET' }),

    getSubjects: async () =>
      requestWithTokenRefresh<Subject[]>('/v1/subjects', { method: 'GET' }),

    getCurrentUser: async () =>
      requestWithTokenRefresh<CurrentUser>('/v1/users/current', { method: 'GET' }),
  };
};

// --- Auth Client ---
export const createAuthClient = () => ({
  login: async (email: string, password: string): Promise<LoginResult> => {
    const response = await fetch(`${API_BASE_URL}/v2/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: "include"
    });
    return handleResponse<LoginResult>(response);
  }
});

export const createAuthenticatedClient = (accessToken: string) =>
  createApiClient({ accessToken });
