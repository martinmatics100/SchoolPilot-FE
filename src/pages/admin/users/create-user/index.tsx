import React, { useEffect, useState } from "react";
import DynamicForm from "../../../../components/my-form";
import { type FormField } from "../../../../components/my-form";
import { useEnums } from "../../../../hooks/useEnums";
import { useAuth } from "../../../../context";
import { NavigationButton } from "../../../../components/navigation-button";
import MessageDisplay from "../../../../components/message-display";
import { fetchBranches, createStaff } from "../../../../api/userService";
import { type Branch, type Subject } from "../../../../types/interfaces/i-user";
import { useAssetUpload } from "../../../../hooks/useAsset";
import { Box, CircularProgress } from "@mui/material";

const CreateStaff = () => {
    const { enums, isLoading } = useEnums({ fetchPermissionData: false });
    const { apiClient, selectedAccount } = useAuth();

    const {
        upload,
        isUploading: isPhotoUploading,
        uploadProgress,
        error: uploadError,
        clearError: clearUploadError,
    } = useAssetUpload(selectedAccount);

    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [subjects, setSubjects] = useState<Subject[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [isLoadingSubjects, setIsLoadingSubjects] = useState(true);
    const [isLoadingBranches, setIsLoadingBranches] = useState(true);
    const [selectedDesignation, setSelectedDesignation] = useState<string | null>(null);
    const [alertMessage, setAlertMessage] = useState<{
        feMessage?: string;
        beMessage?: string;
        httpStatus?: number;
    }>({});
    const [submittedData, setSubmittedData] = useState<{
        firstName: string;
        lastName: string;
    } | null>(null);

    const [uploadedPhotoAssetId, setUploadedPhotoAssetId] = useState<string | null>(null);
    const [selectedPhotoFile, setSelectedPhotoFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const loadBranches = async () => {
            if (selectedAccount) {
                setIsLoadingBranches(true);
                try {
                    const fetchedBranches = await fetchBranches(selectedAccount, apiClient);
                    setBranches(fetchedBranches);
                } catch (err) {
                    console.error("Failed to fetch branches:", err);
                    setAlertMessage({
                        feMessage: "Failed to load branches. Please try again later.",
                        httpStatus: 500,
                    });
                } finally {
                    setIsLoadingBranches(false);
                }
            }
        };
        loadBranches();
    }, [apiClient, selectedAccount]);

    const handlePhotoSelect = async (file: File) => {
        setSelectedPhotoFile(file);
        setUploadedPhotoAssetId(null);
        clearUploadError();

        if (file) {
            setAlertMessage({ feMessage: "Uploading profile picture..." });
            const result = await upload(file);

            if (result) {
                setUploadedPhotoAssetId(result.fileId);
                setAlertMessage({ feMessage: "Profile picture uploaded successfully!" });
                setTimeout(() => setAlertMessage({}), 3000);
            } else {
                setAlertMessage({
                    feMessage: "Failed to upload profile picture",
                    httpStatus: 500,
                });
            }
        }
    };

    const handleSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);
            setAlertMessage({ feMessage: "Submitting staff data..." });

            if (selectedPhotoFile && !uploadedPhotoAssetId) {
                setAlertMessage({
                    feMessage: "Please wait for photo upload to complete...",
                });
                setIsSubmitting(false);
                return;
            }

            setSubmittedData({
                firstName: data.firstName,
                lastName: data.lastName,
            });

            data.gender = parseInt(data.gender);
            data.role = parseInt(data.role);

            let phoneData = null;
            if (data.phone && typeof data.phone === "object") {
                phoneData = {
                    Number: data.phone.number,
                    Extension: data.phone.extension || "",
                    PhoneType: parseInt(data.phone.phoneType),
                    Country: data.phone.country || "",
                };
            }

            let addressData = null;
            if (data.address1 && typeof data.address1 === "object") {
                addressData = {
                    AddressLine1: data.address1.addressLine1,
                    AddressLine2: data.address1.addressLine2 || null,
                    City: data.address1.city || null,
                    Lga: data.address1.lga || null,
                    State: data.address1.state,
                    Country: data.address1.country,
                };
            }

            let userLocations: any[] = [];
            if (data.userLocations && Array.isArray(data.userLocations)) {
                userLocations = data.userLocations.map((location: any) => ({
                    Id: location.id,
                    Name: location.name,
                    IsPrimaryLocation: location.isPrimaryLocation,
                }));
            } else if (data.locationId) {
                const selectedBranch = branches.find((b) => b.id === data.locationId);
                userLocations = [
                    {
                        Id: data.locationId,
                        Name: selectedBranch?.name || "",
                        IsPrimaryLocation: true,
                    },
                ];
            }

            const payload = {
                Staff: {
                    FirstName: data.firstName,
                    LastName: data.lastName,
                    Email: data.email,
                    Gender: data.gender,
                    Role: data.role,
                    Address: addressData,
                    Phone: phoneData,
                    Notes: data.notes || "",
                    ProfilePictureId: uploadedPhotoAssetId || null,
                    UserLocations: userLocations,
                },
            };

            // 👇 New contract: { status, ok, data }
            const { status, ok, data: body } = await createStaff(apiClient, payload);

            const beMessage: string | undefined =
                typeof body?.message === "string" && body.message.trim()
                    ? body.message.trim()
                    : undefined;

            if (ok) {
                setAlertMessage({
                    feMessage: `User ${data.lastName}, ${data.firstName} has been created successfully!`,
                    beMessage,
                    httpStatus: status,
                });

                setTimeout(() => {
                    setSelectedPhotoFile(null);
                    setUploadedPhotoAssetId(null);
                }, 2000);
            } else {
                setAlertMessage({
                    feMessage: "Failed to create staff. Please try again.",
                    beMessage,
                    httpStatus: status,
                });
            }
        } catch (error: any) {
            console.error("Error submitting form:", error);
            setAlertMessage({
                feMessage: "Failed to create staff. Please try again.",
                beMessage: error?.message,
                httpStatus: 500,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const shouldHideSubjectsTaught = (designation: string | null) => {
        if (!designation || !enums?.UserRole) return false;
        const selectedDesignationObj = enums.UserRole.find(
            (d) => d.value.toString() === designation
        );
        return (
            selectedDesignationObj?.name === "Non-Academic Staff" ||
            selectedDesignationObj?.name === "Accountant" ||
            selectedDesignationObj?.name === "Parent" ||
            selectedDesignationObj?.name === "Student"
        );
    };

    const shouldHideSomeInputs = (designation: string | null) => {
        if (!designation || !enums?.UserRole) return false;
        const selectedDesignationObj = enums.UserRole.find(
            (d) => d.value.toString() === designation
        );
        return selectedDesignationObj?.name === "Parent";
    };

    useEffect(() => {
        if (!isLoading && !isLoadingBranches && enums) {
            const fields: FormField[] = [
                {
                    name: "firstName",
                    label: "First Name",
                    type: "text",
                    required: true,
                    placeholder: "Enter User First Name",
                    colSpan: 1,
                },
                {
                    name: "lastName",
                    label: "Last Name",
                    type: "text",
                    required: true,
                    placeholder: "Enter User Last Name",
                    colSpan: 1,
                },
                {
                    name: "email",
                    label: "Email Address",
                    type: "email",
                    placeholder: "Enter User Valid Email Address",
                    required: true,
                    infoText: "This will be used to send notifications and informations",
                    colSpan: 1,
                },
                {
                    name: "gender",
                    label: "Gender",
                    type: "select",
                    required: true,
                    placeholder: "Select Gender",
                    colSpan: 1,
                    options:
                        enums.Gender?.map((g) => ({
                            value: g.value.toString(),
                            label: g.displayName || g.name,
                        })) || [],
                },
                {
                    name: "role",
                    label: "Role",
                    type: "select",
                    required: true,
                    placeholder: "Select User Role",
                    colSpan: 1,
                    options:
                        enums.UserRole?.map((d) => ({
                            value: d.value.toString(),
                            label: d.displayName || d.name,
                        })) || [],
                    onChange: (value: string) => setSelectedDesignation(value),
                },
                {
                    name: "locationId",
                    label: "Choose Branch",
                    infoText: "This is to assign the User to the associated school location",
                    type: "select",
                    required: true,
                    placeholder: "Select School Location",
                    colSpan: 1,
                    options: branches.map((b) => ({
                        value: b.id,
                        label: b.name,
                    })),
                },
                {
                    name: "address1",
                    label: "Home Address",
                    type: "address",
                    required: true,
                    colSpan: 3,
                },
                {
                    name: "phone",
                    label: "Contact Phone",
                    type: "phone",
                    required: true,
                    colSpan: 3,
                    errorMessage: "Please provide a valid phone number",
                    extraProps: {
                        enums: {
                            PhoneType: enums.PhoneType,
                            Country: enums.Country,
                        },
                    },
                },
                {
                    name: "profilePicture",
                    label: "Profile Picture",
                    type: "image",
                    multiple: false,
                    required: false,
                    colSpan: 2,
                    onChange: (fileData: any) => {
                        if (fileData && fileData.file) {
                            handlePhotoSelect(fileData.file);
                        } else {
                            setSelectedPhotoFile(null);
                            setUploadedPhotoAssetId(null);
                        }
                    },
                    infoText: isPhotoUploading
                        ? `Uploading... ${uploadProgress}%`
                        : uploadedPhotoAssetId
                            ? "✓ Photo uploaded successfully"
                            : "Upload a profile picture (max 5MB, JPG/PNG)",
                },
            ];

            setFormFields(fields);
        }
    }, [
        enums,
        isLoading,
        isLoadingBranches,
        selectedDesignation,
        subjects,
        branches,
        isPhotoUploading,
        uploadProgress,
        uploadedPhotoAssetId,
    ]);

    if (isLoading || isLoadingBranches || formFields.length === 0) {
        return <div>Loading form...</div>;
    }

    const isSubmitDisabled =
        isPhotoUploading ||
        isSubmitting ||
        (selectedPhotoFile !== null && !uploadedPhotoAssetId);

    return (
        <div>
            <MessageDisplay
                feMessage={alertMessage.feMessage}
                beMessage={alertMessage.beMessage}
                httpStatus={alertMessage.httpStatus}
            />

            {uploadError && (
                <MessageDisplay
                    feMessage="Upload Error"
                    beMessage={uploadError}
                    httpStatus={500}
                />
            )}

            <NavigationButton
                to="/app/users"
                sx={{ alignContent: "flex-end" }}
                variant="outlined"
            >
                Go to User List
            </NavigationButton>

            {isPhotoUploading && (
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 2,
                        p: 2,
                        bgcolor: "background.paper",
                        borderRadius: 1,
                    }}
                >
                    <CircularProgress size={24} />
                    <span>Uploading profile picture... {uploadProgress}%</span>
                </Box>
            )}

            {uploadedPhotoAssetId && !isPhotoUploading && (
                <Box
                    sx={{
                        mb: 2,
                        p: 2,
                        bgcolor: "success.light",
                        color: "success.contrastText",
                        borderRadius: 1,
                    }}
                >
                    ✓ Profile picture uploaded successfully!
                </Box>
            )}

            <DynamicForm
                title="User Form"
                fields={formFields}
                onSubmit={handleSubmit}
                submitButtonText={
                    isPhotoUploading
                        ? "Uploading Photo..."
                        : isSubmitting
                            ? "Creating User..."
                            : "Submit"
                }
                submitDisabled={isSubmitDisabled}
                columns={3}
            />
        </div>
    );
};

export default CreateStaff;