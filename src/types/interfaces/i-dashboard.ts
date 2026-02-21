// types/interfaces/i-dashboard.ts
export interface DashboardCountsResponse {
    activeStudentCount: number;
    activeTeacherCount: number;
    status: number;
    message: string | null;
    // This allows you to add "staffCount", "parentCount", etc., without changing the type
    [key: string]: any;
}

export interface DashboardParams {
    schoolId?: string;
}