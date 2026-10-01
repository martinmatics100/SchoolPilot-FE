// resultService.ts
import { createApiClient } from "../utils/apiClient";

/**
 * Download a single student's terminal report as a PDF Blob.
 */
// export const printStudentReport = async (
//     selectedAccount: string | null,
//     params: {
//         studentId: string;
//         classId: string;
//         schoolSession: number;
//         schoolTerm: number;
//     }
// ): Promise<Blob> => {
//     if (!selectedAccount) throw new Error("No account selected");
//
//     const api = createApiClient({ selectedAccount });
//
//     const query = new URLSearchParams({
//         studentId: params.studentId,
//         classId: params.classId,
//         schoolSession: params.schoolSession.toString(),
//         schoolTerm: params.schoolTerm.toString(),
//     });
//
//     const blob: Blob = await api.get(
//         `/v1/students/terminal-report/print?${query}`,
//         { responseType: "blob" }
//     );
//
//     return blob;
// };

/**
 * Download terminal report cards for a class as a single PDF Blob.
 * - If studentIds is provided (non-empty) → only those students.
 * - If omitted / null → all students in the class.
 */
export const printClassTerminalReports = async (
    selectedAccount: string | null,
    params: {
        classId: string;
        schoolSession: number;
        schoolTerm: number;
        studentIds?: string[];
    }
): Promise<Blob> => {
    if (!selectedAccount) throw new Error("No account selected");

    const api = createApiClient({ selectedAccount });

    const query = new URLSearchParams({
        ClassId: params.classId,
        SchoolSession: params.schoolSession.toString(),
        SchoolTerm: params.schoolTerm.toString(),
    });

    const body =
        params.studentIds && params.studentIds.length > 0
            ? { StudentIds: params.studentIds }
            : null;

    return api.post(
        `/v1/class/class-terminal-reports/print?${query.toString()}`,
        body,
        true // responseType: blob
    );
};

/**
 * Publish terminal reports for a class.
 * - If studentIds is provided (non-empty) → publish only those students.
 * - If omitted / null → publish for all students in the class.
 *
 * Backend route: POST /api/v1/reports/classes/{classId}/publish
 * Backend command body: { SchoolSession, SchoolTerm, StudentIds? }
 * (AccountId, UserId, ClassId are populated server-side from claims + route)
 */
export const publishResults = async (
    selectedAccount: string | null,
    params: {
        classId: string;
        schoolSession: number;
        schoolTerm: number;
        studentIds?: string[];
    }
): Promise<{
    publishedCount: number;
    skippedCount: number;
    publishedReportIds: string[];
}> => {
    if (!selectedAccount) throw new Error("No account selected");

    const api = createApiClient({ selectedAccount });

    const body: {
        SchoolSession: number;
        SchoolTerm: number;
        StudentIds?: string[];
    } = {
        SchoolSession: params.schoolSession,
        SchoolTerm: params.schoolTerm,
    };

    // Only send StudentIds when publishing a subset.
    // Omit entirely for "publish all in class".
    if (params.studentIds && params.studentIds.length > 0) {
        body.StudentIds = params.studentIds;
    }

    return api.post(
        `/v1/reports/classes/${params.classId}/publish`,
        body
    );
};

/**
 * Unpublish terminal reports for a class.
 * - If studentIds is provided (non-empty) → unpublish only those students.
 * - If omitted / null → unpublish the entire class for that term/session.
 *
 * Backend route: POST /api/v1/reports/classes/{classId}/unpublish
 * Backend command body: { SchoolSession, SchoolTerm, StudentIds?, Reason? }
 */
export const unpublishResults = async (
    selectedAccount: string | null,
    params: {
        classId: string;
        schoolSession: number;
        schoolTerm: number;
        studentIds?: string[];
        reason?: string;
    }
): Promise<{ unpublishedCount: number }> => {
    if (!selectedAccount) throw new Error("No account selected");

    const api = createApiClient({ selectedAccount });

    const body: {
        SchoolSession: number;
        SchoolTerm: number;
        StudentIds?: string[];
        Reason?: string;
    } = {
        SchoolSession: params.schoolSession,
        SchoolTerm: params.schoolTerm,
    };

    if (params.studentIds && params.studentIds.length > 0) {
        body.StudentIds = params.studentIds;
    }

    if (params.reason) {
        body.Reason = params.reason;
    }

    return api.post(
        `/v1/reports/classes/${params.classId}/unpublish`,
        body
    );
};


/**
 * Fetch the list of StudentIds whose terminal reports are currently
 * published (non-deprecated) for the given class + session + term.
 *
 * Backend route: GET /api/v1/reports/classes/{classId}/published-status
 */
export const getPublishedReportStatus = async (
    selectedAccount: string | null,
    params: {
        classId: string;
        schoolSession: number;
        schoolTerm: number;
    }
): Promise<{ publishedStudentIds: string[] }> => {
    if (!selectedAccount) throw new Error("No account selected");

    const api = createApiClient({ selectedAccount });

    const query = new URLSearchParams({
        schoolSession: params.schoolSession.toString(),
        schoolTerm: params.schoolTerm.toString(),
    });

    return api.get(
        `/v1/reports/classes/${params.classId}/published-status?${query.toString()}`
    );
};




// ─────────────────────────────────────────────────────────────────────────
// Parent portal — children + published reports
// ─────────────────────────────────────────────────────────────────────────

// ─── Parent portal types ────────────────────────────────────────────────
export interface ParentPublishedReportDto {
    reportId: string;
    schoolSession: number;
    schoolTerm: number;
    schoolSessionLabel: string;
    schoolTermLabel: string;
    version: number;
    publishedAt: string;
}

export interface ParentChildDto {
    studentId: string;
    firstName: string;
    lastName: string;
    studentName: string;
    admissionNumber: string;
    className: string;
    classLevel: string;
    gender: string;
    photoUrl?: string | null;
    resultStatus: "published" | "pending" | string;
    resultNote?: string | null;
    reports: ParentPublishedReportDto[];
}

export interface MyChildrenReportsResponse {
    children: ParentChildDto[];
    currentSchoolSession?: number | null;
    currentSchoolTerm?: number | null;
    currentSessionLabel?: string | null;
    currentTermLabel?: string | null;
}

/**
 * Fetch all children of the logged-in parent.
 * Backend: GET /api/v1/reports/my-children
 */
export const getMyChildrenPublishedReports = async (
    selectedAccount: string | null
): Promise<MyChildrenReportsResponse> => {
    if (!selectedAccount) throw new Error("No account selected");
    const api = createApiClient({ selectedAccount });
    return api.get(`/v1/reports/my-children`);
};

/**
 * Download a published report as PDF.
 * Backend: GET /api/v1/reports/published/{reportId}/download
 *
 * Requires `apiClient.getBlob` (see step 2).
 */
export const downloadPublishedReport = async (
    selectedAccount: string | null,
    reportId: string
): Promise<Blob> => {
    if (!selectedAccount) throw new Error("No account selected");
    const api = createApiClient({ selectedAccount });
    return api.getBlob(`/v1/reports/published/${reportId}/download`);
};