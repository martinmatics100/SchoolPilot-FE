// services/accountServices.ts
import { createApiClient, getInitialAuthData } from '../utils/apiClient';
import { type DashboardCountsResponse, type DashboardParams } from '../types/interfaces/i-dashboard';

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
            // Using query params if schoolId is provided
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
}

export const accountService = new AccountService();