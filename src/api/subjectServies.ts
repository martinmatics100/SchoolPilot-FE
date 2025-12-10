import { createApiClient } from "../utils/apiClient";
import { type SubjectsResponse } from "../types/interfaces/i-subject";

const BASE_URL = '/v1/subjects';

export const fetchSubjects = async (
    selectedAccount: string | null,
    options: {page: number; pageLength: number; level?: string; category?: string}
): Promise<SubjectsResponse> => {
    if(!selectedAccount){
        throw new Error("No account selected")
    }

    const api = createApiClient({selectedAccount});
    const params = new URLSearchParams();
    params.append('page', options.page.toString());
    params.append('pageLength', options.pageLength.toString());

    if (options.level){
        params.append('level', options.level);
    }

    if (options.category){
        params.append('category', options.category);
    }

    const url = `/v1/subjects?${params.toString()}`;
    const response = await api.get(url);
    return{
        subjects: response.subjects || response.items || response || [],
        itemCount: response.itemCount || response.totalCount || (response.subjects || response.items || response || []).lenght
    };
}

export const createSubject = async (apiClient: any, payload: any) => {
    const response = await apiClient.post(`${BASE_URL}`, payload);
    return response;
};