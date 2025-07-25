import { createApiClient } from '../utils/apiClient';

export interface EnumItem {
    name: string;
    value: number;
    displayName?: string;
}

export interface EnumsResponse {
    [enumName: string]: EnumItem[];
}

const ENUMS_STORAGE_KEY = 'appEnums';

export const saveEnumsToStorage = (enums: EnumsResponse) => {
    try {
        localStorage.setItem(ENUMS_STORAGE_KEY, JSON.stringify(enums));
    } catch (error) {
        console.error('Failed to save enums to localStorage:', error);
    }
};

export const getEnumsFromStorage = (): EnumsResponse | null => {
    try {
        const stored = localStorage.getItem(ENUMS_STORAGE_KEY);
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.error('Failed to get enums from localStorage:', error);
        return null;
    }
};

export const clearEnumsFromStorage = () => {
    localStorage.removeItem(ENUMS_STORAGE_KEY);
};


export const fetchAndStoreAllEnums = async (): Promise<EnumsResponse> => {
    const api = createApiClient();
    try {
        const enumNamesResponse = await api.get<string[]>('/v1/enums');
        const enumPromises = enumNamesResponse.map(enumName =>
            api.get<EnumItem[]>(`/v1/enums/${enumName}`)
        );
        const enumResults = await Promise.all(enumPromises);
        const allEnums = enumNamesResponse.reduce((acc, enumName, index) => {
            acc[enumName] = enumResults[index];
            return acc;
        }, {} as EnumsResponse);
        saveEnumsToStorage(allEnums);
        return allEnums;
    } catch (error) {
        console.error('Failed to fetch enums:', error);
        throw error;
    }
};

export const getEnum = async (enumName: string): Promise<EnumItem[]> => {
    const storedEnums = getEnumsFromStorage();
    if (storedEnums && storedEnums[enumName]) {
        return storedEnums[enumName];
    }
    const api = createApiClient();
    try {
        const enumItems = await api.get<EnumItem[]>(`/v1/enums/${enumName}`);
        const updatedEnums = {
            ...(storedEnums || {}),
            [enumName]: enumItems
        };
        saveEnumsToStorage(updatedEnums);
        return enumItems;
    } catch (error) {
        console.error(`Failed to fetch enum ${enumName}:`, error);
        throw error;
    }
};