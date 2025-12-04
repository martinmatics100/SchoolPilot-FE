export const API_BASE_URL = 'https://localhost:7029/api';

// Local Storage Keys
export const STORAGE_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    SELECTED_ACCOUNT: 'selectedAccount',
    TIME_ZONE: 'timeZone',
    AUTH_DATA: 'authData',
    SELECTED_BRANCHES: 'selectedBranches',
    APP_ENUMS: 'appEnums',
    SELECTED_ROLE: 'selectedRole'
} as const;

// Default values
export const DEFAULT_TIME_ZONE = Intl.DateTimeFormat().resolvedOptions().timeZone;
export const DEFAULT_PAGE = 1;
export const DEFAULT_PAGE_LENGTH = 10;