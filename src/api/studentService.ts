import { createApiClient } from "../utils/apiClient";
import { type UpdateStudentPayload } from "../types/interfaces/i-student";

const BASE_URL = '/v1/students';

export const createStudent = async (apiClient: any, payload: any) => {
    const response = await apiClient.post('/v1/students/create', payload);
    return response;
};

/**
 * Fetch a paginated list of students, optionally filtered by class.
 *
 * @param selectedAccount  Currently selected account id.
 * @param page             1-based page number.
 * @param pageLength       Page size.
 * @param classId          Optional class GUID to filter by. Omit or pass
 *                         undefined / empty string for "all classes".
 */
export const fetchStudents = async (
    selectedAccount: string | null,
    page: number,
  pageLength: number,
  classId?: string
) => {
    if (!selectedAccount) {
        throw new Error('No account selected');
    }

    const api = createApiClient({ selectedAccount });

    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageLength', pageLength.toString());

  if (classId) {
    params.append('classId', classId);
  }

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

export const fetchStudentScoresBySubject = async ({
  selectedAccount,
  classId,
  subjectId,
  schoolSession,
  schoolTerm,
}: {
  selectedAccount: string;
  classId: string;
  subjectId: string;
  schoolSession: number;
  schoolTerm: number;
}) => {
  const api = createApiClient({ selectedAccount });

  const params = new URLSearchParams({
    classId,
    subjectId,
    schoolSession: schoolSession.toString(),
    schoolTerm: schoolTerm.toString(),
  });

  const response = await api.get(
    `/v1/students/get-scores?${params.toString()}`
  );

  return response.items ?? [];
};

export interface BulkCreateStudent {
  firstName: string;
  lastName: string;
  gender: string;             // "Male" | "Female"
  religiousSubject: string;   // "CRS" | "IRS"
  languageSubject: string;    // "Hausa" | "Yoruba" | "Igbo"
}

export interface BulkCreateStudentsPayload {
  classRoomId: string;
  students: BulkCreateStudent[];
}

export const createStudentsBulk = async (
  selectedAccount: string | null,
  payload: BulkCreateStudentsPayload
) => {
  if (!selectedAccount) {
    throw new Error("No account selected");
  }

  const api = createApiClient({ selectedAccount });
  const response = await api.post("/v1/students/bulk-create", payload);
  return response;
};

export const saveClassStudentScores = async (
  selectedAccount: string | null,
  payload: any
) => {
  if (!selectedAccount) throw new Error("No account selected");

  const api = createApiClient({ selectedAccount });

  return api.post(`/v1/students/save-scores`, payload);
};

export const getStudentById = async (selectedAccount: string | null, id: string) => {
  if (!selectedAccount) {
    throw new Error('No account selected');
  }

  const api = createApiClient({ selectedAccount });
  const response = await api.get(`${BASE_URL}/${id}`);
  return response;
};

export const updateStudent = async (
  selectedAccount: string | null,
  id: string,
  payload: UpdateStudentPayload
) => {
  if (!selectedAccount) {
    throw new Error('No account selected');
  }

  const api = createApiClient({ selectedAccount });
  const response = await api.put(`${BASE_URL}/${id}`, payload);
  return response;
};

// Fetch all students in a given class (returns { studentId, name }[]).
export const fetchStudentsByClass = async (
  selectedAccount: string | null,
  classId: string
): Promise<{ studentId: string; name: string }[]> => {
  if (!selectedAccount) throw new Error("No account selected");
  if (!classId) throw new Error("classId is required");

  const api = createApiClient({ selectedAccount });
  const response = await api.get(
    `/v1/students/students-by-class?classId=${encodeURIComponent(classId)}`
  );
  return response.students ?? [];
};

// Bulk upsert affective skills (per-student values).
export const bulkSaveAffectiveSkills = async (
  selectedAccount: string | null,
  payload: {
    students: {
      studentId: string;
      conduct: number | null;
      attitude: number | null;
      interest: number | null;
    }[];
  }
) => {
  if (!selectedAccount) throw new Error("No account selected");

  const api = createApiClient({ selectedAccount });
  return api.post("/v1/students/affective-skills/bulk", payload);
};

// Fetch affective skills for all students in a class.
// Returns per-student { studentId, name, conduct, attitude, interest }.
export const fetchClassAffectiveSkills = async (
  selectedAccount: string | null,
  classId: string
): Promise<
  {
    studentId: string;
    name: string;
    conduct: number | null;
    attitude: number | null;
    interest: number | null;
  }[]
> => {
  if (!selectedAccount) throw new Error("No account selected");
  if (!classId) throw new Error("classId is required");

  const api = createApiClient({ selectedAccount });
  const response = await api.get(
    `/v1/students/affective-skills?classId=${encodeURIComponent(classId)}`
  );

  return (response.students ?? []).map((s: any) => ({
    studentId: s.studentId,
    name: s.name,
    conduct: s.conduct ?? null,
    attitude: s.attitude ?? null,
    interest: s.interest ?? null,
  }));
};