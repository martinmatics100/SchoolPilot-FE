import { createApiClient } from "../utils/apiClient";
import { API_BASE_URL } from "../constants/apiConstants";

export interface UploadAssetResponse {
    fileId: string;      // GUID of the uploaded asset
    url: string;         // Public URL to access the file
    fileName: string;    // Original file name
    contentType: string; // MIME type
}

export interface AssetMetadata {
    fileId: string;
    url: string;
    fileName: string;
    fileSize: number;
    contentType: string;
    createdAt: string;
}

/**
 * Upload a file using the API client with same headers as other calls
 * @param selectedAccount - Current account ID
 * @param file - The file to upload (File or Blob)
 * @param onProgress - Optional progress callback (0-100)
 * @returns Promise with upload result containing fileId and URL
 */
export const uploadAsset = async (
    selectedAccount: string | null,
    file: File | Blob,
    onProgress?: (progress: number) => void
): Promise<UploadAssetResponse> => {
    if (!selectedAccount) {
        throw new Error("No account selected");
    }

    // Create API client with the same headers as other calls
    const api = createApiClient({ selectedAccount });

    // Create FormData for file upload
    const formData = new FormData();

    // Handle both File and Blob
    if (file instanceof File) {
        formData.append("file", file, file.name);
    } else {
        // For Blob, we need to generate a filename
        formData.append("file", file, "upload.jpg");
    }

    // Use the upload method from API client
    // This will automatically include:
    // - X-Account-Id header
    // - X-Time-Zone header  
    // - Authorization Bearer token
    // - Handle token refresh
    const response = await api.upload<UploadAssetResponse>("/v1/assets/upload", formData, onProgress);
    return response;
};

/**
 * Get asset by fileId (download the file)
 * @param selectedAccount - Current account ID
 * @param fileId - GUID of the asset
 * @returns Promise with the file blob and metadata
 */
export const getAsset = async (
    selectedAccount: string | null,
    fileId: string
): Promise<{ blob: Blob; fileName: string; contentType: string }> => {
    if (!selectedAccount) {
        throw new Error("No account selected");
    }

    const api = createApiClient({ selectedAccount });

    // Use fetch for blob responses (since your API client doesn't support blob yet)
    // But we still need the token and headers
    const token = localStorage.getItem("access_token");
    const timeZone = localStorage.getItem("time_zone") || "UTC";
    const url = `${API_BASE_URL}/v1/assets/${fileId}`;

    const response = await fetch(url, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`,
            "X-Account-Id": selectedAccount,
            "X-Time-Zone": timeZone,
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to download file: ${response.status}`);
    }

    const blob = await response.blob();

    // Extract filename from Content-Disposition header if available
    let fileName = "download";
    const contentDisposition = response.headers.get("content-disposition");
    if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
        if (fileNameMatch && fileNameMatch[1]) {
            fileName = fileNameMatch[1].replace(/['"]/g, '');
        }
    }

    const contentType = response.headers.get("content-type") || "application/octet-stream";

    return {
        blob,
        fileName,
        contentType,
    };
};

/**
 * Get the public URL for an asset (for direct display in img tags)
 * @param selectedAccount - Current account ID
 * @param fileId - GUID of the asset
 * @returns Promise with the public URL
 */
export const getAssetUrl = async (
    selectedAccount: string | null,
    fileId: string
): Promise<string> => {
    if (!selectedAccount) {
        throw new Error("No account selected");
    }

    const api = createApiClient({ selectedAccount });
    const response = await api.get(`/v1/assets/${fileId}/url`);
    return response.url;
};

/**
 * Delete an asset from storage
 * @param selectedAccount - Current account ID
 * @param fileId - GUID of the asset to delete
 * @returns Promise indicating success
 */
export const deleteAsset = async (
    selectedAccount: string | null,
    fileId: string
): Promise<boolean> => {
    if (!selectedAccount) {
        throw new Error("No account selected");
    }

    const api = createApiClient({ selectedAccount });
    await api.delete(`/v1/assets/${fileId}`);
    return true;
};

/**
 * Get asset metadata (without downloading the file)
 * @param selectedAccount - Current account ID
 * @param fileId - GUID of the asset
 * @returns Promise with asset metadata
 */
export const getAssetMetadata = async (
    selectedAccount: string | null,
    fileId: string
): Promise<AssetMetadata> => {
    if (!selectedAccount) {
        throw new Error("No account selected");
    }

    const api = createApiClient({ selectedAccount });
    const response = await api.get(`/v1/assets/${fileId}/metadata`);
    return response;
};