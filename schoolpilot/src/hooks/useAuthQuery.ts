// src/hooks/useAuthQuery.ts
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuth } from '../context';

export const useAuthQuery = <TData = unknown>(
    queryKey: string[],
    url: string,
    options?: any
) => {
    const { apiClient } = useAuth();

    return useQuery<TData>({
        queryKey,
        queryFn: async () => {
            const data = await apiClient.get(url);
            return data;
        },
        ...options,
    });
};

export const useAuthMutation = <TVariables = unknown, TData = unknown>(
    url: string,
    method: 'POST' | 'PUT' | 'DELETE',
    options?: any
) => {
    const { apiClient } = useAuth();

    const mutationFn = async (variables: TVariables) => {
        switch (method) {
            case 'POST':
                return await apiClient.post(url, variables);
            case 'PUT':
                return await apiClient.put(url, variables);
            case 'DELETE':
                return await apiClient.delete(url);
            default:
                throw new Error(`Unsupported method: ${method}`);
        }
    };

    return useMutation<TData, Error, TVariables>({
        mutationFn,
        ...options,
    });
};
