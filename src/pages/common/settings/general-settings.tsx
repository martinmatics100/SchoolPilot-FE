import { useEffect, useState } from "react";
import { Box, Typography } from "@mui/material";
import DynamicForm, { type FormField } from "../../../components/my-form";
import MessageDisplay from "../../../components/message-display";
import { useEnums } from "../../../hooks/useEnums";

const GeneralSettings = () => {
    const { enums, isLoading } = useEnums({ fetchPermissionData: false });

    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [alertMessage, setAlertMessage] = useState<{
        feMessage?: string;
        beMessage?: string;
        httpStatus?: number;
    }>({});

    // Dummy data (replace later with API response)
    const schoolData = {
        schoolName: "Bright Future Academy",
        schoolEmail: "info@brightfuture.edu",
        schoolPhone: "+2348012345678",
        address: "12 Education Road, Lagos",
        website: "https://brightfuture.edu",
        motto: "Knowledge is Power",
        establishedYear: "2005",
        principalName: "Dr. John Ade",
        schoolSession: "1",
        schoolTerm: "1",
    };

    const handleSubmit = async (data: any) => {
        try {
            setAlertMessage({
                feMessage: "Saving settings...",
            });

            console.log("Settings submitted:", data);

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

    useEffect(() => {
        if (!isLoading && enums) {
            const fields: FormField[] = [
                {
                    name: "schoolName",
                    label: "School Name",
                    type: "text",
                    required: true,
                    colSpan: 2,
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
                    name: "schoolPhone",
                    label: "School Phone",
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
                },

                // Academic Session Dropdown
                {
                    name: "schoolSession",
                    label: "Current Academic Session",
                    type: "select",
                    required: true,
                    colSpan: 1,
                    options:
                        enums.SchoolSessions?.map((s) => ({
                            value: s.value.toString(),
                            label: s.displayName || s.name,
                        })) || [],
                },

                // Term Dropdown
                {
                    name: "schoolTerm",
                    label: "Current Term",
                    type: "select",
                    required: true,
                    colSpan: 1,
                    readOnly: true,
                    options:
                        enums.SchoolTerms?.map((t) => ({
                            value: t.value.toString(),
                            label: t.displayName || t.name,
                        })) || [],
                },

                {
                    name: "website",
                    label: "Website",
                    type: "text",
                    colSpan: 2,
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
                    name: "schoolLogo",
                    label: "School Logo",
                    type: "image",
                    multiple: false,
                    colSpan: 2,
                },
            ];

            setFormFields(fields);
        }
    }, [enums, isLoading]);

    if (isLoading || formFields.length === 0) {
        return <div>Loading settings...</div>;
    }

    return (
        <Box>
            {/* <Typography variant="h6">General Settings</Typography> */}
            <Typography variant="body1" sx={{ mt: 3 }}>
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
                initialValues={schoolData}
            />
        </Box>
    );
};

export default GeneralSettings;