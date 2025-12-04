import { createApiClient, getInitialAuthData } from '../utils/apiClient';
import {
    type ActivityLog,
    type ActivityLogDetail,
    type ActivityLogResponse,
    type ActivityLogParams
} from '../types/interfaces/i-activity-Log';

class ActivityLogService {
    private getApiClient() {
        const { selectedAccount } = getInitialAuthData();
        if (!selectedAccount) {
            throw new Error('No account selected');
        }
        return createApiClient({ selectedAccount });
    }

    async getActivityLogs(params: ActivityLogParams): Promise<ActivityLogResponse> {
        try {
            const api = this.getApiClient();
            const response = await api.get(
                `/v1/accounts/activity-logs?page=${params.page}&pageLength=${params.pageLength}&sortBy=${params.sortBy}&order=${params.order}`
            );

            return {
                items: response.items || [],
                itemCount: response.itemCount || 0,
                totalCount: response.totalCount || response.itemCount || 0
            };
        } catch (error) {
            console.error('Error fetching activity logs:', error);
            throw error;
        }
    }

    async getActivityLogDetails(id: string): Promise<ActivityLogDetail[]> {
        try {
            const api = this.getApiClient();
            const response = await api.get(`/v1/accounts/activity-log/${id}/details`);
            return response || [];
        } catch (error) {
            console.error('Error fetching activity log details:', error);
            throw error;
        }
    }
}

export const activityLogService = new ActivityLogService();