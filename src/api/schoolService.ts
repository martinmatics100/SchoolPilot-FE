import { createApiClient, getInitialAuthData } from "../utils/apiClient";
import { type SchoolDetails, type SchoolSlimResponse, type SchoolTerm, type SchoolTermsResponse, type SchoolInfoResponse } from "../types/interfaces/i-school";
import { type AssessmentTypeConfig } from "../types/interfaces/i-assessment";

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

  static async getAssessmentTypes(): Promise<AssessmentTypeConfig[]> {
  const { selectedAccount } = getInitialAuthData();
  if (!selectedAccount) throw new Error("No account selected");

  try {
    const api = createApiClient({ selectedAccount });
    const response = await api.get<{ configs: AssessmentTypeConfig[] }>("/v1/accounts/assessment-type");
    return response.configs || [];
  } catch (error) {
    console.error("Error fetching assessment types:", error);
    throw error;
  }
}

  /** Create or update max score for an assessment type */
static async updateAssessmentTypesBatch(configs: { assessmentType: number; maxScore: number }[]): Promise<void> {
  const { selectedAccount } = getInitialAuthData();
  if (!selectedAccount) throw new Error("No account selected");

  try {
    const api = createApiClient({ selectedAccount });
    await api.post("/v1/accounts/assessment-type", { configs });
  } catch (error) {
    console.error("Error updating assessment types batch:", error);
    throw error;
  }
}

    /**
      * Fetch complete school information for the general settings page
      */
    static async getSchoolInfo(schoolId?: string): Promise<SchoolInfoResponse | null> {
        const { selectedAccount } = getInitialAuthData();

        if (!selectedAccount) {
            console.error('No account selected');
            return null;
        }

        try {
            const api = createApiClient({ selectedAccount });
            const response = await api.get<{ school: SchoolInfoResponse; message: string; status: number }>(
                `/v1/accounts/school-info`
            );
            console.log('School Info API Response:', response);
            return response.school || null;
        } catch (error) {
            console.error('Error fetching school info:', error);
            throw error;
        }
    }


    /**
 * Update school information
 * Endpoint: PUT /v1/school/{schoolId}/update
 */
    static async updateSchoolInfo(updateData: {
        schoolId: string;
        schoolName?: string;
        schoolEmail?: string;
        principalName?: string | null;
        yearofEstablishment?: number | null;
        currentTerm?: number | null;
        currentSessions?: number | null;
        schoolCategory?: number | null;
        schoolType?: number | null;
        schoolMotto?: string | null;
        contactPersonEmail?: string | null;
        contactPersonPhoneId?: string | null;
        logoAssetId?: string | null;
        schoolAddress?: {
            addressId?: string | null;
            addressLine1: string;
            addressLine2?: string | null;
            city?: string | null;
            state: string;
            zipCode?: string | null;
            country: string;
        } | null;
    }): Promise<{ message: string; schoolId: string }> {
        const { selectedAccount } = getInitialAuthData();

        if (!selectedAccount) {
            throw new Error('No account selected');
        }

        try {
            const api = createApiClient({ selectedAccount });

            // Build the request payload (without schoolId since it's in the URL)
            const payload: any = {};

            // Only include fields that are provided (not undefined)
            if (updateData.schoolName !== undefined) payload.schoolName = updateData.schoolName;
            if (updateData.schoolEmail !== undefined) payload.schoolEmail = updateData.schoolEmail;
            if (updateData.principalName !== undefined) payload.principalName = updateData.principalName;
            if (updateData.yearofEstablishment !== undefined) payload.yearofEstablishment = updateData.yearofEstablishment;
            if (updateData.currentTerm !== undefined) payload.currentTerm = updateData.currentTerm;
            if (updateData.currentSessions !== undefined) payload.currentSessions = updateData.currentSessions;
            if (updateData.schoolCategory !== undefined) payload.schoolCategory = updateData.schoolCategory;
            if (updateData.schoolType !== undefined) payload.schoolType = updateData.schoolType;
            if (updateData.schoolMotto !== undefined) payload.schoolMotto = updateData.schoolMotto;
            if (updateData.contactPersonEmail !== undefined) payload.contactPersonEmail = updateData.contactPersonEmail;
            if (updateData.contactPersonPhoneId !== undefined) payload.contactPersonPhoneId = updateData.contactPersonPhoneId;
            if (updateData.logoAssetId !== undefined) payload.logoAssetId = updateData.logoAssetId;

            // Handle address separately
            if (updateData.schoolAddress !== undefined && updateData.schoolAddress !== null) {
                payload.schoolAddress = {
                    addressId: updateData.schoolAddress.addressId || null,
                    addressLine1: updateData.schoolAddress.addressLine1,
                    addressLine2: updateData.schoolAddress.addressLine2 || null,
                    city: updateData.schoolAddress.city || null,
                    state: updateData.schoolAddress.state,
                    zipCode: updateData.schoolAddress.zipCode || null,
                    country: updateData.schoolAddress.country,
                };
            } else if (updateData.schoolAddress === null) {
                payload.schoolAddress = null;
            }

            // schoolId is passed as a URL path parameter, not in the body
            const url = `/v1/accounts/${updateData.schoolId}/update`;

            console.log('Update School - URL:', url);
            console.log('Update School - Payload:', payload);

            const response = await api.put<{ message: string; schoolId: string; status: number }>(
                url,
                payload
            );

            console.log('Update School - Response:', response);
            return {
                message: response.message || 'School information updated successfully',
                schoolId: response.schoolId || updateData.schoolId
            };
        } catch (error: any) {
            console.error('Error updating school info:', error);
            console.error('Error response:', error.response?.data);
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