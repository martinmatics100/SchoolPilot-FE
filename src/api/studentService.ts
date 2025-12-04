import { createApiClient } from "../utils/apiClient";

const BASE_URL = '/v1/students';

export const createStudent = async (apiClient: any, payload: any) => {
    const response = await apiClient.post('/v1/students/create', payload);
    return response;
};

export const fetchStudents = async (
    selectedAccount: string | null,
    page: number,
    pageLength: number
) => {
    if (!selectedAccount) {
        throw new Error('No account selected');
    }

    const api = createApiClient({ selectedAccount });
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageLength', pageLength.toString());

    const url = `${BASE_URL}?${params.toString()}`;
    const response = await api.get(url);
    return {
        items: response.items || [],
        itemCount: response.itemCount || 0
    };
};

export const deleteStudent = async (selectedAccount: string | null, id: string) => {
    if (!selectedAccount) {
        throw new Error('No account selected');
    }

    const api = createApiClient({ selectedAccount });
    await api.delete(`${BASE_URL}/${id}`);
};