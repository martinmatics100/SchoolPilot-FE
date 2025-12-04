import { createApiClient } from '../utils/apiClient';

const BASE_URL = '/v1/accounts';

export const fetchTeachers = async (selectedAccount: string | null, enums: any) => {
    if (!selectedAccount) {
        throw new Error('No account selected');
    }

    if (!enums || !enums.UserRole) {
        console.warn('Enums or UserRole not loaded');
        return [];
    }

    const api = createApiClient({ selectedAccount });

    const teacherRole = enums.UserRole.find((role: any) =>
        role.name.toLowerCase() === 'teacher' ||
        role.displayName?.toLowerCase() === 'teacher'
    )?.value;

    if (!teacherRole) {
        console.warn('Teacher role not found in enums');
        return [];
    }

    const queryParams = new URLSearchParams({
        role: teacherRole.toString(),
        page: '1',
        pageLength: '1000',
        excludeAssignedTeachers: 'true'
    });

    const response = await api.get(`/v1/users?${queryParams}`);
    return response.items?.map((item: any) => ({
        id: item.id,
        firstName: item.firstName || '',
        lastName: item.lastName || '',
        email: item.email || ''
    })) || [];
};

export const createClass = async (apiClient: any, payload: any) => {
    const response = await apiClient.post(`${BASE_URL}/create-class`, payload);
    return response;
};

export const fetchClasses = async (selectedAccount: string | null) => {
    if (!selectedAccount) {
        throw new Error('No account selected');
    }

    const api = createApiClient({ selectedAccount });
    const response = await api.get(`${BASE_URL}/class`);
    return Array.isArray(response) ? response : (response.items || []);
};

export const deleteClass = async (selectedAccount: string | null, id: string) => {
    if (!selectedAccount) {
        throw new Error('No account selected');
    }

    const api = createApiClient({ selectedAccount });
    await api.delete(`${BASE_URL}/class/${id}`);
};