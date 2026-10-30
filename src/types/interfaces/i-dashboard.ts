export interface DashboardCountsResponse {
    activeStudentCount: number;
    activeTeacherCount: number;
    numberOfClassRooms: number;
    numberOfParents: number;
    status: number;
    message: string | null;
    [key: string]: any;
}

export interface DashboardParams {
    schoolId?: string;
}