
import { useEffect, useState } from 'react';
import { createApiClient } from '../utils/apiClient';
import { getEnumsFromStorage, saveEnumsToStorage } from '../api/enumsApi';

interface PermissionDependency {
    [key: string]: number[];
}

export const useEnums = (options?: { fetchPermissionData?: boolean }) => {
    const [enums, setEnums] = useState<Record<string, any[]>>({});
    const [permissionGroups, setPermissionGroups] = useState<any[]>([]);
    const [permissionDependencies, setPermissionDependencies] = useState<PermissionDependency>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPermissionData = async () => {
        const api = createApiClient();
        try {
            const [groups, dependencies] = await Promise.all([
                api.get('/v1/lookup/permissiongroups'),
                api.get('/v1/lookup/permissiondependencies')
            ]);
            return { groups, dependencies };
        } catch (err) {
            console.error('Failed to fetch permission data:', err);
            throw err;
        }
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Load from local storage
                const storedEnums = getEnumsFromStorage();

                if (options?.fetchPermissionData) {
                    // Only fetch permission data if explicitly requested
                    const { groups, dependencies } = await fetchPermissionData();
                    setPermissionGroups(groups);
                    setPermissionDependencies(dependencies);

                    // Update enums if we have stored data
                    if (storedEnums) {
                        setEnums({
                            ...storedEnums,
                            PermissionGroups: groups,
                            PermissionDependencies: dependencies
                        });
                    }

                    // Save to storage
                    saveEnumsToStorage({
                        ...(storedEnums || {}),
                        PermissionGroups: groups,
                        PermissionDependencies: dependencies
                    });
                } else if (storedEnums) {
                    // Just load the stored enums without permission data
                    setEnums(storedEnums);
                }
            } catch (err) {
                setError('Failed to load data');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [options?.fetchPermissionData]);

    return {
        enums,
        permissionGroups,
        permissionDependencies,
        isLoading,
        error,
        refresh: async () => {
            try {
                const { groups, dependencies } = await fetchPermissionData();
                setPermissionGroups(groups);
                setPermissionDependencies(dependencies);
            } catch (err) {
                console.error('Failed to refresh permission data:', err);
                throw err;
            }
        }
    };
};