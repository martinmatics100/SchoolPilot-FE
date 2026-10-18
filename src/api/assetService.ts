import { createApiClient } from "../utils/apiClient";
import { API_BASE_URL } from "../constants/apiConstants";

export interface UploadAssetResponse {
    fileId: string;
    url: string;
    fileName: string;
    contentType: string;
}

export interface AssetMetadata {
    fileId: string;
    url: string;
    fileName: string;
    fileSize: number;
    contentType: string;
    createdAt: string;
}


export const uploadAsset = async (
    selectedAccount: string | null,
    file: File | Blob,
    onProgress?: (progress: number) => void
): Promise<UploadAssetResponse> => {
    if (!selectedAccount) {
        throw new Error("No account selected");
    }
    const api = createApiClient({ selectedAccount });
    const formData = new FormData();

    if (file instanceof File) {
        formData.append("file", file, file.name);
    } else {
        formData.append("file", file, "upload.jpg");
    }

    const response = await api.upload<UploadAssetResponse>("/v1/assets/upload", formData, onProgress);
    return response;
};


export const getAsset = async (
    selectedAccount: string | null,
    fileId: string
): Promise<{ blob: Blob; fileName: string; contentType: string }> => {
    if (!selectedAccount) {
        throw new Error("No account selected");
    }

    const api = createApiClient({ selectedAccount });

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