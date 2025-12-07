import { createApiClient } from '../utils/apiClient';

const BASE_URL = '/v1/users';

export const fetchUsers = async (
    selectedAccount: string | null,
    page: number,
    pageLength: number,
    role?: string
) => {
    if (!selectedAccount) {
        throw new Error('No account selected');
    }

    const api = createApiClient({ selectedAccount });
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageLength', pageLength.toString());

    if (role) {
        params.append('role', role);
    }

    const url = `${BASE_URL}?${params.toString()}`;
    const response = await api.get(url);
    return {
        items: response.items || [],
        itemCount: response.itemCount || 0
    };
};


export const fetchTeachers = async (selectedAccount: string | null, enums: any) => {
    if (!selectedAccount) {
        throw new Error('No account selected');
    }

    if (!enums) {
        throw new Error('Enums not loaded');
    }

    const api = createApiClient({ selectedAccount });

    const teacherRole = enums?.UserRole?.find((role: any) =>
        role.name.toLowerCase() === 'teacher' ||
        role.displayName?.toLowerCase() === 'teacher'
    )?.value;

    if (!teacherRole) {
        throw new Error('Teacher role not found in enums');
    }

    const queryParams = new URLSearchParams({
        role: teacherRole.toString(),
        page: '1',
        pageLength: '1000',
        excludeAssignedTeachers: 'true'
    });

    const response = await api.get(`${BASE_URL}?${queryParams}`);
    return response.items?.map((item: any) => ({
        id: item.id,
        firstName: item.firstName || '',
        lastName: item.lastName || '',
        email: item.email || ''
    })) || [];
};

export const deleteUsers = async (ids: string[]) => {
    const response = await fetch(`${BASE_URL}/delete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
        throw new Error('Failed to delete users');
    }

    return response.json();
};

export const fetchSubjects = async () => {
    const api = createApiClient();
    const subjectsData = await api.get(`${BASE_URL}/subjects`);
    return subjectsData;
};

export const fetchBranches = async (selectedAccount: string | null, apiClient: any) => {
    if (!selectedAccount) {
        throw new Error('No account selected');
    }

    const response = await apiClient.getDefaultSchools(selectedAccount);
    const fetchedBranches = response.regularSchools.flatMap((school: any) =>
        school.locations.map((location: any) => ({
            id: location.id,
            name: location.name
        }))
    );
    return fetchedBranches;
};

export const createStaff = async (apiClient: any, payload: any) => {
    const response = await apiClient.post(`${BASE_URL}/create-invite`, payload);
    return response;
};