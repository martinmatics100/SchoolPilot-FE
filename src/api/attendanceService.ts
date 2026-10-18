// In your api/attendanceService.ts file:

import { createApiClient } from "../utils/apiClient";
import { type AttendanceSessionPayload, type StudentAttendance, type AttendanceSessionDetails } from "../types/interfaces/i-attendance";

const BASE_URL = '/v1/attendance';

export const createAttendanceSession = async (
    selectedAccount: string | null,
    payload: AttendanceSessionPayload
) => {
    if (!selectedAccount) {
        throw new Error("No account selected");
    }

    const api = createApiClient({ selectedAccount });

    const response = await api.post(`${BASE_URL}/session`, payload);

    return response;
};


export const fetchAttendanceSessions = async (
    selectedAccount: string | null,
    options?: { page?: number; pageLength?: number; classId?: string; date?: string }
) => {
    if (!selectedAccount) {
        throw new Error("No account selected");
    }

    const api = createApiClient({ selectedAccount });

    const params = new URLSearchParams();
    if (options?.page) params.append('page', options.page.toString());
    if (options?.pageLength) params.append('pageLength', options.pageLength.toString());
    if (options?.classId) params.append('classId', options.classId);
    if (options?.date) params.append('date', options.date);

    const url = `${BASE_URL}/list${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get(url);

    return {
        items: response.items || [],
        itemCount: response.itemCount ?? 0,
        pageLength: response.pageLength ?? options?.pageLength ?? 10,
        currentPage: response.currentPage ?? 1,
        pageCount: response.pageCount ?? 1
    };
};

export const fetchAttendanceSessionById = async (
    selectedAccount: string | null,
    sessionId: string
) => {
    if (!selectedAccount) {
        throw new Error("No account selected");
    }

    const api = createApiClient({ selectedAccount });
    const response = await api.get(`${BASE_URL}/sessions/${sessionId}`);

    return response;
};

export const updateAttendanceSession = async (
    selectedAccount: string | null,
    sessionId: string,
    payload: Partial<AttendanceSessionPayload>
) => {
    if (!selectedAccount) {
        throw new Error("No account selected");
    }

    const api = createApiClient({ selectedAccount });
    const response = await api.put(`${BASE_URL}/sessions/${sessionId}`, payload);

    return response;
};

export const deleteAttendanceSession = async (
    selectedAccount: string | null,
    sessionId: string
) => {
    if (!selectedAccount) {
        throw new Error("No account selected");
    }

    const api = createApiClient({ selectedAccount });
    const response = await api.delete(`${BASE_URL}/sessions/${sessionId}`);

    return response;
};


export const markStudentAttendance = async (
    selectedAccount: string | null,
    payload: {
        sessionId: string;
        studentId: string;
        status: number; 
        remarks?: string;
    }
) => {
    if (!selectedAccount) {
        throw new Error("No account selected");
    }

    const api = createApiClient({ selectedAccount });
    const response = await api.post(`${BASE_URL}/mark-attendance`, payload);

    return response;
};


export const markBulkAttendance = async (
    selectedAccount: string | null,
    payload: {
        sessionId: string;
        attendance: Array<{
            studentId: string;
            status: number;
            remarks?: string;
        }>;
    }
) => {
    if (!selectedAccount) {
        throw new Error("No account selected");
    }

    const api = createApiClient({ selectedAccount });
    const response = await api.post(`${BASE_URL}/bulk-attendance`, payload);

    return response;
};


export const fetchSessionAttendance = async (
    selectedAccount: string | null,
    sessionId: string
) => {
    if (!selectedAccount) {
        throw new Error("No account selected");
    }

    const api = createApiClient({ selectedAccount });
    const response = await api.get(`${BASE_URL}/sessions/${sessionId}/attendance`);

    return {
        items: response.items || [],
        itemCount: response.itemCount ?? 0
    };
};


export const fetchAttendanceSessionDetails = async (
    selectedAccount: string | null,
    sessionId: string
): Promise<AttendanceSessionDetails> => {
    if (!selectedAccount) {
        throw new Error("No account selected");
    }

    const api = createApiClient({ selectedAccount });
    const response = await api.get(`${BASE_URL}/session/${sessionId}/details`);
    return response;
};



export const bulkMarkAttendance = async (
    selectedAccount: string | null,
    payload: {
        sessionId: string;
        attendances: Array<{
            studentId: string;
            status: number; 
        }>;
        autoCompleteSession?: boolean;
    }
) => {
    if (!selectedAccount) {
        throw new Error("No account selected");
    }

    const api = createApiClient({ selectedAccount });
    const response = await api.post(`${BASE_URL}/bulk-mark-attendance`, payload);
    return response;
};



export const fetchAttendanceDashboardStats = async (
    selectedAccount: string | null,
    params: {
        todayDate: string;
        weekStartDate: string;
        weekEndDate: string;
        month: number;
        year: number;
        classId?: string;
    }
) => {
    if (!selectedAccount) {
        throw new Error("No account selected");
    }

    const api = createApiClient({ selectedAccount });

    const queryParams = new URLSearchParams();
    queryParams.append('todayDate', params.todayDate);
    queryParams.append('weekStartDate', params.weekStartDate);
    queryParams.append('weekEndDate', params.weekEndDate);
    queryParams.append('month', params.month.toString());
    queryParams.append('year', params.year.toString());

    if (params.classId && params.classId !== 'all') {
        queryParams.append('classId', params.classId);
    }

    const url = `${BASE_URL}/dashboard-stats?${queryParams.toString()}`;
    const response = await api.get(url);
    return response;
};



export type WeeklyAttendanceStatus =
    | "Present"
    | "Absent"
    | "Late"
    | "Excused"
    | "Unknown";

export interface WeeklyAttendanceStudent {
    studentId: string;
    firstName: string;
    lastName: string;
    studentUniqueId: string;
    days: Record<string, WeeklyAttendanceStatus | number | null>;
}

export interface WeeklyAttendanceResponse {
    classRoomId: string;
    startDate: string;
    endDate: string;
    students: WeeklyAttendanceStudent[];
}

export const fetchClassWeeklyAttendance = async (
    selectedAccount: string | null,
    classRoomId: string,
    fromIso: string,
    toIso: string
): Promise<WeeklyAttendanceResponse> => {
    if (!selectedAccount) {
        throw new Error("No account selected");
    }

    const api = createApiClient({ selectedAccount });
    const response = await api.get(
        `${BASE_URL}/class/${classRoomId}/weekly?from=${fromIso}&to=${toIso}`
    );
    return response;
};