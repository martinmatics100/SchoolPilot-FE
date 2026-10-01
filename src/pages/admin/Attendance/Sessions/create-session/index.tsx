import React, { useEffect, useState } from "react";
import DynamicForm, { type FormField } from "../../../../../components/my-form";
import { useEnums } from "../../../../../hooks/useEnums";
import { useAuth } from "../../../../../context";
import MessageDisplay from "../../../../../components/message-display";
import { NavigationButton } from "../../../../../components/navigation-button";
import { fetchClasses } from "../../../../../api/classServices";
import { createAttendanceSession } from "../../../../../api/attendanceService"; // You'll need to create this
import { type AttendanceSessionPayload } from "../../../../../types/interfaces/i-attendance"; // You'll need to create this
import { Button, Box, CircularProgress } from "@mui/material";

const CreateAttendanceSession: React.FC = () => {
    const { enums, isLoading } = useEnums({ fetchPermissionData: false });
    const { apiClient, selectedAccount } = useAuth();

    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [classes, setClasses] = useState<
        Array<{ id: string; name: string; classLevel?: number }>
    >([]);
    const [alertMessage, setAlertMessage] = useState<{
        feMessage?: string;
        beMessage?: string;
        httpStatus?: number;
    }>({});
    const [isLoadingClasses, setIsLoadingClasses] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Load classes
    useEffect(() => {
        const loadClasses = async () => {
            if (selectedAccount) {
                setIsLoadingClasses(true);
                try {
                    const fetchedClasses = await fetchClasses(selectedAccount);
                    setClasses(
                        fetchedClasses.map((c: any) => ({
                            id: c.id,
                            name: c.className,
                            classLevel: c.classLevel,
                        }))
                    );
                } catch (err) {
                    setAlertMessage({
                        feMessage: "Failed to load classes.",
                        httpStatus: 500,
                    });
                } finally {
                    setIsLoadingClasses(false);
                }
            }
        };
        loadClasses();
    }, [selectedAccount]);

    // In CreateAttendanceSession component, update the handleSubmit function:

    const handleSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);
            setAlertMessage({ feMessage: "Creating attendance session..." });

            // Parse enum values to integers
            const termValue = parseInt(data.term);
            const sessionValue = parseInt(data.session);
            const attendanceTypeValue = parseInt(data.attendanceType);

            // Prepare payload
            const payload: AttendanceSessionPayload = {
                AttendanceDate: data.attendanceDate,
                Term: termValue,
                Session: sessionValue,
                ClassId: data.classId,
                AttendanceType: attendanceTypeValue,
            };

            // Call the API with selectedAccount and payload
            const response = await createAttendanceSession(selectedAccount, payload);

            if (response.SessionId || response.sessionId || response.id) {
                setAlertMessage({
                    feMessage: `Attendance session created successfully!`,
                    httpStatus: 200,
                });

                // Reset form after successful submission
                setTimeout(() => {
                    // You might want to redirect or clear the form
                    // window.location.href = "/app/attendance-sessions";
                }, 2000);
            } else {
                throw new Error("Unexpected response from server");
            }
        } catch (error: any) {
            setAlertMessage({
                feMessage: "Failed to create attendance session.",
                beMessage: error.message,
                httpStatus: error.status || 500,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Build form fields
    useEffect(() => {
        if (!isLoading && !isLoadingClasses && enums) {
            const fields: FormField[] = [
                {
                    name: "attendanceDate",
                    label: "Attendance Date",
                    type: "date",
                    required: true,
                    colSpan: 1,
                },
                {
                    name: "term",
                    label: "Term",
                    type: "select",
                    required: true,
                    colSpan: 1,
                    options:
                        enums.SchoolTerms?.map((t: any) => ({
                            value: t.value.toString(),
                            label: t.displayName || t.name,
                        })) || [],
                },
                {
                    name: "session",
                    label: "Session",
                    type: "select",
                    required: true,
                    colSpan: 1,
                    options:
                        enums.SchoolSessions?.map((s: any) => ({
                            value: s.value.toString(),
                            label: s.displayName || s.name,
                        })) || [],
                },
                {
                    name: "classId",
                    label: "Class",
                    type: "select",
                    required: true,
                    colSpan: 1,
                    options: classes.map((cls) => ({ value: cls.id, label: cls.name })),
                },
                {
                    name: "attendanceType",
                    label: "Attendance Type",
                    type: "select",
                    required: true,
                    colSpan: 1,
                    options:
                        enums.AttendanceType?.map((a: any) => ({
                            value: a.value.toString(),
                            label: a.displayName || a.name,
                        })) || [],
                },
            ];

            setFormFields(fields);
        }
    }, [enums, isLoading, isLoadingClasses, classes]);

    // Show loading state
    if (isLoading || isLoadingClasses || formFields.length === 0) {
        return <div>Loading form...</div>;
    }

    return (
        <div>
            <MessageDisplay
                feMessage={alertMessage.feMessage}
                beMessage={alertMessage.beMessage}
                httpStatus={alertMessage.httpStatus}
            />

            <NavigationButton to="/app/attendance" sx={{ alignContent: "flex-end" }} variant="outlined">
                Go to Attendance Sessions
            </NavigationButton>

            <DynamicForm
                title="Create Attendance Session"
                fields={formFields}
                onSubmit={handleSubmit}
                submitButtonText={isSubmitting ? "Creating..." : "Create Session"}
                columns={5}
                submitDisabled={isSubmitting}
            />
        </div>
    );
};

export default CreateAttendanceSession;