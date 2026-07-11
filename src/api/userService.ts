import { createApiClient } from '../utils/apiClient';

const BASE_URL = '/v1/users';

export const fetchUsers = async (
    selectedAccount: string | null,
    page: number,
    pageLength: number,
    role?: string
) => {
    if (!selectedAccount) {
        throw new Error('No account selected');
    }

    const api = createApiClient({ selectedAccount });
    const params = new URLSearchParams();
    params.append('page', page.toString());
    params.append('pageLength', pageLength.toString());

    if (role) {
        params.append('role', role);
    }

    const url = `${BASE_URL}?${params.toString()}`;
    const response = await api.get(url);
    return {
        items: response.items || [],
        itemCount: response.itemCount || 0
    };
};


// export const fetchTeachers = async (selectedAccount: string | null, enums: any) => {
//     if (!selectedAccount) {
//         throw new Error('No account selected');
//     }

//     if (!enums) {
//         throw new Error('Enums not loaded');
//     }

//     const api = createApiClient({ selectedAccount });

//     const teacherRole = enums?.UserRole?.find((role: any) =>
//         role.name.toLowerCase() === 'teacher' ||
//         role.displayName?.toLowerCase() === 'teacher'
//     )?.value;

//     if (!teacherRole) {
//         throw new Error('Teacher role not found in enums');
//     }

//     const queryParams = new URLSearchParams({
//         role: teacherRole.toString(),
//         page: '1',
//         pageLength: '1000',
//         excludeAssignedTeachers: 'true'
//     });

//     const response = await api.get(`${BASE_URL}?${queryParams}`);
//     return response.items?.map((item: any) => ({
//         id: item.id,
//         firstName: item.firstName || '',
//         lastName: item.lastName || '',
//         email: item.email || ''
//     })) || [];
// };

export const deleteUsers = async (ids: string[]) => {
    const response = await fetch(`${BASE_URL}/delete`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ids }),
    });

    if (!response.ok) {
        throw new Error('Failed to delete users');
    }

    return response.json();
};

export const fetchSubjects = async () => {
    const api = createApiClient();
    const subjectsData = await api.get(`${BASE_URL}/subjects`);
    return subjectsData;
};

export const fetchBranches = async (selectedAccount: string | null, apiClient: any) => {
    if (!selectedAccount) {
        throw new Error('No account selected');
    }

    const response = await apiClient.getDefaultSchools(selectedAccount);
    const fetchedBranches = response.regularSchools.flatMap((school: any) =>
        school.locations.map((location: any) => ({
            id: location.id,
            name: location.name
        }))
    );
    return fetchedBranches;
};

export const createStaff = async (apiClient: any, payload: any) => {
    const response = await apiClient.post(`${BASE_URL}/create-invite`, payload);
    return response;
};

export const logoutUser = async (apiClient: any) => {
  if (!apiClient) throw new Error('API client is required for logout');
  const response = await apiClient.post(`${BASE_URL}/logout`);
  if (!response) {
    throw new Error('Failed to logout');
  }
  return response;
};

// Add to your existing userService.ts file

export const getUserProfile = async (
    selectedAccount: string | null,
    userId?: string
) => {
    if (!selectedAccount) {
        throw new Error('No account selected');
    }

    if (!userId) {
        throw new Error('User ID is required');
    }

    const api = createApiClient({ selectedAccount });
    const response = await api.get(`${BASE_URL}/${userId}`);

    return {
        id: response.id,
        firstName: response.firstName || '',
        lastName: response.lastName || '',
        email: response.email || '',
        phoneNumber: response.phoneNumber ? {
            number: response.phoneNumber.number,
            extension: response.phoneNumber.extension,
            country: response.phoneNumber.country
        } : null,
        address: response.address ? {
            addressLine1: response.address.addressLine1,
            addressLine2: response.address.addressLine2,
            city: response.address.city,
            state: response.address.state,
            zipCode: response.address.zipCode,
            country: response.address.country
        } : null,
        photoUrl: response.photoUrl || null,
        role: response.role || '',
        status: response.status || '',
        dateOfBirth: response.dateOfBirth || null,
        dateOfHire: response.dateOfHire || null,
        schoolName: response.schoolName || '',
        schoolId: response.schoolId || null,
        gender: response.gender || null,
        createdAt: response.createdAt || null,
        modifiedAt: response.modifiedAt || null,
        isDeprecated: response.isDeprecated || false
    };
};

// Optional: Get current logged-in user's profile
export const getCurrentUserProfile = async (selectedAccount: string | null) => {
    if (!selectedAccount) {
        throw new Error('No account selected');
    }

    const api = createApiClient({ selectedAccount });
    const response = await api.get(`${BASE_URL}/me`);

    return {
        id: response.id,
        firstName: response.firstName || '',
        lastName: response.lastName || '',
        email: response.email || '',
        phoneNumber: response.phoneNumber ? {
            number: response.phoneNumber.number,
            extension: response.phoneNumber.extension,
            country: response.phoneNumber.country
        } : null,
        address: response.address ? {
            addressLine1: response.address.addressLine1,
            addressLine2: response.address.addressLine2,
            city: response.address.city,
            state: response.address.state,
            zipCode: response.address.zipCode,
            country: response.address.country
        } : null,
        photoUrl: response.photoUrl || null,
        role: response.role || '',
        status: response.status || '',
        dateOfBirth: response.dateOfBirth || null,
        dateOfHire: response.dateOfHire || null,
        schoolName: response.schoolName || '',
        schoolId: response.schoolId || null,
        gender: response.gender || null,
        createdAt: response.createdAt || null,
        modifiedAt: response.modifiedAt || null,
        permissions: response.permissions || [],
        roles: response.roles || []
    };
};

// Update user profile
export const updateUserProfile = async (
    selectedAccount: string | null,
    userId: string,
    payload: {
        firstName?: string;
        lastName?: string;
        email?: string;
        phoneNumber?: {
            number: string;
            extension?: string;
            country: string;
        };
        address?: {
            addressLine1: string;
            addressLine2?: string;
            city?: string;
            state: string;
            zipCode?: string;
            country: string;
        };
        dateOfBirth?: string;
        gender?: string;
        photoAssetId?: string | null;
    }
) => {
    if (!selectedAccount) {
        throw new Error('No account selected');
    }

    const api = createApiClient({ selectedAccount });
    const response = await api.put(`${BASE_URL}/${userId}`, payload);
    return response;
};

// // Upload profile picture
// export const uploadProfilePicture = async (
//     selectedAccount: string | null,
//     file: File
// ) => {
//     if (!selectedAccount) {
//         throw new Error('No account selected');
//     }

//     const formData = new FormData();
//     formData.append('file', file);

//     const api = createApiClient({ selectedAccount });
//     const response = await api.post(`${BASE_URL}/upload-photo`, formData, {
//         headers: {
//             'Content-Type': 'multipart/form-data',
//         },
//     });

//     return {
//         fileId: response.fileId,
//         photoUrl: response.photoUrl
//     };
// };

// Remove profile picture
export const removeProfilePicture = async (
    selectedAccount: string | null,
    userId: string
) => {
    if (!selectedAccount) {
        throw new Error('No account selected');
    }

    const api = createApiClient({ selectedAccount });
    const response = await api.delete(`${BASE_URL}/${userId}/photo`);
    return response;
};

// Change password
export const changePassword = async (
    selectedAccount: string | null,
    payload: {
        currentPassword: string;
        newPassword: string;
        confirmPassword: string;
    }
) => {
    if (!selectedAccount) {
        throw new Error('No account selected');
    }

    const api = createApiClient({ selectedAccount });
    const response = await api.post(`${BASE_URL}/change-password`, payload);
    return response;
};