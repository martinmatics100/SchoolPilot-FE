import { createApiClient } from "../utils/apiClient";
import { type SubjectsResponse, type SubjectModelForAllocationResponse, type CreateSubjectAssessmentPayload } from "../types/interfaces/i-subject";

const BASE_URL = '/v1/subjects';

export const fetchClassesWithSubjects = async (
  selectedAccount: string | null,
  options: { page: number; pageLength: number }
) => {
  if (!selectedAccount) {
    throw new Error("No account selected");
  }

  const api = createApiClient({ selectedAccount });

  const params = new URLSearchParams();
  params.append("page", options.page.toString());
  params.append("pageLength", options.pageLength.toString());

  const response = await api.get(`/v1/subjects?${params.toString()}`);

  return {
    items: response.items || [],
    itemCount: response.itemCount ?? 0,
  };
};


export const createSubject = async (apiClient: any, payload: any) => {
    const response = await apiClient.post(`${BASE_URL}/assign-subjects-to-class`, payload);
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
    payload: CreateSubjectAssessmentPayload
) => {
    if (!selectedAccount) {
        throw new Error("No account selected");
    }

    const api = createApiClient({ selectedAccount });

    const response = await api.post(`/v1/subjects/create-assessment`, payload);

    return response;
};

export const fetchClassSubjects = async (
  apiClient: any,
  classId: string | number
) => {
  const response = await apiClient.get(`/v1/subjects/get-class-subjects?classId=${classId}`);
  return response.subjects || []; // now returns SubjectDto[]
};

// Update the updateClassSubjects function
export const updateClassSubjects = async (
    selectedAccount: string | null,
    classId: string,
    payload: { subjects: number[] }
) => {
    if (!selectedAccount) {
        throw new Error("No account selected");
    }

    const api = createApiClient({ selectedAccount });

    try {
        // Use the appropriate endpoint based on your backend API
        const response = await api.put(`/v1/subjects/class/${classId}/subjects`, payload);
        return response;
    } catch (error) {
        console.error("Error updating class subjects:", error);
        throw error;
    }
};

