
export interface AttendanceSessionPayload {
    AttendanceDate: string;
    Term: number;
    Session: number;
    ClassId: string;
    AttendanceType: number;
}

export interface AttendanceSessionResponse {
    sessionId: string;
    // Add other response fields as needed
    id?: string;
    // Add other response fields based on your API
    message?: string;
    success?: boolean;
}

export interface AttendanceSessionDetails {
    session: {
        id: string;
        classId: string;
        className: string;
        classLevel: number;
        attendanceDate: string;
        term: number;
        session: number;
        type: number;
        status: number;
        totalStudents: number;
        presentCount: number;
        absentCount: number;
        lateCount: number;
        excusedCount: number;
        attendanceRate: number;
    };
    students: StudentAttendance[];
}



// pages/attendance/AttendanceDashboard/types/index.ts

export interface AttendanceStats {
    todayRate: number;
    weekRate: number;
    monthRate: number;
    termRate: number;
    presentToday: number;
    absentToday: number;
    lateToday: number;
    excusedToday: number;
    totalStudents: number;
    totalClasses: number;
    classesWithAttendance: number;
    comparedToYesterday: number;
    comparedToLastWeek: number;
    classId?: string;
    className?: string;

    weekPresent?: number;
    weekAbsent?: number;
    monthPresent?: number;
    monthAbsent?: number;
    termPresent?: number;
    termAbsent?: number;
    termTotalSessions?: number;
    currentTerm?: string;
    // currentSession?: string;
}

export interface ClassAttendance {
    className: string;
    rate: number;
    present: number;
    absent: number;
    total: number;
    classId?: string;
}

export interface StudentAttendance {
    id: string;
    name: string;
    studentId: string;
    class: string;
    rate: number;
    status: "good" | "warning" | "danger";
}

export interface DailyTrend {
    date: string;
    rate: number;
    present: number;
    absent: number;
    classId?: string;
}

export interface ClassOption {
    id: string;
    name: string;
}