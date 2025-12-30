import { createApiClient } from "../utils/apiClient";
import { type SubjectsResponse, type SubjectModelForAllocationResponse } from "../types/interfaces/i-subject";

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


export const fetchSubjectsForAllocation = async (
    selectedAccount: string | null,
    options: {page: number; pageLength: number; level?: string; category?: string}
): Promise<SubjectModelForAllocationResponse> => {
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

    const url = `/v1/subjects/subject-alloc?${params.toString()}`;
    const response = await api.get(url);
    return {
        items: response.items || [],  
        itemCount: response.itemCount ?? 0,
        pageLength: response.pageLength ?? options.pageLength,
        currentPage: response.currentPage ?? 1,
        pageCount: response.pageCount ?? 1
    };
}

export const AssignTeacherToSubjectClass = async (apiClient: any, payload: any) => {
    const response = await apiClient.post(`/v1/subjects/assign-subjects`, payload);
    return response;
};

export const fetchSubjectTeacherAssignments = async (selectedAccount: string | null) => {
    if (!selectedAccount) throw new Error("No account selected");

    const api = createApiClient({ selectedAccount });
    const response = await api.get(`/v1/subjects/assign-subjects-list`);

    // Expected response: Array<{ subjectName, teachers: [{ teacherName, classes: [] }] }>
    return response.items || response || [];
};

export const fetchSubjectTeacherAssessment = async (selectedAccount: string | null) => {
    if (!selectedAccount) throw new Error("No account selected");

    const api = createApiClient({ selectedAccount });
    const response = await api.get(`/v1/subjects/assessment-list`);

    // Expected response: Array<{ subjectName, teachers: [{ teacherName, classes: [] }] }>
    return response.items || response || [];
};

export const createSubjectAssessment = async (selectedAccount: string | null,
    payload: {
        subjectId: string;
        schoolSession: number;
        schoolTerm: number;
    }
) => {
    if (!selectedAccount) {
        throw new Error("No account selected");
    }

    const api = createApiClient({ selectedAccount });

    const response = await api.post(`/v1/subjects/create-assessment`, payload);

    return response;
};
