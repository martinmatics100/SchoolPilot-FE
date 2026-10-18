import { useEffect, useState, useCallback } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import DynamicForm, { type FormField } from "../../../components/my-form";
import MessageDisplay from "../../../components/message-display";
import { useEnums } from "../../../hooks/useEnums";
import { SchoolService } from "../../../api/schoolService";
import {
    findCountryByTwoLetterCode,
    ISO3166Countries,
} from "../../../utils/iso3166Countries";

const SchoolInfoSettings = () => {
    const { enums, isLoading: isEnumLoading } = useEnums({
        fetchPermissionData: false,
    });
    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [initialValues, setInitialValues] = useState<any>({});
    const [loading, setLoading] = useState(true);
    const [schoolDataLoaded, setSchoolDataLoaded] = useState(false);
    const [updating, setUpdating] = useState(false);

    // Track enrolled-students flag
    const [hasEnrolledStudents, setHasEnrolledStudents] = useState(false);

    const [alertMessage, setAlertMessage] = useState<{
        feMessage?: string;
        beMessage?: string;
        httpStatus?: number;
    }>({});

    /* ─────────────────────────────────────────────────────────
       Helpers
       ───────────────────────────────────────────────────────── */
    const getEnumOptions = useCallback((enumArray: any[]) => {
        return (
            enumArray?.map((item) => ({
                value: item.value.toString(),
                label: item.displayName || item.name,
            })) || []
        );
    }, []);

    const mapCountryCode = useCallback((countryCode: string): string => {
        if (!countryCode) return "566";
        if (countryCode === "566") return "566";

        const countryByTwoLetter = findCountryByTwoLetterCode(countryCode);
        if (countryByTwoLetter) return countryByTwoLetter.NumericCode;

        const countryByThreeLetter = ISO3166Countries.find(
            (c) => c.ThreeLetterCode === countryCode
        );
        if (countryByThreeLetter) return countryByThreeLetter.NumericCode;

        return "566";
    }, []);

    const formatDateForInput = useCallback(
        (dateString: string | null | undefined): string => {
            if (!dateString) return "";
            try {
                const date = new Date(dateString);
                if (isNaN(date.getTime())) return "";
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, "0");
                const day = String(date.getDate()).padStart(2, "0");
                return `${year}-${month}-${day}`;
            } catch {
                return "";
            }
        },
        []
    );

    const mapSchoolDataToFormValues = useCallback(
        (schoolData: any) => {
            // Address — matches the new entity (addressLine2, city, lga)
            const addressData = schoolData.schoolAddress
                ? {
                    id: schoolData.schoolAddress.id,
                    addressLine1:
                        schoolData.schoolAddress.addressLine1 || "",
                    addressLine2:
                        schoolData.schoolAddress.addressLine2 || "",
                    city: schoolData.schoolAddress.city || "",
                    lga: schoolData.schoolAddress.lga || "",
                    state: schoolData.schoolAddress.state || "",
                    country: mapCountryCode(
                        schoolData.schoolAddress.country || "NG"
                    ),
                }
                : null;

            return {
                id: schoolData.id,
                schoolName: schoolData.schoolName || "",
                shortCode: schoolData.shortCode || "",
                schoolEmail: schoolData.schoolEmail || "",
                establishedYear:
                    schoolData.yearofEstablishment?.toString() || "",
                schoolSession: schoolData.currentSession?.toString() || "",
                schoolTerm: schoolData.currentTerm?.toString() || "",
                currentTermStartDate: formatDateForInput(
                    schoolData.currentTermStartDate
                ),
                currentTermEndDate: formatDateForInput(
                    schoolData.currentTermEndDate
                ),
                nextTermBegins: formatDateForInput(
                    schoolData.nextTermBegins
                ),
                schoolCategory: schoolData.schoolCategory?.toString() || "",
                schoolType: schoolData.schoolType?.toString() || "",
                schoolStatus: schoolData.schoolStatus?.toString() || "",
                motto: schoolData.schoolMotto || "",
                address: addressData,
            };
        },
        [mapCountryCode, formatDateForInput]
    );

    /* ─────────────────────────────────────────────────────────
       Fetch school data
       ───────────────────────────────────────────────────────── */
    useEffect(() => {
        const fetchSchoolData = async () => {
            try {
                setLoading(true);
                const schoolData = await SchoolService.getSchoolInfo();

                if (schoolData) {
                    setHasEnrolledStudents(
                        Boolean(schoolData.hasEnrolledStudents)
                    );

                    const mappedValues =
                        mapSchoolDataToFormValues(schoolData);
                    setInitialValues(mappedValues);
                    setSchoolDataLoaded(true);
                } else {
                    setAlertMessage({
                        feMessage: "No school information found",
                        httpStatus: 404,
                    });
                }
            } catch (error) {
                console.error("Error fetching school data:", error);
                setAlertMessage({
                    feMessage: "Failed to load school information",
                    beMessage:
                        error instanceof Error
                            ? error.message
                            : "Unknown error",
                    httpStatus: 500,
                });
            } finally {
                setLoading(false);
            }
        };

        fetchSchoolData();
    }, [mapSchoolDataToFormValues]);

    /* ─────────────────────────────────────────────────────────
       Build form fields
       ───────────────────────────────────────────────────────── */
    useEffect(() => {
        if (
            !isEnumLoading &&
            schoolDataLoaded &&
            enums &&
            Object.keys(initialValues).length > 0
        ) {
            const fields: FormField[] = [
                {
                    name: "id",
                    label: "School ID",
                    type: "text",
                    hidden: true,
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
                    readOnly: true,
                },
                {
                    name: "establishedYear",
                    label: "Established Year",
                    type: "text",
                    colSpan: 1,
                    readOnly: false,
                },
                {
                    name: "schoolSession",
                    label: "Current Academic Session",
                    type: "select",
                    required: true,
                    colSpan: 1,
                    options: getEnumOptions(enums.SchoolSessions),
                    readOnly: true,
                },
                {
                    name: "schoolTerm",
                    label: "Current Term",
                    type: "select",
                    required: true,
                    colSpan: 1,
                    options: getEnumOptions(enums.SchoolTerms),
                    readOnly: false,
                },
                {
                    name: "currentTermStartDate",
                    label: "Current Term Start Date",
                    type: "date",
                    required: true,
                    colSpan: 1,
                    readOnly: false,
                },
                {
                    name: "currentTermEndDate",
                    label: "Current Term End Date",
                    type: "date",
                    required: true,
                    colSpan: 1,
                    readOnly: false,
                },
                {
                    name: "nextTermBegins",
                    label: "Next Term Begins",
                    type: "date",
                    required: false,
                    colSpan: 1,
                    readOnly: false,
                    infoText: "The date the next term will resume. Shown on printed terminal reports.",
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

                /* ── Short Code — locks after first student ── */
                {
                    name: "shortCode",
                    label: "Short Code",
                    type: "text",
                    colSpan: 1,
                    readOnly: hasEnrolledStudents,
                    infoText: hasEnrolledStudents
                        ? "This code is used on all your existing student IDs and cannot be changed. Contact support if you need to update it."
                        : "Your short code prefixes every student ID (e.g. 'GRN-0001'). Choose 3–5 uppercase letters. You can change it until you enrol your first student.",
                },

                {
                    name: "address",
                    label: "School Address",
                    type: "address",
                    colSpan: 3,
                    readOnly: true,
                },
            ];

            setFormFields(fields);
        }
    }, [
        enums,
        isEnumLoading,
        schoolDataLoaded,
        initialValues,
        getEnumOptions,
        hasEnrolledStudents,
    ]);

    /* ─────────────────────────────────────────────────────────
       Submit
       ───────────────────────────────────────────────────────── */
    const handleSubmit = async (data: any) => {
        if (!data.id) {
            setAlertMessage({
                feMessage:
                    "Error: School ID is missing. Please refresh the page and try again.",
                httpStatus: 400,
            });
            return;
        }

        // Term date validation
        if (data.currentTermStartDate && data.currentTermEndDate) {
            const startDate = new Date(data.currentTermStartDate);
            const endDate = new Date(data.currentTermEndDate);
            if (endDate <= startDate) {
                setAlertMessage({
                    feMessage: "Term end date must be after the start date.",
                    httpStatus: 400,
                });
                return;
            }
        }

        if (data.currentTermEndDate && data.nextTermBegins) {
            const endDate = new Date(data.currentTermEndDate);
            const nextStartDate = new Date(data.nextTermBegins);
            if (nextStartDate <= endDate) {
                setAlertMessage({
                    feMessage:
                        "Next term start date must be after the current term end date.",
                    httpStatus: 400,
                });
                return;
            }
        }

        // Short code format validation (only when editable)
        if (!hasEnrolledStudents && data.shortCode) {
            const codeRegex = /^[A-Z]{2,5}$/;
            if (!codeRegex.test(data.shortCode)) {
                setAlertMessage({
                    feMessage:
                        "Short Code must be 2–5 uppercase letters (e.g. GRN, ALPHA).",
                    httpStatus: 400,
                });
                return;
            }
        }

        try {
            setUpdating(true);
            setAlertMessage({ feMessage: "Saving settings..." });

            const updatePayload = {
                schoolId: data.id,
                schoolName: data.schoolName,
                schoolEmail: data.schoolEmail,
                // Only include shortCode when it's editable
                ...(hasEnrolledStudents
                    ? {}
                    : { shortCode: data.shortCode || null }),
                yearofEstablishment: data.establishedYear
                    ? parseInt(data.establishedYear)
                    : null,
                currentTerm: data.schoolTerm
                    ? parseInt(data.schoolTerm)
                    : null,
                currentSessions: data.schoolSession
                    ? parseInt(data.schoolSession)
                    : null,
                currentTermStartDate: data.currentTermStartDate || null,
                currentTermEndDate: data.currentTermEndDate || null,
                nextTermBegins: data.nextTermBegins || null,
                schoolCategory: data.schoolCategory
                    ? parseInt(data.schoolCategory)
                    : null,
                schoolType: data.schoolType
                    ? parseInt(data.schoolType)
                    : null,
                schoolMotto: data.motto || null,
                contactPersonEmail: data.schoolEmail,
                logoAssetId: null,
                schoolAddress: data.address
                    ? {
                        addressId: data.address.id || null,
                        addressLine1: data.address.addressLine1,
                        addressLine2: data.address.addressLine2 || null,
                        city: data.address.city || null,
                        lga: data.address.lga || null,
                        state: data.address.state,
                        country: data.address.country,
                    }
                    : null,
            };

            const result = await SchoolService.updateSchoolInfo(
                updatePayload
            );

            setAlertMessage({
                feMessage:
                    result.message || "Settings updated successfully!",
                httpStatus: 200,
            });

            // Refresh
            setTimeout(async () => {
                const refreshedData = await SchoolService.getSchoolInfo();
                if (refreshedData) {
                    setHasEnrolledStudents(
                        Boolean(refreshedData.hasEnrolledStudents)
                    );
                    const updatedMappedValues =
                        mapSchoolDataToFormValues(refreshedData);
                    setInitialValues(updatedMappedValues);
                }
            }, 1000);
        } catch (error: any) {
            console.error("Update error:", error);
            setAlertMessage({
                feMessage:
                    error.response?.data?.message ||
                    "Failed to update settings.",
                beMessage: error.message,
                httpStatus: error.response?.status || 500,
            });
        } finally {
            setUpdating(false);
        }
    };

    /* ─────────────────────────────────────────────────────────
       Render guards
       ───────────────────────────────────────────────────────── */
    if (loading || isEnumLoading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="400px"
            >
                <CircularProgress />
            </Box>
        );
    }

    if (!schoolDataLoaded && !loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="400px"
            >
                <Typography color="error">
                    {alertMessage.feMessage ||
                        "Failed to load school information"}
                </Typography>
            </Box>
        );
    }

    if (formFields.length === 0) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="400px"
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Typography variant="body1" sx={{ mt: 3, mb: 2 }}>
                Manage general configuration of your school.
            </Typography>

            <MessageDisplay
                feMessage={alertMessage.feMessage}
                beMessage={alertMessage.beMessage}
                httpStatus={alertMessage.httpStatus}
            />

            <DynamicForm
                title=""
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

export default SchoolInfoSettings;