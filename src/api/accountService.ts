import { createApiClient, getInitialAuthData } from '../utils/apiClient';
import {
    type DashboardCountsResponse,
    type DashboardParams,
} from '../types/interfaces/i-dashboard';

export interface SchoolInfoResponse {
    id: string;
    schoolName: string;
    schoolEmail?: string | null;
    shortCode?: string | null;
    principalName?: string | null;
    yearofEstablishment?: number | null;
    currentTermStartDate?: string | null;
    currentTermEndDate?: string | null;
    nextTermBegins?: string | null;
    currentTerm?: number | null;
    currentSession?: number | null;
    schoolCategory?: number | null;
    schoolType?: number | null;
    schoolStatus?: number | null;
    schoolMotto?: string | null;
    hasEnrolledStudents?: boolean;
    enrolledStudentCount?: number;
}

export interface AdvanceTermPayload {
    schoolId: string;
    newTerm: number;
    newTermStartDate: string;
    newTermEndDate: string;
    nextTermBegins?: string | null;
}

export interface RolloverSessionPayload {
    schoolId: string;
    newSession: number;
    newTermStartDate: string;
    newTermEndDate: string;
    nextTermBegins?: string | null;
    promoteStudents: boolean;
}

export interface RolloverPreviewPromotion {
    studentId: string;
    studentName: string;
    fromClassId?: string | null;
    fromClassName: string;
    toClassId?: string | null;
    toClassName?: string | null;
    outcome: string;
}

export interface RolloverPreviewResponse {
    schoolId: string;
    currentSession?: number | null;
    currentTerm?: number | null;
    newSession?: number | null;
    totalStudents: number;
    promotedCount: number;
    graduatedCount: number;
    promotions: RolloverPreviewPromotion[];
    error?: string | null;
}

export interface AdvanceTermResponse {
    message?: string;
    schoolId?: string;
    newTerm?: number | null;
    currentSession?: number | null;
}

export interface RolloverSessionResponse {
    message?: string;
    promotedCount: number;
    graduatedCount: number;
    totalStudents: number;
    promotions: RolloverPreviewPromotion[];
}


class AccountService {
    private getApiClient() {
        const { selectedAccount } = getInitialAuthData();
        if (!selectedAccount) {
            throw new Error('No account selected');
        }
        return createApiClient({ selectedAccount });
    }

    async getDashboardCounts(params?: DashboardParams): Promise<DashboardCountsResponse> {
        try {
            const api = this.getApiClient();
            const url = params?.schoolId
                ? `/v1/accounts/dashboard-count=${params.schoolId}`
                : `/v1/accounts/dashboard-count`;

            const response = await api.get(url);
            return response;
        } catch (error) {
            console.error('Error fetching dashboard counts:', error);
            throw error;
        }
    }

    async getSchoolInformation(): Promise<SchoolInfoResponse | null> {
        try {
            const api = this.getApiClient();
            const response = await api.get<{
                school: SchoolInfoResponse;
                message: string;
                status: number;
            }>('/v1/accounts/school-info');

            return response.school ?? null;
        } catch (error) {
            console.error('Error fetching school info:', error);
            throw error;
        }
    }


    async advanceTerm(payload: AdvanceTermPayload): Promise<AdvanceTermResponse> {
        try {
            const api = this.getApiClient();
            const { schoolId, ...body } = payload;
            const response = await api.post<AdvanceTermResponse>(
                `/v1/accounts/${schoolId}/advance-term`,
                body
            );
            return response;
        } catch (error) {
            console.error('Error advancing term:', error);
            throw error;
        }
    }

    async previewRollover(
        schoolId: string,
        newSession: number
    ): Promise<RolloverPreviewResponse> {
        try {
            const api = this.getApiClient();
            const response = await api.get<RolloverPreviewResponse>(
                `/v1/accounts/${schoolId}/rollover-preview?newSession=${newSession}`
            );
            return response;
        } catch (error) {
            console.error('Error fetching rollover preview:', error);
            throw error;
        }
    }

    async rolloverSession(
        payload: RolloverSessionPayload
    ): Promise<RolloverSessionResponse> {
        try {
            const api = this.getApiClient();
            const { schoolId, ...body } = payload;
            const response = await api.post<RolloverSessionResponse>(
                `/v1/accounts/${schoolId}/rollover-session`,
                body
            );
            return response;
        } catch (error) {
            console.error('Error rolling over session:', error);
            throw error;
        }
    }
}

export const accountService = new AccountService();