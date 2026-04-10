import { useEffect, useState, useCallback, useMemo } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import DynamicForm, { type FormField } from "../../../components/my-form";
import MessageDisplay from "../../../components/message-display";
import { useEnums } from "../../../hooks/useEnums";
import { SchoolService } from "../../../api/schoolService";
import { type SchoolInfoResponse } from "../../../types/interfaces/i-school";

const GeneralSettings = () => {
    const { enums, isLoading: isEnumLoading } = useEnums({ fetchPermissionData: false });
    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [initialValues, setInitialValues] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [schoolDataLoaded, setSchoolDataLoaded] = useState(false);
    const [alertMessage, setAlertMessage] = useState<{
        feMessage?: string;
        beMessage?: string;
        httpStatus?: number;
    }>({});

    // Helper function to get enum options
    const getEnumOptions = useCallback((enumArray: any[]) => {
        return enumArray?.map(item => ({
            value: item.value.toString(),
            label: item.displayName || item.name,
        })) || [];
    }, []);

    // Fetch school data
    useEffect(() => {
        const fetchSchoolData = async () => {
            try {
                setLoading(true);
                console.log("Fetching school data...");
                const schoolData = await SchoolService.getSchoolInfo();
                console.log("School data received:", schoolData);

                if (schoolData) {
                    // Map the API response to form initial values
                    const mappedValues = {
                        id: schoolData.id,
                        schoolName: schoolData.schoolName || "",
                        schoolEmail: schoolData.schoolEmail || "",
                        principalName: schoolData.principalName || "",
                        establishedYear: schoolData.yearofEstablishment?.toString() || "",
                        schoolSession: schoolData.currentSession?.toString() || "",
                        schoolTerm: schoolData.currentTerm?.toString() || "",
                        schoolCategory: schoolData.schoolCategory?.toString() || "",
                        schoolType: schoolData.schoolType?.toString() || "",
                        schoolStatus: schoolData.schoolStatus?.toString() || "",
                        motto: schoolData.schoolMotto || "",
                        address: schoolData.schoolAddress ? {
                            id: schoolData.schoolAddress.id,
                            addressLine1: schoolData.schoolAddress.addressLine1,
                            addressLine2: schoolData.schoolAddress.addressLine2 || "",
                            city: schoolData.schoolAddress.city || "",
                            state: schoolData.schoolAddress.state,
                            zipCode: schoolData.schoolAddress.zipCode || "",
                            country: schoolData.schoolAddress.country,
                        } : null,
                        phoneNumber: schoolData.contactPersonPhone ? {
                            id: schoolData.contactPersonPhone.id,
                            phoneNumber: schoolData.contactPersonPhone.phoneNumber,
                            extension: schoolData.contactPersonPhone.extension || "",
                        } : null,
                        schoolLogo: null,
                    };

                    console.log("Mapped values:", mappedValues);
                    setInitialValues(mappedValues);
                    setSchoolDataLoaded(true);
                } else {
                    console.warn("No school data received");
                    setAlertMessage({
                        feMessage: "No school information found",
                        httpStatus: 404,
                    });
                }
            } catch (error) {
                console.error("Error fetching school data:", error);
                setAlertMessage({
                    feMessage: "Failed to load school information",
                    beMessage: error instanceof Error ? error.message : "Unknown error",
                    httpStatus: 500,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchSchoolData();
    }, []);

    // Build form fields when enums are loaded AND school data is loaded
    useEffect(() => {
        console.log("Checking conditions:", {
            isEnumLoading,
            schoolDataLoaded,
            enumsExists: !!enums,
            initialValuesKeys: Object.keys(initialValues).length
        });

        if (!isEnumLoading && schoolDataLoaded && enums && Object.keys(initialValues).length > 0) {
            console.log("Building form fields...");

            const fields: FormField[] = [
                {
                    name: "schoolName",
                    label: "School Name",
                    type: "text",
                    required: true,
                    colSpan: 1,
                    readOnly: true,
                },
                {
                    name: "schoolEmail",
                    label: "School Email",
                    type: "text",
                    required: true,
                    colSpan: 1,
                },
                {
                    name: "principalName",
                    label: "Principal / Head Teacher",
                    type: "text",
                    colSpan: 1,
                },
                {
                    name: "establishedYear",
                    label: "Established Year",
                    type: "text",
                    colSpan: 1,
                    readOnly: true,
                    placeholder: "e.g., 1995",
                },
                {
                    name: "schoolSession",
                    label: "Current Academic Session",
                    type: "select",
                    required: true,
                    colSpan: 1,
                    options: getEnumOptions(enums.SchoolSessions),
                },
                {
                    name: "schoolTerm",
                    label: "Current Term",
                    type: "select",
                    required: true,
                    colSpan: 1,
                    options: getEnumOptions(enums.SchoolTerms),
                },
                {
                    name: "schoolCategory",
                    label: "School Category",
                    type: "select",
                    required: true,
                    colSpan: 1,
                    readOnly: true,
                    options: getEnumOptions(enums.SchoolCategory),
                },
                {
                    name: "schoolType",
                    label: "School Type",
                    type: "select",
                    required: true,
                    colSpan: 1,
                    readOnly: true,
                    options: getEnumOptions(enums.SchoolType),
                },
                {
                    name: "schoolStatus",
                    label: "School Status",
                    type: "select",
                    required: true,
                    colSpan: 1,
                    readOnly: true,
                    options: getEnumOptions(enums.SchoolStatus),
                },
                {
                    name: "motto",
                    label: "School Motto",
                    type: "text",
                    colSpan: 3,
                },
                {
                    name: "address",
                    label: "School Address",
                    type: "address",
                    colSpan: 3,
                },
                {
                    name: "phoneNumber",
                    label: "School Contact Number",
                    type: "phone",
                    colSpan: 3,
                },
                // {
                //     name: "schoolLogo",
                //     label: "School Logo",
                //     type: "image",
                //     multiple: false,
                //     colSpan: 2,
                // },
            ];

            setFormFields(fields);
            console.log("Form fields set:", fields.length);
        }
    }, [enums, isEnumLoading, schoolDataLoaded, initialValues, getEnumOptions]);

    const handleSubmit = async (data: any) => {
        try {
            setAlertMessage({
                feMessage: "Saving settings...",
            });

            // Prepare payload for update
            const updatePayload = {
                schoolId: data.id,
                schoolName: data.schoolName,
                schoolEmail: data.schoolEmail,
                principalName: data.principalName,
                yearofEstablishment: data.establishedYear ? parseInt(data.establishedYear) : null,
                currentSession: data.schoolSession ? parseInt(data.schoolSession) : null,
                currentTerm: data.schoolTerm ? parseInt(data.schoolTerm) : null,
                schoolMotto: data.motto,
                contactPersonEmail: data.schoolEmail,
                contactPersonPhoneId: data.phoneNumber?.id || null,
                schoolAddress: data.address ? {
                    addressId: data.address.id,
                    addressLine1: data.address.addressLine1,
                    addressLine2: data.address.addressLine2,
                    city: data.address.city,
                    state: data.address.state,
                    zipCode: data.address.zipCode,
                    country: data.address.country,
                } : null,
                logoAssetId: data.schoolLogo?.id || null,
            };

            console.log("Settings submitted:", updatePayload);

            // TODO: Call update API when ready
            // await SchoolService.updateSchoolInfo(updatePayload);

            setTimeout(() => {
                setAlertMessage({
                    feMessage: "Settings updated successfully!",
                    httpStatus: 200,
                });
            }, 700);
        } catch (error: any) {
            setAlertMessage({
                feMessage: "Failed to update settings.",
                beMessage: error.message,
                httpStatus: 500,
            });
        }
    };

    // Show loading state while either loading school data or enums
    if (loading || isEnumLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    // Show error if school data failed to load
    if (!schoolDataLoaded && !loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Typography color="error">
                    {alertMessage.feMessage || "Failed to load school information"}
                </Typography>
            </Box>
        );
    }

    // Wait for form fields to be ready
    if (formFields.length === 0) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="body1" sx={{ mt: 3, mb: 2 }}>
                Manage general configuration of the system.
            </Typography>

            <MessageDisplay
                feMessage={alertMessage.feMessage}
                beMessage={alertMessage.beMessage}
                httpStatus={alertMessage.httpStatus}
            />

            <DynamicForm
                title="School Information"
                fields={formFields}
                onSubmit={handleSubmit}
                submitButtonText="Save Changes"
                columns={3}
                initialValues={initialValues}
            />
        </Box>
    );
};

export default GeneralSettings;