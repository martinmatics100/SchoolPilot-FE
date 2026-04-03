import { useState, useCallback } from "react";
import { uploadAsset, getAsset, deleteAsset, getAssetUrl, type UploadAssetResponse } from "../api/assetService";

interface UseAssetReturn {
    // State
    uploadProgress: number;
    isUploading: boolean;
    isDownloading: boolean;
    isDeleting: boolean;
    error: string | null;
    uploadedAsset: UploadAssetResponse | null;

    // Actions
    uploadFile: (file: File, onSuccess?: (asset: UploadAssetResponse) => void) => Promise<void>;
    downloadFile: (fileId: string, onSuccess?: (blob: Blob, fileName: string) => void) => Promise<void>;
    deleteFile: (fileId: string, onSuccess?: () => void) => Promise<void>;
    getFileUrl: (fileId: string) => Promise<string>;
    clearError: () => void;
    reset: () => void;
}

/**
 * Custom hook for asset operations (upload, download, delete)
 * Use this anywhere in your app for file handling
 */
export const useAsset = (selectedAccount: string | null): UseAssetReturn => {
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [uploadedAsset, setUploadedAsset] = useState<UploadAssetResponse | null>(null);

    const clearError = useCallback(() => setError(null), []);
    const reset = useCallback(() => {
        setUploadProgress(0);
        setIsUploading(false);
        setIsDownloading(false);
        setIsDeleting(false);
        setError(null);
        setUploadedAsset(null);
    }, []);

    const uploadFile = useCallback(async (
        file: File,
        onSuccess?: (asset: UploadAssetResponse) => void
    ) => {
        if (!selectedAccount) {
            setError("No account selected");
            return;
        }

        try {
            setIsUploading(true);
            setUploadProgress(0);
            setError(null);

            const result = await uploadAsset(selectedAccount, file, (progress) => {
                setUploadProgress(progress);
            });

            setUploadedAsset(result);
            onSuccess?.(result);
        } catch (err: any) {
            const errorMessage = err.message || "Upload failed";
            setError(errorMessage);
            throw err;
        } finally {
            setIsUploading(false);
        }
    }, [selectedAccount]);

    const downloadFile = useCallback(async (
        fileId: string,
        onSuccess?: (blob: Blob, fileName: string) => void
    ) => {
        if (!selectedAccount) {
            setError("No account selected");
            return;
        }

        try {
            setIsDownloading(true);
            setError(null);

            const { blob, fileName } = await getAsset(selectedAccount, fileId);

            // Create download link
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            onSuccess?.(blob, fileName);
        } catch (err: any) {
            const errorMessage = err.message || "Download failed";
            setError(errorMessage);
            throw err;
        } finally {
            setIsDownloading(false);
        }
    }, [selectedAccount]);

    const deleteFile = useCallback(async (
        fileId: string,
        onSuccess?: () => void
    ) => {
        if (!selectedAccount) {
            setError("No account selected");
            return;
        }

        try {
            setIsDeleting(true);
            setError(null);

            await deleteAsset(selectedAccount, fileId);
            onSuccess?.();
        } catch (err: any) {
            const errorMessage = err.message || "Delete failed";
            setError(errorMessage);
            throw err;
        } finally {
            setIsDeleting(false);
        }
    }, [selectedAccount]);

    const getFileUrl = useCallback(async (fileId: string): Promise<string> => {
        if (!selectedAccount) {
            throw new Error("No account selected");
        }

        try {
            return await getAssetUrl(selectedAccount, fileId);
        } catch (err: any) {
            const errorMessage = err.message || "Failed to get URL";
            setError(errorMessage);
            throw err;
        }
    }, [selectedAccount]);

    return {
        uploadProgress,
        isUploading,
        isDownloading,
        isDeleting,
        error,
        uploadedAsset,
        uploadFile,
        downloadFile,
        deleteFile,
        getFileUrl,
        clearError,
        reset,
    };
};

/**
 * Simplified hook for just uploading files (most common use case)
 */
export const useAssetUpload = (selectedAccount: string | null) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [error, setError] = useState<string | null>(null);

    const upload = useCallback(async (file: File): Promise<UploadAssetResponse | null> => {
        if (!selectedAccount) {
            setError("No account selected");
            return null;
        }

        try {
            setIsUploading(true);
            setUploadProgress(0);
            setError(null);

            const result = await uploadAsset(selectedAccount, file, (progress) => {
                setUploadProgress(progress);
            });

            return result;
        } catch (err: any) {
            const errorMessage = err.message || "Upload failed";
            setError(errorMessage);
            return null;
        } finally {
            setIsUploading(false);
        }
    }, [selectedAccount]);

    return {
        upload,
        isUploading,
        uploadProgress,
        error,
        clearError: () => setError(null),
    };
};