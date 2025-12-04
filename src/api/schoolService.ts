import { createApiClient, getInitialAuthData } from "../utils/apiClient";
import { type SchoolDetails, type SchoolSlimResponse, type SchoolTerm, type SchoolTermsResponse } from "../types/interfaces/i-school";

export class SchoolService {
    /**
     * Fetch school details for the currently selected account
     */
    static async getSchoolDetails(): Promise<SchoolDetails | null> {
        const { selectedAccount } = getInitialAuthData();

        if (!selectedAccount) {
            console.error('No account selected');
            return null;
        }

        try {
            const api = createApiClient({ selectedAccount });
            const response = await api.get<SchoolSlimResponse>('/v1/accounts/slim');
            console.log('School Details API Response:', response);

            if (response) {
                return {
                    id: response.id,
                    schoolName: response.schoolName || 'Not available',
                    currentSession: response.currentSession,
                    currentTerm: response.currentTerm,
                };
            }
            return null;
        } catch (error) {
            console.error('Error fetching school details:', error);
            throw error; // Re-throw to let component handle error state
        }
    }

    /**
     * Update school session and term
     */
    static async updateAcademicSession(sessionData: {
        currentSession: number;
        currentTerm: number;
    }): Promise<void> {
        const { selectedAccount } = getInitialAuthData();

        if (!selectedAccount) {
            throw new Error('No account selected');
        }

        try {
            const api = createApiClient({ selectedAccount });
            await api.put('/v1/accounts/current-session', sessionData);
        } catch (error) {
            console.error('Error updating academic session:', error);
            throw error;
        }
    }

    /**
      * Fetch all school terms
      */
    static async getSchoolTerms(): Promise<SchoolTerm[]> {
        const { selectedAccount } = getInitialAuthData();

        if (!selectedAccount) {
            throw new Error('No account selected');
        }

        try {
            const api = createApiClient({ selectedAccount });
            const response = await api.get<SchoolTermsResponse | SchoolTerm[]>('/v1/enums/terms');
            console.log('School Terms API Response:', response);

            // Handle different response structures
            if (Array.isArray(response)) {
                // If response is directly an array of SchoolTerm
                return response;
            } else if (response && 'items' in response && Array.isArray(response.items)) {
                // If response is an object with 'items' property
                return response.items;
            } else {
                // If response structure is unexpected, return empty array
                console.warn('Unexpected response structure for school terms:', response);
                return [];
            }
        } catch (error) {
            console.error('Error fetching school terms:', error);
            throw error;
        }
    }

    // /**
    //  * Delete a school term
    //  */
    // static async deleteSchoolTerm(termValue: number): Promise<void> {
    //     const { selectedAccount } = getInitialAuthData();

    //     if (!selectedAccount) {
    //         throw new Error('No account selected');
    //     }

    //     try {
    //         const api = createApiClient({ selectedAccount });
    //         await api.delete(`/v1/school-terms/${termValue}`);
    //     } catch (error) {
    //         console.error('Error deleting school term:', error);
    //         throw error;
    //     }
    // }

    // /**
    //  * Update a school term
    //  */
    // static async updateSchoolTerm(termValue: number, data: Partial<SchoolTerm>): Promise<SchoolTerm> {
    //     const { selectedAccount } = getInitialAuthData();

    //     if (!selectedAccount) {
    //         throw new Error('No account selected');
    //     }

    //     try {
    //         const api = createApiClient({ selectedAccount });
    //         const response = await api.put<SchoolTerm>(`/v1/school-terms/${termValue}`, data);
    //         return response;
    //     } catch (error) {
    //         console.error('Error updating school term:', error);
    //         throw error;
    //     }
    // }

    // /**
    //  * Create a new school term
    //  */
    // static async createSchoolTerm(data: Omit<SchoolTerm, 'value'>): Promise<SchoolTerm> {
    //     const { selectedAccount } = getInitialAuthData();

    //     if (!selectedAccount) {
    //         throw new Error('No account selected');
    //     }

    //     try {
    //         const api = createApiClient({ selectedAccount });
    //         const response = await api.post<SchoolTerm>('/v1/school-terms', data);
    //         return response;
    //     } catch (error) {
    //         console.error('Error creating school term:', error);
    //         throw error;
    //     }
    // }
}