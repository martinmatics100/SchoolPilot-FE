import React, { useEffect, useState } from "react";
import {
    Drawer,
    IconButton,
    Typography,
    Box,
    CircularProgress,
} from "@mui/material";
import IconifyIcon from "../../../../components/base/iconifyIcon";
import DynamicForm, { type FormField } from "../../../../components/my-form";
import { useEnums } from "../../../../hooks/useEnums";
import { useAuth } from "../../../../context";
import MessageDisplay from "../../../../components/message-display";
import { fetchBranches } from "../../../../api/userService";
import { fetchClasses } from "../../../../api/classServices";
import {
    getStudentById,
    updateStudent,
} from "../../../../api/studentService";
import { type Branch } from "../../../../types/interfaces/i-user";
import { type StudentDetail, type UpdateStudentPayload } from "../../../../types/interfaces/i-student";

interface EditStudentDrawerProps {
    open: boolean;
    onClose: () => void;
    studentId: string | null;
    onSuccess: () => void;
}

const EditStudentDrawer = ({
    open,
    onClose,
    studentId,
    onSuccess,
}: EditStudentDrawerProps) => {
    const { enums, isLoading: isEnumsLoading } = useEnums({
        fetchPermissionData: false,
    });
    const { apiClient, selectedAccount } = useAuth();

    const [formFields, setFormFields] = useState<FormField[]>([]);
    const [branches, setBranches] = useState<Branch[]>([]);
    const [classes, setClasses] = useState<
        Array<{ id: string; name: string; classLevel?: number }>
    >([]);
    const [studentData, setStudentData] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState<{
        feMessage?: string;
        beMessage?: string;
        httpStatus?: number;
    }>({});
    const [isLoadingBranches, setIsLoadingBranches] = useState(true);
    const [isLoadingClasses, setIsLoadingClasses] = useState(true);
    const [selectedClass, setSelectedClass] = useState<{
        id: string;
        name: string;
        classLevel?: number;
    } | null>(null);

    // Fetch student data when drawer opens and studentId is provided
    useEffect(() => {
        const loadStudentData = async () => {
            if (open && studentId && selectedAccount) {
                setLoading(true);
                try {
                    const student: StudentDetail = await getStudentById(selectedAccount, studentId);

                    // Map gender display name to enum value
                    const genderEnum = enums?.Gender?.find(
                        (g: any) => g.displayName === student.gender || g.name === student.gender
                    );

                    // Map status display name to enum value
                    const statusEnum = enums?.StudentStatus?.find(
                        (s: any) => s.displayName === student.status || s.name === student.status
                    );

                    // Format the student data for the form
                    const formattedData = {
                        id: student.id,
                        firstName: student.firstName,
                        lastName: student.lastName,
                        dateOfBirth: student.dateOfBirth?.split('T')[0] || '',
                        gender: genderEnum?.value?.toString() || '', // Store enum value, not display name
                        schoolId: student.schoolId || '',
                        classId: student.classRoomId || '',
                        status: statusEnum?.value?.toString() || '', // Store enum value, not display name
                    };

                    setStudentData(formattedData);

                    // Set selected class based on student's class
                    if (student.classRoomId) {
                        const studentClass = classes.find(c => c.id === student.classRoomId);
                        setSelectedClass(studentClass || null);
                    }
                } catch (error) {
                    console.error("Error loading student data:", error);
                    setAlertMessage({
                        feMessage: "Failed to load student data.",
                        httpStatus: 500,
                    });
                } finally {
                    setLoading(false);
                }
            }
        };

        // Only load if we have enums data
        if (enums) {
            loadStudentData();
        }
    }, [open, studentId, selectedAccount, classes, enums]);

    // Load branches
    useEffect(() => {
        const loadBranches = async () => {
            if (selectedAccount) {
                setIsLoadingBranches(true);
                try {
                    const fetchedBranches = await fetchBranches(selectedAccount, apiClient);
                    setBranches(fetchedBranches);
                } catch (err) {
                    console.error("Failed to load branches:", err);
                    setAlertMessage({
                        feMessage: "Failed to load branches.",
                        httpStatus: 500,
                    });
                } finally {
                    setIsLoadingBranches(false);
                }
            }
        };
        loadBranches();
    }, [selectedAccount]);

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
                    console.error("Failed to load classes:", err);
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

    // Build form fields
    useEffect(() => {
        if (
            !isEnumsLoading &&
            !isLoadingBranches &&
            !isLoadingClasses &&
            enums &&
            studentData
        ) {
            const fields: FormField[] = [
                // Read-only fields
                {
                    name: "id",
                    label: "Student ID",
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
                    name: "dateOfBirth",
                    label: "Date of Birth",
                    type: "date",
                    required: false, // Not required in backend update command
                    colSpan: 1,
                },
                {
                    name: "gender",
                    label: "Gender",
                    type: "select",
                    required: true,
                    options:
                        enums.Gender?.map((g: any) => ({
                            value: g.value.toString(),
                            label: g.displayName || g.name,
                        })) || [],
                },
                {
                    name: "classId",
                    label: "Class",
                    type: "select",
                    required: true,
                    colSpan: 1,
                    options: classes.map((cls) => ({ value: cls.id, label: cls.name })),
                    onChange: (value: string) => {
                        const selected = classes.find((c) => c.id === value);
                        setSelectedClass(selected || null);
                    },
                },
            ];

            // Insert Stream field right after Class if class level is 4
            if (selectedClass && selectedClass.classLevel === 4) {
                fields.push({
                    name: "streamType",
                    label: "Stream",
                    type: "select",
                    required: false,
                    colSpan: 1,
                    placeholder: "Select Stream",
                    options:
                        enums.StreamType?.map((s: any) => ({
                            value: s.value.toString(),
                            label: s.displayName || s.name,
                        })) || [],
                });
            }

            // Status field (editable)
            fields.push({
                name: "status",
                label: "Status",
                type: "select",
                required: true,
                colSpan: 1,
                options:
                    enums.StudentStatus?.map((s: any) => ({
                        value: s.value.toString(),
                        label: s.displayName || s.name,
                    })) || [],
            });

            // Optional fields from backend UpdateStudent.Command
            fields.push(
                {
                    name: "address",
                    label: "Address",
                    type: "address",
                    required: false,
                    colSpan: 2,
                },
                {
                    name: "emergencyContactName",
                    label: "Emergency Contact Name",
                    type: "text",
                    required: false,
                    colSpan: 1,
                },
                {
                    name: "emergencyContactPhone",
                    label: "Emergency Contact Phone",
                    type: "text",
                    required: false,
                    colSpan: 1,
                },
                // {
                //     name: "notes",
                //     label: "Notes",
                //     type: "textarea",
                //     required: false,
                //     colSpan: 3,
                //     rows: 3,
                // }
            );

            setFormFields(fields);
        }
    }, [
        enums,
        isEnumsLoading,
        isLoadingBranches,
        isLoadingClasses,
        branches,
        classes,
        selectedClass,
        studentData,
    ]);

    const handleSubmit = async (data: any) => {
        try {
            setAlertMessage({ feMessage: "Updating student data..." });

            // Parse numeric fields
            const genderValue = data.gender ? parseInt(data.gender) : 0;
            const statusValue = data.status ? parseInt(data.status) : 0;

            // Create payload matching backend UpdateStudent.Command
            const payload: UpdateStudentPayload = {
                Id: studentId!,
                SchoolId: data.schoolId,
                FirstName: data.firstName,
                LastName: data.lastName,
                Gender: genderValue,
                Status: statusValue,
                ClassRoomId: data.classId,
                DateOfBirth: data.dateOfBirth,
                Email: data.email,
                PhoneNumber: data.phoneNumber,
                Address: data.address,
                EmergencyContactName: data.emergencyContactName,
                EmergencyContactPhone: data.emergencyContactPhone,
                Notes: data.notes,
            };

            const response = await updateStudent(selectedAccount!, studentId!, payload);

            if (response.success) {
                setAlertMessage({
                    feMessage: "Student updated successfully!",
                    httpStatus: 200,
                });

                // Close drawer after successful update
                setTimeout(() => {
                    onSuccess();
                    handleClose();
                }, 1500);
            } else {
                throw new Error(response.message || "Failed to update student");
            }
        } catch (error: any) {
            console.error("Update error:", error);
            setAlertMessage({
                feMessage: "Failed to update student.",
                beMessage: error.message,
                httpStatus: error.status || 500,
            });
        }
    };

    const handleClose = () => {
        setAlertMessage({});
        setStudentData(null);
        setSelectedClass(null);
        onClose();
    };

    const isLoading =
        isEnumsLoading ||
        isLoadingBranches ||
        isLoadingClasses ||
        loading ||
        !studentData;

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
                    p: 3,
                },
            }}
        >
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 3,
                }}
            >
                <Typography variant="h5" fontWeight="bold">
                    Edit student in Progress...
                </Typography>
                <IconButton onClick={handleClose}>
                    <IconifyIcon icon="ic:round-close" width={24} height={24} />
                </IconButton>
            </Box>

            <MessageDisplay
                feMessage={alertMessage.feMessage}
                beMessage={alertMessage.beMessage}
                httpStatus={alertMessage.httpStatus}
            />

            {isLoading ? (
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    minHeight="400px"
                >
                    <CircularProgress />
                </Box>
            ) : (
                <DynamicForm
                    title=""
                    fields={formFields}
                    onSubmit={handleSubmit}
                    submitButtonText="Update Student"
                    columns={2}
                    initialValues={studentData}
                />
            )}
        </Drawer>
    );
};

export default EditStudentDrawer;