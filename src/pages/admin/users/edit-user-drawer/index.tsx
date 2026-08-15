import React, { useEffect, useState, useRef } from "react";
import {
    Drawer,
    IconButton,
    Typography,
    Box,
    CircularProgress,
    Avatar,
    Paper,
    Divider,
    alpha,
    Fade,
    Grow,
} from "@mui/material";
import { useTheme } from "@mui/material";
import IconifyIcon from "../../../../components/base/iconifyIcon";
import DynamicForm, { type FormField } from "../../../../components/my-form";
import { useEnums } from "../../../../hooks/useEnums";
import { useAuth } from "../../../../context";
import MessageDisplay from "../../../../components/message-display";
import { getUserProfile, updateUserProfile } from "../../../../api/userService";
import { useAssetUpload } from "../../../../hooks/useAsset";

// =========================================================================
// Types & Interfaces
// =========================================================================

interface AddressData {
    addressLine1: string;
    addressLine2?: string | null;
    city?: string | null;
    state: string;
    zipCode?: string | null;
    country: string;
}

interface PhoneNumberData {
    number: string;
    phoneType?: number;
    extension?: string | null;
    country?: string | null;
}

interface UserDetail {
    id: string;
    schoolId: string;
    schoolName: string;
    firstName: string;
    lastName: string;
    email: string;
    gender: number;
    status: number;
    role: number;
    dateOfBirth: string | null;
    address?: AddressData | null;
    phoneNumber?: PhoneNumberData | null;
    photoUrl?: string | null;
}

interface UpdateUserPayload {
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

interface EditUserDrawerProps {
    open: boolean;
    onClose: () => void;
    userId: string | null;
    onSuccess: () => void;
}

// =========================================================================
// Main Component
// =========================================================================

const EditUserDrawer = ({
    open,
    onClose,
    userId,
    onSuccess,
}: EditUserDrawerProps) => {
    const theme = useTheme();
    const { enums, isLoading: isEnumsLoading } = useEnums({
        fetchPermissionData: false,
    });
    const { selectedAccount } = useAuth();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Ref to track if user data has been loaded to prevent infinite loops
    const hasLoadedUserRef = useRef(false);
    const currentUserIdRef = useRef<string | null>(null);

    // =========================================================================
    // Hooks & State
    // =========================================================================

    // Asset upload hook
    const {
        upload,
        isUploading: isPhotoUploading,
        uploadProgress,
        error: uploadError,
        clearError: clearUploadError
    } = useAssetUpload(selectedAccount);

    // Form state
    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [userData, setUserData] = useState<any>(null);
    const [userPhotoUrl, setUserPhotoUrl] = useState<string | null>(null);

    // Loading states
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Photo management
    const [uploadedPhotoAssetId, setUploadedPhotoAssetId] = useState<string | null>(null);
    const [hasPhotoChanged, setHasPhotoChanged] = useState(false);

    // UI states
    const [alertMessage, setAlertMessage] = useState<{
        feMessage?: string;
        beMessage?: string;
        httpStatus?: number;
    }>({});

    const [dotCount, setDotCount] = useState(0);

    // =========================================================================
    // Effects
    // =========================================================================

    // Animated title dots
    useEffect(() => {
        let interval: ReturnType<typeof setInterval>;

        if (open) {
            interval = setInterval(() => {
                setDotCount((prev) => (prev + 1) % 4);
            }, 1000);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [open]);

    // Reset dot count when closed
    useEffect(() => {
        if (!open) {
            setDotCount(0);
        }
    }, [open]);

    // Reset state when drawer closes - FIXED: Only depend on 'open'
    useEffect(() => {
        if (!open) {
            setUserData(null);
            setUserPhotoUrl(null);
            setAlertMessage({});
            setFormFields([]);
            setUploadedPhotoAssetId(null);
            setHasPhotoChanged(false);
            hasLoadedUserRef.current = false;
            currentUserIdRef.current = null;

            // Call clearUploadError without depending on it
            if (clearUploadError) {
                clearUploadError();
            }
        }
    }, [open]); // ✅ Only depend on 'open'

    // =========================================================================
    // Photo Management
    // =========================================================================

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setAlertMessage({
                feMessage: "Invalid file type. Please upload JPG, PNG, or WEBP images only.",
                httpStatus: 400
            });
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setAlertMessage({
                feMessage: "File too large. Maximum size is 5MB.",
                httpStatus: 400
            });
            return;
        }

        setHasPhotoChanged(true);
        clearUploadError();

        // Show preview immediately
        const previewUrl = URL.createObjectURL(file);
        setUserPhotoUrl(previewUrl);

        setAlertMessage({ feMessage: "Uploading new profile picture..." });

        const result = await upload(file);

        if (result) {
            setUploadedPhotoAssetId(result.fileId);
            const successMessage = "Profile picture uploaded successfully! Click Update User to save changes.";
            setAlertMessage({ feMessage: successMessage });

            // Clear success message after 5 seconds using functional update
            setTimeout(() => {
                setAlertMessage((prev) => {
                    if (prev.feMessage === successMessage) {
                        return {};
                    }
                    return prev;
                });
            }, 5000);
        } else {
            // Revert preview on failure
            setUserPhotoUrl(userData?.photoUrl || null);
            setAlertMessage({ feMessage: "Failed to upload profile picture", httpStatus: 500 });
        }

        // Clear the file input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleRemovePhoto = () => {
        setHasPhotoChanged(true);
        setUploadedPhotoAssetId(null);
        setUserPhotoUrl(null);
        const removalMessage = "Photo will be removed when you update the user";
        setAlertMessage({ feMessage: removalMessage });
        setTimeout(() => {
            setAlertMessage((prev) => {
                if (prev.feMessage === removalMessage) {
                    return {};
                }
                return prev;
            });
        }, 3000);
    };

    const handleAvatarClick = () => {
        if (!isPhotoUploading && !isSubmitting) {
            fileInputRef.current?.click();
        }
    };

    // =========================================================================
    // Data Loading - FIXED: Added ref to prevent infinite loops
    // =========================================================================

    useEffect(() => {
        const loadUserData = async () => {
            // Check if we have all required data and haven't loaded this user yet
            const shouldLoad = open &&
                userId &&
                selectedAccount &&
                !hasLoadedUserRef.current;

            if (!shouldLoad) {
                return;
            }

            // If user ID changed, reset the loaded flag
            if (currentUserIdRef.current !== userId) {
                hasLoadedUserRef.current = false;
                currentUserIdRef.current = userId;
            }

            setLoading(true);
            setAlertMessage({});

            try {
                // Use getUserProfile from userService
                const user = await getUserProfile(selectedAccount, userId);

                // Map enum values to display names
                const genderEnum = enums?.Gender?.find(
                    (g: any) => g.value === user.gender || g.name === user.gender
                );

                const statusEnum = enums?.UserStatus?.find(
                    (s: any) => s.value === user.status || s.name === user.status
                );

                const roleEnum = enums?.UserRole?.find(
                    (r: any) => r.value === user.role || r.name === user.role
                );

                // Format address
                const formattedAddress = user.address ? {
                    addressLine1: user.address.addressLine1 || "",
                    addressLine2: user.address.addressLine2 || "",
                    city: user.address.city || "",
                    state: user.address.state || "",
                    zipCode: user.address.zipCode || "",
                    country: user.address.country || "",
                } : {
                    addressLine1: "",
                    addressLine2: "",
                    city: "",
                    state: "",
                    zipCode: "",
                    country: "",
                };

                // Format phone number
                const formattedPhone = user.phoneNumber ? {
                    number: user.phoneNumber.number || "",
                    phoneType: user.phoneNumber.phoneType || 0,
                    extension: user.phoneNumber.extension || "",
                    country: user.phoneNumber.country || "",
                } : {
                    number: "",
                    phoneType: 0,
                    extension: "",
                    country: "",
                };

                const formattedData = {
                    id: user.id,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    gender: genderEnum?.value?.toString() || '',
                    status: statusEnum?.value?.toString() || '',
                    role: roleEnum?.value?.toString() || '',
                    dateOfBirth: user.dateOfBirth?.split('T')[0] || '',
                    schoolId: user.schoolId || '',
                    address: formattedAddress,
                    phoneNumber: formattedPhone,
                    photoUrl: user.photoUrl,
                };

                setUserData(formattedData);
                setUserPhotoUrl(user.photoUrl || null);

                // Mark as loaded to prevent re-fetching
                hasLoadedUserRef.current = true;
            } catch (error) {
                console.error("Error loading user data:", error);
                setAlertMessage({
                    feMessage: "Failed to load user data.",
                    httpStatus: 500,
                });
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, [open, userId, selectedAccount, enums]); // ✅ Removed dependencies that could cause loops

    // =========================================================================
    // Form Configuration - FIXED: Added proper conditions
    // =========================================================================

    useEffect(() => {
        if (!isEnumsLoading && enums && userData) {
            const fields: FormField[] = [
                {
                    name: "id",
                    label: "User ID",
                    type: "text",
                    required: false,
                    colSpan: 1,
                    hidden: true,
                },
                {
                    name: "firstName",
                    label: "First Name",
                    type: "text",
                    required: true,
                    colSpan: 1,
                },
                {
                    name: "lastName",
                    label: "Last Name",
                    type: "text",
                    required: true,
                    colSpan: 1,
                },
                {
                    name: "email",
                    label: "Email",
                    type: "email",
                    required: true,
                    colSpan: 1,
                },
                {
                    name: "dateOfBirth",
                    label: "Date of Birth",
                    type: "date",
                    required: false,
                    colSpan: 1,
                },
                {
                    name: "gender",
                    label: "Gender",
                    type: "select",
                    required: true,
                    colSpan: 1,
                    options:
                        enums.Gender?.map((g: any) => ({
                            value: g.value.toString(),
                            label: g.displayName || g.name,
                        })) || [],
                },
                {
                    name: "role",
                    label: "Role",
                    type: "select",
                    required: true,
                    colSpan: 1,
                    options:
                        enums.UserRole?.map((r: any) => ({
                            value: r.value.toString(),
                            label: r.displayName || r.name,
                        })) || [],
                    readOnly: true, // Role should not be editable for existing users
                },
                {
                    name: "status",
                    label: "Status",
                    type: "select",
                    required: true,
                    colSpan: 1,
                    options:
                        enums.UserStatus?.map((s: any) => ({
                            value: s.value.toString(),
                            label: s.displayName || s.name,
                        })) || [],
                },
                {
                    name: "address",
                    label: "Address",
                    type: "address",
                    required: false,
                    colSpan: 2,
                },
                {
                    name: "phoneNumber",
                    label: "Phone Number",
                    type: "phone",
                    required: false,
                    colSpan: 2,
                    extraProps: {
                        enums: {
                            PhoneType: enums?.PhoneType || [],
                            Country: enums?.Country || []
                        }
                    }
                },
            ];

            setFormFields(fields);
        }
    }, [enums, isEnumsLoading, userData]);

    // =========================================================================
    // Handlers
    // =========================================================================

    const handleSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);
            setAlertMessage({ feMessage: "Updating user data..." });

            // Build the payload
            const payload: UpdateUserPayload = {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                gender: data.gender,
                dateOfBirth: data.dateOfBirth || undefined,
            };

            // Add address if provided
            if (data.address && data.address.addressLine1) {
                payload.address = {
                    addressLine1: data.address.addressLine1 || "",
                    addressLine2: data.address.addressLine2 || "",
                    city: data.address.city || "",
                    state: data.address.state || "",
                    zipCode: data.address.zipCode || "",
                    country: data.address.country || "",
                };
            }

            // Add phone number if provided
            if (data.phoneNumber && data.phoneNumber.number) {
                payload.phoneNumber = {
                    number: data.phoneNumber.number || "",
                    extension: data.phoneNumber.extension || "",
                    country: data.phoneNumber.country || "",
                };
            }

            // Include PhotoAssetId if a new photo was uploaded
            if (hasPhotoChanged) {
                payload.photoAssetId = uploadedPhotoAssetId || null; // null will remove the photo
            }

            // Use updateUserProfile from userService
            const response = await updateUserProfile(selectedAccount!, userId!, payload);

            if (response) {
                setAlertMessage({
                    feMessage: "User updated successfully!",
                    httpStatus: 200,
                });

                setTimeout(() => {
                    onSuccess();
                    handleClose();
                }, 1500);
            } else {
                throw new Error("Failed to update user");
            }
        } catch (error: any) {
            console.error("Update error:", error);
            setAlertMessage({
                feMessage: "Failed to update user.",
                beMessage: error.message || "An unexpected error occurred",
                httpStatus: error.status || 500,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setAlertMessage({});
        setUserData(null);
        setUserPhotoUrl(null);
        setFormFields([]);
        setUploadedPhotoAssetId(null);
        setHasPhotoChanged(false);
        hasLoadedUserRef.current = false;
        currentUserIdRef.current = null;
        if (clearUploadError) {
            clearUploadError();
        }
        onClose();
    };

    // =========================================================================
    // Helper Functions
    // =========================================================================

    const getInitials = () => {
        if (userData?.firstName && userData?.lastName) {
            return `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`.toUpperCase();
        }
        return "?";
    };

    const getAnimatedTitle = () => {
        const baseText = "Edit User";
        const dots = ".".repeat(dotCount);
        return `${baseText}${dots}`;
    };

    const isReady = !isEnumsLoading &&
        !loading &&
        userData &&
        formFields.length > 0;

    const isSubmitDisabled = isPhotoUploading || isSubmitting;

    // =========================================================================
    // Render
    // =========================================================================

    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={handleClose}
            PaperProps={{
                sx: {
                    width: "100%",
                    "@media (min-width: 1024px)": {
                        width: "50%",
                    },
                    "@media (min-width: 1440px)": {
                        width: "40%",
                    },
                    bgcolor: "background.default",
                    borderRadius: { xs: 0, sm: "16px 0 0 16px" },
                    p: { xs: 2, sm: 3, md: 4 },
                    overflowY: "auto",
                },
            }}
        >
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/jpg,image/webp"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
            />

            <Fade in={open} timeout={300}>
                <Box>
                    {/* ========== Header ========== */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            mb: 3,
                            pb: 2,
                            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                        }}
                    >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                            <Box
                                sx={{
                                    width: 40,
                                    height: 40,
                                    borderRadius: 2,
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                <IconifyIcon
                                    icon="mdi:account-edit"
                                    width={24}
                                    color={theme.palette.primary.main}
                                />
                            </Box>
                            <Box>
                                <Typography
                                    variant="h6"
                                    sx={{
                                        fontWeight: 700,
                                        color: "text.primary",
                                        fontSize: { xs: "1.1rem", sm: "1.25rem" },
                                    }}
                                >
                                    {getAnimatedTitle()}
                                </Typography>
                                <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                    Update user information
                                </Typography>
                            </Box>
                        </Box>
                        <IconButton
                            onClick={handleClose}
                            sx={{
                                color: "text.secondary",
                                "&:hover": {
                                    bgcolor: alpha(theme.palette.error.main, 0.1),
                                    color: theme.palette.error.main,
                                },
                            }}
                        >
                            <IconifyIcon icon="ic:round-close" width={24} height={24} />
                        </IconButton>
                    </Box>

                    {/* ========== Message Display ========== */}
                    {alertMessage.feMessage && (
                        <Box sx={{ mb: 3 }}>
                            <MessageDisplay
                                feMessage={alertMessage.feMessage}
                                beMessage={alertMessage.beMessage}
                                httpStatus={alertMessage.httpStatus}
                            />
                        </Box>
                    )}

                    {/* ========== Upload Error Display ========== */}
                    {uploadError && (
                        <Box sx={{ mb: 3 }}>
                            <MessageDisplay
                                feMessage="Upload Error"
                                beMessage={uploadError}
                                httpStatus={500}
                            />
                        </Box>
                    )}

                    {/* ========== User Avatar - Clickable ========== */}
                    <Grow in={!!userData} timeout={500}>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                mb: 4,
                                mt: 2,
                            }}
                        >
                            <Box
                                sx={{
                                    position: "relative",
                                    cursor: isPhotoUploading || isSubmitting ? "not-allowed" : "pointer",
                                    "&:hover": {
                                        "& .edit-overlay": {
                                            opacity: 1,
                                        },
                                    },
                                }}
                                onClick={handleAvatarClick}
                            >
                                <Paper
                                    elevation={0}
                                    sx={{
                                        borderRadius: "50%",
                                        overflow: "hidden",
                                        border: `3px solid ${theme.palette.primary.main}`,
                                        boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                                        position: "relative",
                                    }}
                                >
                                    <Avatar
                                        src={userPhotoUrl || undefined}
                                        alt={`${userData?.firstName || ''} ${userData?.lastName || ''}`}
                                        sx={{
                                            width: { xs: 100, sm: 120 },
                                            height: { xs: 100, sm: 120 },
                                            fontSize: { xs: "2.5rem", sm: "3rem" },
                                            bgcolor: userPhotoUrl ? "transparent" : theme.palette.primary.main,
                                            color: "white",
                                            fontWeight: 600,
                                            transition: "opacity 0.3s",
                                        }}
                                    >
                                        {!userPhotoUrl && getInitials()}
                                    </Avatar>

                                    {/* Edit overlay */}
                                    <Box
                                        className="edit-overlay"
                                        sx={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            bgcolor: alpha(theme.palette.common.black, 0.6),
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderRadius: "50%",
                                            opacity: 0,
                                            transition: "opacity 0.3s",
                                            flexDirection: "column",
                                            gap: 0.5,
                                        }}
                                    >
                                        <IconifyIcon
                                            icon="mdi:camera"
                                            width={24}
                                            sx={{ color: "white" }}
                                        />
                                        <Typography
                                            variant="caption"
                                            sx={{ color: "white", fontSize: "0.7rem" }}
                                        >
                                            Change Photo
                                        </Typography>
                                    </Box>

                                    {/* Uploading overlay */}
                                    {isPhotoUploading && (
                                        <Box
                                            sx={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                                bgcolor: alpha(theme.palette.common.black, 0.7),
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                borderRadius: "50%",
                                                flexDirection: "column",
                                                gap: 1,
                                            }}
                                        >
                                            <CircularProgress size={40} sx={{ color: "white" }} />
                                            <Typography
                                                variant="caption"
                                                sx={{ color: "white" }}
                                            >
                                                {uploadProgress}%
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>

                                {/* Remove photo button */}
                                {userPhotoUrl && !isPhotoUploading && (
                                    <IconButton
                                        size="small"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleRemovePhoto();
                                        }}
                                        sx={{
                                            position: "absolute",
                                            bottom: 0,
                                            right: 0,
                                            bgcolor: theme.palette.error.main,
                                            color: "white",
                                            "&:hover": {
                                                bgcolor: theme.palette.error.dark,
                                            },
                                            width: 28,
                                            height: 28,
                                            "& .MuiSvgIcon-root": {
                                                fontSize: 16,
                                            },
                                        }}
                                    >
                                        <IconifyIcon icon="mdi:delete" width={16} />
                                    </IconButton>
                                )}
                            </Box>
                        </Box>
                    </Grow>

                    {/* ========== Divider ========== */}
                    <Divider sx={{ mb: 3 }} />

                    {/* ========== Form or Loading ========== */}
                    {!isReady ? (
                        <Box
                            display="flex"
                            justifyContent="center"
                            alignItems="center"
                            minHeight="400px"
                            flexDirection="column"
                            gap={3}
                        >
                            <CircularProgress size={48} sx={{ color: "primary.main" }} />
                            <Typography variant="body2" sx={{ color: "text.secondary" }}>
                                Loading user data...
                            </Typography>
                        </Box>
                    ) : (
                        <Fade in={isReady} timeout={400}>
                            <Box>
                                <DynamicForm
                                    title=""
                                    fields={formFields}
                                    onSubmit={handleSubmit}
                                    submitButtonText={isPhotoUploading ? "Uploading Photo..." : isSubmitting ? "Updating User..." : "Update User"}
                                    columns={2}
                                    initialValues={userData}
                                    submitDisabled={isSubmitDisabled}
                                />
                            </Box>
                        </Fade>
                    )}
                </Box>
            </Fade>
        </Drawer>
    );
};

export default EditUserDrawer;