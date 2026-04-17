import React, { useEffect, useState, useMemo } from "react";
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
import { fetchBranches } from "../../../../api/userService";
import { fetchClasses } from "../../../../api/classServices";
import {
    getStudentById,
    updateStudent,
} from "../../../../api/studentService";
import { type Branch } from "../../../../types/interfaces/i-user";
import { type StudentDetail, type UpdateStudentPayload } from "../../../../types/interfaces/i-student";

interface AddressData {
    addressLine1: string;
    addressLine2?: string | null;
    city?: string | null;
    state: string;
    zipCode?: string | null;
    county?: string | null;
    country: string;
}

interface StudentDetailWithAddress extends StudentDetail {
    address?: AddressData;
    photoUrl?: string | null;
}

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
    const theme = useTheme();
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
    const [studentPhotoUrl, setStudentPhotoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [alertMessage, setAlertMessage] = useState<{
        feMessage?: string;
        beMessage?: string;
        httpStatus?: number;
    }>({});
    const [isLoadingBranches, setIsLoadingBranches] = useState(false);
    const [isLoadingClasses, setIsLoadingClasses] = useState(false);
    const [selectedClass, setSelectedClass] = useState<{
        id: string;
        name: string;
        classLevel?: number;
    } | null>(null);

    const [dotCount, setDotCount] = useState(0);
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

    useEffect(() => {
        if (!open) {
            setDotCount(0);
        }
    }, [open]);

    useEffect(() => {
        if (!open) {
            setStudentData(null);
            setStudentPhotoUrl(null);
            setSelectedClass(null);
            setAlertMessage({});
            setFormFields([]);
        }
    }, [open]);

    useEffect(() => {
        const loadBranches = async () => {
            if (selectedAccount) {
                setIsLoadingBranches(true);
                try {
                    const fetchedBranches = await fetchBranches(selectedAccount, apiClient);
                    setBranches(fetchedBranches);
                } catch (err) {
                    console.error("Failed to load branches:", err);
                } finally {
                    setIsLoadingBranches(false);
                }
            }
        };
        loadBranches();
    }, [selectedAccount, apiClient]);

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
                } finally {
                    setIsLoadingClasses(false);
                }
            }
        };
        loadClasses();
    }, [selectedAccount]);

    useEffect(() => {
        const loadStudentData = async () => {
            if (open && studentId && selectedAccount && enums && classes.length > 0) {
                setLoading(true);
                setAlertMessage({});

                try {
                    const student: StudentDetailWithAddress = await getStudentById(selectedAccount, studentId);

                    setStudentPhotoUrl(student.photoUrl || null);

                    const genderEnum = enums?.Gender?.find(
                        (g: any) => g.displayName === student.gender || g.name === student.gender
                    );

                    const statusEnum = enums?.StudentStatus?.find(
                        (s: any) => s.displayName === student.status || s.name === student.status
                    );

                    const formattedAddress = student.address ? {
                        addressLine1: student.address.addressLine1 || "",
                        postalCode: student.address.zipCode || "",
                        country: student.address.country || "",
                        state: student.address.state || "",
                    } : {
                        addressLine1: "",
                        postalCode: "",
                        country: "",
                        state: "",
                    };

                    const formattedData = {
                        id: student.id,
                        firstName: student.firstName,
                        lastName: student.lastName,
                        dateOfBirth: student.dateOfBirth?.split('T')[0] || '',
                        gender: genderEnum?.value?.toString() || '',
                        schoolId: student.schoolId || '',
                        classId: student.classRoomId || '',
                        status: statusEnum?.value?.toString() || '',
                        address: formattedAddress,
                    };

                    setStudentData(formattedData);

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

        loadStudentData();
    }, [open, studentId, selectedAccount, enums, classes]);

    useEffect(() => {
        if (
            !isEnumsLoading &&
            !isLoadingClasses &&
            enums &&
            studentData &&
            classes.length > 0
        ) {
            const fields: FormField[] = [
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
                    required: false,
                    colSpan: 1,
                },
                {
                    name: "gender",
                    label: "Gender",
                    type: "select",
                    required: true,
                    colSpan: 1,
                    readOnly: true,
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

            fields.push({
                name: "address",
                label: "Address",
                type: "address",
                required: false,
                colSpan: 2,
            });

            fields.push({
                name: "notes",
                label: "Notes",
                type: "multiline",
                required: false,
                colSpan: 2,
                rows: 4,
            });

            setFormFields(fields);
        }
    }, [
        enums,
        isEnumsLoading,
        isLoadingClasses,
        classes,
        studentData,
        selectedClass,
    ]);

    const handleSubmit = async (data: any) => {
        try {
            setAlertMessage({ feMessage: "Updating student data..." });

            const genderValue = data.gender ? parseInt(data.gender) : 0;
            const statusValue = data.status ? parseInt(data.status) : 0;
            const streamTypeValue = data.streamType ? parseInt(data.streamType) : null;

            const formattedAddress = data.address ? {
                AddressLine1: data.address.addressLine1 || "",
                State: data.address.state || "",
                Country: data.address.country || "",
            } : undefined;

            const payload: UpdateStudentPayload = {
                Id: studentId!,
                SchoolId: data.schoolId,
                FirstName: data.firstName,
                LastName: data.lastName,
                Gender: genderValue,
                Status: statusValue,
                ClassRoomId: data.classId,
                StreamType: streamTypeValue,
                DateOfBirth: data.dateOfBirth,
                Address: formattedAddress,
                Notes: data.notes,
            };

            const response = await updateStudent(selectedAccount!, studentId!, payload);

            if (response.success) {
                setAlertMessage({
                    feMessage: "Student updated successfully!",
                    httpStatus: 200,
                });

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
        setStudentPhotoUrl(null);
        setSelectedClass(null);
        setFormFields([]);
        onClose();
    };

    const getInitials = () => {
        if (studentData?.firstName && studentData?.lastName) {
            return `${studentData.firstName.charAt(0)}${studentData.lastName.charAt(0)}`.toUpperCase();
        }
        return "?";
    };

    const isReady = !isEnumsLoading &&
        !isLoadingClasses &&
        !loading &&
        studentData &&
        classes.length > 0 &&
        formFields.length > 0;

    const getAnimatedTitle = () => {
        const baseText = "Edit Student";
        const dots = ".".repeat(dotCount);
        return `${baseText}${dots}`;
    };

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
            <Fade in={open} timeout={300}>
                <Box>
                    {/* Header */}
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
                                    Update student information
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

                    {/* Message Display */}
                    {alertMessage.feMessage && (
                        <Box sx={{ mb: 3 }}>
                            <MessageDisplay
                                feMessage={alertMessage.feMessage}
                                beMessage={alertMessage.beMessage}
                                httpStatus={alertMessage.httpStatus}
                            />
                        </Box>
                    )}

                    {/* Student Avatar */}
                    <Grow in={!!studentData} timeout={500}>
                        <Box
                            sx={{
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                mb: 4,
                                mt: 2,
                            }}
                        >
                            <Paper
                                elevation={0}
                                sx={{
                                    borderRadius: "50%",
                                    overflow: "hidden",
                                    border: `3px solid ${theme.palette.primary.main}`,
                                    boxShadow: `0 8px 20px ${alpha(theme.palette.primary.main, 0.2)}`,
                                }}
                            >
                                <Avatar
                                    src={studentPhotoUrl || undefined}
                                    alt={`${studentData?.firstName || ''} ${studentData?.lastName || ''}`}
                                    sx={{
                                        width: { xs: 100, sm: 120 },
                                        height: { xs: 100, sm: 120 },
                                        fontSize: { xs: "2.5rem", sm: "3rem" },
                                        bgcolor: studentPhotoUrl ? "transparent" : theme.palette.primary.main,
                                        color: "white",
                                        fontWeight: 600,
                                    }}
                                >
                                    {!studentPhotoUrl && getInitials()}
                                </Avatar>
                            </Paper>
                        </Box>
                    </Grow>

                    {/* Divider */}
                    <Divider sx={{ mb: 3 }} />

                    {/* Form or Loading */}
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
                                Loading student data...
                            </Typography>
                        </Box>
                    ) : (
                            <Fade in={isReady} timeout={400}>
                                <Box>
                                    <DynamicForm
                                        title=""
                                        fields={formFields}
                                        onSubmit={handleSubmit}
                                        submitButtonText="Update Student"
                                        columns={2}
                                        initialValues={studentData}
                                    />
                                </Box>
                            </Fade>
                    )}
                </Box>
            </Fade>
        </Drawer>
    );
};

export default EditStudentDrawer;