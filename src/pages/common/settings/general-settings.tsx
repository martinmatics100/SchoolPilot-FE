import { useEffect, useState, useCallback, useMemo } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import DynamicForm, { type FormField } from "../../../components/my-form";
import MessageDisplay from "../../../components/message-display";
import { useEnums } from "../../../hooks/useEnums";
import { SchoolService } from "../../../api/schoolService";
import { findCountryByTwoLetterCode, ISO3166Countries } from "../../../utils/iso3166Countries";

const GeneralSettings = () => {
    const { enums, isLoading: isEnumLoading } = useEnums({ fetchPermissionData: false });
    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [initialValues, setInitialValues] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [schoolDataLoaded, setSchoolDataLoaded] = useState(false);
    const [updating, setUpdating] = useState(false);
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

    // Helper function to map country code
    const mapCountryCode = useCallback((countryCode: string): string => {
        if (!countryCode) return "566";

        if (countryCode === "566") return "566";

        const countryByTwoLetter = findCountryByTwoLetterCode(countryCode);
        if (countryByTwoLetter) return countryByTwoLetter.NumericCode;

        const countryByThreeLetter = ISO3166Countries.find(c => c.ThreeLetterCode === countryCode);
        if (countryByThreeLetter) return countryByThreeLetter.NumericCode;

        return "566";
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
                    // Map phone number
                    const phoneData = schoolData.contactPersonPhone ? {
                        id: schoolData.contactPersonPhone.id,
                        phoneType: schoolData.contactPersonPhone.phoneType?.toString() || "",
                        country: mapCountryCode(schoolData.contactPersonPhone.country || "NG"),
                        number: schoolData.contactPersonPhone.number || "",
                        extension: schoolData.contactPersonPhone.extension || "",
                    } : null;

                    // Map address
                    const addressData = schoolData.schoolAddress ? {
                        id: schoolData.schoolAddress.id,
                        addressLine1: schoolData.schoolAddress.addressLine1 || "",
                        addressLine2: schoolData.schoolAddress.addressLine2 || "",
                        city: schoolData.schoolAddress.city || "",
                        state: schoolData.schoolAddress.state || "",
                        postalCode: schoolData.schoolAddress.zipCode || "",
                        country: mapCountryCode(schoolData.schoolAddress.country || "NG"),
                    } : null;

                    // Map the API response to form initial values
                    const mappedValues = {
                        id: schoolData.id,  // This is critical
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
                        address: addressData,
                        phoneNumber: phoneData,
                    };

                    console.log("Mapped values - ID:", mappedValues.id); // Verify ID is present
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
    }, [mapCountryCode]);

    // Build form fields
    useEffect(() => {
        if (!isEnumLoading && schoolDataLoaded && enums && Object.keys(initialValues).length > 0) {
            const fields: FormField[] = [
                {
                    name: "id",  // Add hidden field for ID
                    label: "School ID",
                    type: "text",
                    hidden: true,  // This hides the field
                    colSpan: 1,
                },
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
                    extraProps: { enums }
                },
            ];

            setFormFields(fields);
        }
    }, [enums, isEnumLoading, schoolDataLoaded, initialValues, getEnumOptions]);

    const handleSubmit = async (data: any) => {
        console.log("=== handleSubmit Debug ===");
        console.log("Full form data:", data);
        console.log("School ID from data:", data.id);
        console.log("Data keys:", Object.keys(data));

        // Check if id exists
        if (!data.id) {
            console.error("School ID is missing from form data!");
            setAlertMessage({
                feMessage: "Error: School ID is missing. Please refresh the page and try again.",
                httpStatus: 400,
            });
            return;
        }

        try {
            setUpdating(true);
            setAlertMessage({ feMessage: "Saving settings..." });

            // Prepare payload for update
            const updatePayload = {
                schoolId: data.id,  // Now this should have a value
                schoolName: data.schoolName,
                schoolEmail: data.schoolEmail,
                principalName: data.principalName || null,
                yearofEstablishment: data.establishedYear ? parseInt(data.establishedYear) : null,
                currentTerm: data.schoolTerm ? parseInt(data.schoolTerm) : null,
                currentSessions: data.schoolSession ? parseInt(data.schoolSession) : null,
                schoolCategory: data.schoolCategory ? parseInt(data.schoolCategory) : null,
                schoolType: data.schoolType ? parseInt(data.schoolType) : null,
                schoolMotto: data.motto || null,
                contactPersonEmail: data.schoolEmail,
                contactPersonPhoneId: data.phoneNumber?.id || null,
                logoAssetId: null,
                schoolAddress: data.address ? {
                    addressId: data.address.id || null,
                    addressLine1: data.address.addressLine1,
                    addressLine2: data.address.addressLine2 || null,
                    city: data.address.city || null,
                    state: data.address.state,
                    zipCode: data.address.postalCode || null,
                    country: data.address.country,
                } : null,
            };

            console.log("Submitting update payload with schoolId:", updatePayload.schoolId);
            console.log("Full update payload:", updatePayload);

            // Call the update API
            const result = await SchoolService.updateSchoolInfo(updatePayload);

            setAlertMessage({
                feMessage: result.message || "Settings updated successfully!",
                httpStatus: 200,
            });

            // Refresh the school data after update
            setTimeout(async () => {
                const refreshedData = await SchoolService.getSchoolInfo();
                if (refreshedData) {
                    const updatedMappedValues = {
                        id: refreshedData.id,
                        schoolName: refreshedData.schoolName || "",
                        schoolEmail: refreshedData.schoolEmail || "",
                        principalName: refreshedData.principalName || "",
                        establishedYear: refreshedData.yearofEstablishment?.toString() || "",
                        schoolSession: refreshedData.currentSession?.toString() || "",
                        schoolTerm: refreshedData.currentTerm?.toString() || "",
                        schoolCategory: refreshedData.schoolCategory?.toString() || "",
                        schoolType: refreshedData.schoolType?.toString() || "",
                        schoolStatus: refreshedData.schoolStatus?.toString() || "",
                        motto: refreshedData.schoolMotto || "",
                        address: refreshedData.schoolAddress ? {
                            id: refreshedData.schoolAddress.id,
                            addressLine1: refreshedData.schoolAddress.addressLine1 || "",
                            addressLine2: refreshedData.schoolAddress.addressLine2 || "",
                            city: refreshedData.schoolAddress.city || "",
                            state: refreshedData.schoolAddress.state || "",
                            postalCode: refreshedData.schoolAddress.zipCode || "",
                            country: mapCountryCode(refreshedData.schoolAddress.country || "NG"),
                        } : null,
                        phoneNumber: refreshedData.contactPersonPhone ? {
                            id: refreshedData.contactPersonPhone.id,
                            phoneType: refreshedData.contactPersonPhone.phoneType?.toString() || "",
                            country: mapCountryCode(refreshedData.contactPersonPhone.country || "NG"),
                            number: refreshedData.contactPersonPhone.number || "",
                            extension: refreshedData.contactPersonPhone.extension || "",
                        } : null,
                    };
                    setInitialValues(updatedMappedValues);
                }
            }, 1000);

        } catch (error: any) {
            console.error("Update error:", error);
            setAlertMessage({
                feMessage: error.response?.data?.message || "Failed to update settings.",
                beMessage: error.message,
                httpStatus: error.response?.status || 500,
            });
        } finally {
            setUpdating(false);
        }
    };

    if (loading || isEnumLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (!schoolDataLoaded && !loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <Typography color="error">
                    {alertMessage.feMessage || "Failed to load school information"}
                </Typography>
            </Box>
        );
    }

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
                submitButtonText={updating ? "Saving..." : "Save Changes"}
                columns={3}
                initialValues={initialValues}
                submitDisabled={updating}
            />
        </Box>
    );
};

export default GeneralSettings;