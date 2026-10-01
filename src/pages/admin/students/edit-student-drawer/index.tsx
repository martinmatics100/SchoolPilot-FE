import React, { useEffect, useState, useRef, useMemo } from "react";
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
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Stack,
    TextField,
} from "@mui/material";
import { useTheme } from "@mui/material";
import IconifyIcon from "../../../../components/base/iconifyIcon";
import DynamicForm, { type FormField } from "../../../../components/my-form";
import { useEnums } from "../../../../hooks/useEnums";
import { useAuth } from "../../../../context";
import MessageDisplay from "../../../../components/message-display";
import { fetchBranches, fetchUsers } from "../../../../api/userService";
import { fetchClasses } from "../../../../api/classServices";
import {
    getStudentById,
    updateStudent,
} from "../../../../api/studentService";
import { type Branch } from "../../../../types/interfaces/i-user";
import {
    type StudentDetail,
    type UpdateStudentPayload,
} from "../../../../types/interfaces/i-student";
import { useAssetUpload } from "../../../../hooks/useAsset";

/* ─────────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────────── */
interface AddressData {
    addressLine1: string;
    addressLine2?: string | null;
    country?: string | null;
    state: string;
    lga?: string | null;
}

interface StudentDetailWithAddress extends StudentDetail {
    address?: AddressData;
    photoUrl?: string | null;
    guardianId?: string | null;
    guardianFirstName?: string | null;
    guardianLastName?: string | null;
    guardianRelationship?: string | number | null;
}

interface GuardianOption {
    id: string;
    label: string;
    firstName: string;
    lastName: string;
}

interface EditStudentDrawerProps {
    open: boolean;
    onClose: () => void;
    studentId: string | null;
    onSuccess: () => void;
}

const PARENT_ROLE_VALUE = 3;

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
    const fileInputRef = useRef<HTMLInputElement>(null);

    const hasLoadedStudentRef = useRef(false);
    const currentStudentIdRef = useRef<string | null>(null);

    const {
        upload,
        isUploading: isPhotoUploading,
        uploadProgress,
        error: uploadError,
        clearError: clearUploadError,
    } = useAssetUpload(selectedAccount);

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

    /* ── Guardian state ── */
    const [guardians, setGuardians] = useState<GuardianOption[]>([]);
    const [isLoadingGuardians, setIsLoadingGuardians] = useState(false);
    const [selectedGuardianId, setSelectedGuardianId] = useState<string>("");
    const [guardianRelationship, setGuardianRelationship] =
        useState<string>("");
    const [guardianFallback, setGuardianFallback] = useState<{
        firstName: string;
        lastName: string;
    } | null>(null);

    /* ── Photo state ── */
    const [uploadedPhotoAssetId, setUploadedPhotoAssetId] = useState<
        string | null
    >(null);
    const [hasPhotoChanged, setHasPhotoChanged] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [dotCount, setDotCount] = useState(0);

    /* ─────────────────────────────────────────────────────────
       Derived — guardian currently assigned (list + fallback)
       ───────────────────────────────────────────────────────── */
    const selectedGuardian = useMemo<GuardianOption | undefined>(() => {
        const fromList = guardians.find((g) => g.id === selectedGuardianId);
        if (fromList) return fromList;

        if (selectedGuardianId && guardianFallback) {
            return {
                id: selectedGuardianId,
                firstName: guardianFallback.firstName,
                lastName: guardianFallback.lastName,
                label: `${guardianFallback.firstName} ${guardianFallback.lastName}`.trim(),
            };
        }
        return undefined;
    }, [guardians, selectedGuardianId, guardianFallback]);

    /** Guardians list for the dropdown, including the fallback if missing */
    const guardianOptions = useMemo<GuardianOption[]>(() => {
        if (
            selectedGuardianId &&
            !guardians.some((g) => g.id === selectedGuardianId) &&
            guardianFallback
        ) {
            return [
                {
                    id: selectedGuardianId,
                    firstName: guardianFallback.firstName,
                    lastName: guardianFallback.lastName,
                    label: `${guardianFallback.firstName} ${guardianFallback.lastName}`.trim(),
                },
                ...guardians,
            ];
        }
        return guardians;
    }, [guardians, selectedGuardianId, guardianFallback]);

    /* ─────────────────────────────────────────────────────────
       Animated dots
       ───────────────────────────────────────────────────────── */
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
        if (!open) setDotCount(0);
    }, [open]);

    /* ─────────────────────────────────────────────────────────
       Reset state when drawer closes
       ───────────────────────────────────────────────────────── */
    useEffect(() => {
        if (!open) {
            setStudentData(null);
            setStudentPhotoUrl(null);
            setSelectedClass(null);
            setAlertMessage({});
            setFormFields([]);
            setUploadedPhotoAssetId(null);
            setHasPhotoChanged(false);
            setSelectedGuardianId("");
            setGuardianRelationship("");
            setGuardianFallback(null);
            hasLoadedStudentRef.current = false;
            currentStudentIdRef.current = null;

            if (clearUploadError) clearUploadError();
        }
    }, [open]);

    /* ─────────────────────────────────────────────────────────
       File selection & upload
       ───────────────────────────────────────────────────────── */
    const handleFileSelect = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const validTypes = [
            "image/jpeg",
            "image/png",
            "image/jpg",
            "image/webp",
        ];
        if (!validTypes.includes(file.type)) {
            setAlertMessage({
                feMessage:
                    "Invalid file type. Please upload JPG, PNG, or WEBP images only.",
                httpStatus: 400,
            });
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setAlertMessage({
                feMessage: "File too large. Maximum size is 5MB.",
                httpStatus: 400,
            });
            return;
        }

        setHasPhotoChanged(true);
        clearUploadError();

        const previewUrl = URL.createObjectURL(file);
        setStudentPhotoUrl(previewUrl);

        setAlertMessage({ feMessage: "Uploading new profile picture..." });

        const result = await upload(file);

        if (result) {
            setUploadedPhotoAssetId(result.fileId);
            const successMessage =
                "Profile picture uploaded successfully! Click Update Student to save changes.";
            setAlertMessage({ feMessage: successMessage });

            setTimeout(() => {
                setAlertMessage((prev) => {
                    if (prev.feMessage === successMessage) return {};
                    return prev;
                });
            }, 3000);
        } else {
            setStudentPhotoUrl(studentData?.photoUrl || null);
            setAlertMessage({
                feMessage: "Failed to upload profile picture",
                httpStatus: 500,
            });
        }

        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleRemovePhoto = () => {
        setHasPhotoChanged(true);
        setUploadedPhotoAssetId(null);
        setStudentPhotoUrl(null);
        const removalMessage =
            "Photo will be removed when you update the student";
        setAlertMessage({ feMessage: removalMessage });
        setTimeout(() => {
            setAlertMessage((prev) => {
                if (prev.feMessage === removalMessage) return {};
                return prev;
            });
        }, 2000);
    };

    const handleAvatarClick = () => {
        if (!isPhotoUploading && !isSubmitting) {
            fileInputRef.current?.click();
        }
    };

    /* ─────────────────────────────────────────────────────────
       Load branches
       ───────────────────────────────────────────────────────── */
    useEffect(() => {
        const loadBranches = async () => {
            if (selectedAccount) {
                setIsLoadingBranches(true);
                try {
                    const fetchedBranches = await fetchBranches(
                        selectedAccount,
                        apiClient
                    );
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

    /* ─────────────────────────────────────────────────────────
       Load classes
       ───────────────────────────────────────────────────────── */
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

    /* ─────────────────────────────────────────────────────────
       Load guardians (parents only)
       ───────────────────────────────────────────────────────── */
    useEffect(() => {
        const loadGuardians = async () => {
            if (!selectedAccount || !open) return;

            setIsLoadingGuardians(true);
            try {
                const { items } = await fetchUsers(
                    selectedAccount,
                    1,
                    500,
                    String(PARENT_ROLE_VALUE)
                );

                const mapped: GuardianOption[] = (items || []).map((u: any) => ({
                    id: u.id,
                    firstName: u.firstName || "",
                    lastName: u.lastName || "",
                    label: `${u.firstName || ""} ${u.lastName || ""}`.trim(),
                }));

                setGuardians(mapped);
            } catch (err) {
                console.error("Failed to load guardians:", err);
            } finally {
                setIsLoadingGuardians(false);
            }
        };

        loadGuardians();
    }, [selectedAccount, open]);

    /* ─────────────────────────────────────────────────────────
       Load student data
       ───────────────────────────────────────────────────────── */
    useEffect(() => {
        const loadStudentData = async () => {
            const shouldLoad =
                open &&
                studentId &&
                selectedAccount &&
                enums &&
                !hasLoadedStudentRef.current;

            if (!shouldLoad) return;

            if (currentStudentIdRef.current !== studentId) {
                hasLoadedStudentRef.current = false;
                currentStudentIdRef.current = studentId;
            }

            setLoading(true);
            setAlertMessage({});

            try {
                const student: StudentDetailWithAddress = await getStudentById(
                    selectedAccount,
                    studentId
                );

                setStudentPhotoUrl(student.photoUrl || null);

                const genderEnum = enums?.Gender?.find(
                    (g: any) =>
                        g.displayName === student.gender ||
                        g.name === student.gender
                );

                const statusEnum = enums?.StudentStatus?.find(
                    (s: any) =>
                        s.displayName === student.status ||
                        s.name === student.status
                );

                const formattedAddress = student.address
                    ? {
                        addressLine1: student.address.addressLine1 || "",
                        lga: student.address.lga || "",
                        country: student.address.country || "",
                        state: student.address.state || "",
                    }
                    : {
                        addressLine1: "",
                        lga: "",
                        country: "",
                        state: "",
                    };

                /* ── Resolve the guardian relationship ──
                   BE may return a number OR a string name ("Mother").
                   Normalize to a numeric string so the dropdown
                   preselects correctly. */
                const relationshipValue = (() => {
                    if (student.guardianRelationship == null) return "";

                    if (typeof student.guardianRelationship === "number") {
                        return student.guardianRelationship.toString();
                    }

                    // Numeric string?
                    if (/^\d+$/.test(student.guardianRelationship)) {
                        return student.guardianRelationship;
                    }

                    // String name — look it up in the enum list
                    const match = (
                        enums?.GuardianStudentRelationship || []
                    ).find(
                        (r: any) =>
                            r.name === student.guardianRelationship ||
                            r.displayName === student.guardianRelationship
                    );

                    return match ? match.value.toString() : "";
                })();

                const formattedData = {
                    id: student.id,
                    firstName: student.firstName,
                    lastName: student.lastName,
                    dateOfBirth: student.dateOfBirth?.split("T")[0] || "",
                    gender: genderEnum?.value?.toString() || "",
                    schoolId: student.schoolId || "",
                    classId: student.classRoomId || "",
                    status: statusEnum?.value?.toString() || "",
                    address: formattedAddress,
                    photoUrl: student.photoUrl,
                    guardianId: student.guardianId || "",
                    guardianRelationship: relationshipValue,
                };

                setStudentData(formattedData);

                // Prefill guardian state
                setSelectedGuardianId(student.guardianId || "");
                setGuardianRelationship(relationshipValue);

                // Fallback name from the BE response so the name shows even
                // if the guardian isn't in the fetched parents list.
                if (student.guardianFirstName || student.guardianLastName) {
                    setGuardianFallback({
                        firstName: student.guardianFirstName || "",
                        lastName: student.guardianLastName || "",
                    });
                } else {
                    setGuardianFallback(null);
                }

                if (student.classRoomId) {
                    const studentClass = classes.find(
                        (c) => c.id === student.classRoomId
                    );
                    setSelectedClass(studentClass || null);
                }

                hasLoadedStudentRef.current = true;
            } catch (error) {
                console.error("Error loading student data:", error);
                setAlertMessage({
                    feMessage: "Failed to load student data.",
                    httpStatus: 500,
                });
            } finally {
                setLoading(false);
            }
        };

        loadStudentData();
    }, [open, studentId, selectedAccount, enums, classes]);

    /* ─────────────────────────────────────────────────────────
       Build form fields
       ───────────────────────────────────────────────────────── */
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
                    options: classes.map((cls) => ({
                        value: cls.id,
                        label: cls.name,
                    })),
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
                required: true,
                colSpan: 2,
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

    /* ─────────────────────────────────────────────────────────
       Submit
       ───────────────────────────────────────────────────────── */
    const handleSubmit = async (data: any) => {
        try {
            setIsSubmitting(true);
            setAlertMessage({ feMessage: "Updating student data..." });

            const genderValue = data.gender ? parseInt(data.gender) : 0;
            const statusValue = data.status ? parseInt(data.status) : 0;
            const streamTypeValue = data.streamType
                ? parseInt(data.streamType)
                : null;

            const formattedAddress = data.address
                ? {
                    AddressLine1: data.address.addressLine1 || "",
                    State: data.address.state || "",
                    Country: data.address.country || "",
                    Lga: data.address.lga || "",
                }
                : undefined;

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

                // ── Guardian info ──
                GuardianId: selectedGuardianId || null,
                GuardianRelationship: guardianRelationship
                    ? parseInt(guardianRelationship)
                    : null,

                ...(hasPhotoChanged && {
                    PhotoAssetId: uploadedPhotoAssetId || null,
                }),
            };

            const response = await updateStudent(
                selectedAccount!,
                studentId!,
                payload
            );

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
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setAlertMessage({});
        setStudentData(null);
        setStudentPhotoUrl(null);
        setSelectedClass(null);
        setFormFields([]);
        setUploadedPhotoAssetId(null);
        setHasPhotoChanged(false);
        setSelectedGuardianId("");
        setGuardianRelationship("");
        setGuardianFallback(null);
        if (clearUploadError) clearUploadError();
        hasLoadedStudentRef.current = false;
        currentStudentIdRef.current = null;
        onClose();
    };

    const getInitials = () => {
        if (studentData?.firstName && studentData?.lastName) {
            return `${studentData.firstName.charAt(0)}${studentData.lastName.charAt(0)}`.toUpperCase();
        }
        return "?";
    };

    const isReady =
        !isEnumsLoading &&
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

    const isSubmitDisabled = isPhotoUploading || isSubmitting;

    /* ─────────────────────────────────────────────────────────
       Render
       ───────────────────────────────────────────────────────── */
    return (
        <Drawer
            anchor="right"
            open={open}
            onClose={handleClose}
            PaperProps={{
                sx: {
                    width: "100%",
                    "@media (min-width: 1024px)": { width: "50%" },
                    "@media (min-width: 1440px)": { width: "40%" },
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
                style={{ display: "none" }}
                onChange={handleFileSelect}
            />

            <Fade in={open} timeout={300}>
                <Box>
                    {/* ═══ Header ═══ */}
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

                    {/* ═══ Messages ═══ */}
                    {alertMessage.feMessage && (
                        <Box sx={{ mb: 3 }}>
                            <MessageDisplay
                                feMessage={alertMessage.feMessage}
                                beMessage={alertMessage.beMessage}
                                httpStatus={alertMessage.httpStatus}
                            />
                        </Box>
                    )}

                    {uploadError && (
                        <Box sx={{ mb: 3 }}>
                            <MessageDisplay
                                feMessage="Upload Error"
                                beMessage={uploadError}
                                httpStatus={500}
                            />
                        </Box>
                    )}

                    {/* ═══ Student Avatar ═══ */}
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
                            <Box
                                sx={{
                                    position: "relative",
                                    cursor:
                                        isPhotoUploading || isSubmitting
                                            ? "not-allowed"
                                            : "pointer",
                                    "&:hover": { "& .edit-overlay": { opacity: 1 } },
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
                                        src={studentPhotoUrl || undefined}
                                        alt={`${studentData?.firstName || ""} ${studentData?.lastName || ""}`}
                                        sx={{
                                            width: { xs: 100, sm: 120 },
                                            height: { xs: 100, sm: 120 },
                                            fontSize: { xs: "2.5rem", sm: "3rem" },
                                            bgcolor: studentPhotoUrl
                                                ? "transparent"
                                                : theme.palette.primary.main,
                                            color: "white",
                                            fontWeight: 600,
                                            transition: "opacity 0.3s",
                                        }}
                                    >
                                        {!studentPhotoUrl && getInitials()}
                                    </Avatar>

                                    {/* Edit overlay */}
                                    <Box
                                        className="edit-overlay"
                                        sx={{
                                            position: "absolute",
                                            inset: 0,
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
                                                inset: 0,
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
                                            <Typography variant="caption" sx={{ color: "white" }}>
                                                {uploadProgress}%
                                            </Typography>
                                        </Box>
                                    )}
                                </Paper>

                                {studentPhotoUrl && !isPhotoUploading && (
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
                                            "&:hover": { bgcolor: theme.palette.error.dark },
                                            width: 28,
                                            height: 28,
                                            "& .MuiSvgIcon-root": { fontSize: 16 },
                                        }}
                                    >
                                        <IconifyIcon icon="mdi:delete" width={16} />
                                    </IconButton>
                                )}
                            </Box>
                        </Box>
                    </Grow>

                    {/* ═══════════════════════════════════════════
                        Guardian Information
                       ═══════════════════════════════════════════ */}
                    {isReady && (
                        <Paper
                            elevation={0}
                            sx={{
                                p: { xs: 2, sm: 2.5 },
                                mb: 3,
                                borderRadius: 2,
                                border: `1px solid ${alpha(theme.palette.divider, 0.12)}`,
                                bgcolor: alpha(theme.palette.primary.main, 0.02),
                            }}
                        >
                            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                <Box
                                    sx={{
                                        width: 32,
                                        height: 32,
                                        borderRadius: 1.5,
                                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        flexShrink: 0,
                                    }}
                                >
                                    <IconifyIcon
                                        icon="mdi:account-heart-outline"
                                        width={18}
                                        color={theme.palette.primary.main}
                                    />
                                </Box>
                                <Box>
                                    <Typography
                                        variant="subtitle2"
                                        fontWeight={700}
                                        sx={{ color: theme.palette.text.primary }}
                                    >
                                        Guardian Information
                                    </Typography>
                                    <Typography
                                        variant="caption"
                                        sx={{ color: theme.palette.text.secondary }}
                                    >
                                        Assign a parent or guardian to this student
                                    </Typography>
                                </Box>
                            </Stack>

                            <Stack spacing={2}>
                                {/* Guardian dropdown */}
                                <FormControl fullWidth size="small">
                                    <InputLabel id="guardian-select-label">Guardian</InputLabel>
                                    <Select
                                        labelId="guardian-select-label"
                                        label="Guardian"
                                        value={selectedGuardianId}
                                        onChange={(e) => setSelectedGuardianId(e.target.value)}
                                        disabled={isLoadingGuardians}
                                        MenuProps={{
                                            PaperProps: {
                                                style: {
                                                    maxHeight: 320,
                                                    backgroundColor: theme.palette.background.default,
                                                },
                                            },
                                        }}
                                        renderValue={(selected) => {
                                            if (!selected) {
                                                return (
                                                    <span
                                                        style={{
                                                            color: theme.palette.text.secondary,
                                                            fontStyle: "italic",
                                                        }}
                                                    >
                                                        {isLoadingGuardians
                                                            ? "Loading guardians..."
                                                            : guardianOptions.length === 0
                                                                ? "No parents available"
                                                                : "Select a guardian"}
                                                    </span>
                                                );
                                            }
                                            const g = guardianOptions.find((x) => x.id === selected);
                                            return g?.label || selected;
                                        }}
                                    >
                                        {guardianOptions.length === 0 ? (
                                            <MenuItem value="" disabled>
                                                <em>No parents found</em>
                                            </MenuItem>
                                        ) : (
                                            guardianOptions.map((g) => (
                                                <MenuItem key={g.id} value={g.id}>
                                                    {g.label}
                                                </MenuItem>
                                            ))
                                        )}
                                    </Select>
                                </FormControl>

                                {/* Relationship dropdown */}
                                <FormControl fullWidth size="small">
                                    <InputLabel id="relationship-select-label">
                                        Relationship
                                    </InputLabel>
                                    <Select
                                        labelId="relationship-select-label"
                                        label="Relationship"
                                        value={guardianRelationship}
                                        onChange={(e) => setGuardianRelationship(e.target.value)}
                                        renderValue={(selected) => {
                                            if (!selected) {
                                                return (
                                                    <span
                                                        style={{
                                                            color: theme.palette.text.secondary,
                                                            fontStyle: "italic",
                                                        }}
                                                    >
                                                        Select relationship
                                                    </span>
                                                );
                                            }
                                            const opt = (
                                                enums?.GuardianStudentRelationship || []
                                            ).find((r: any) => r.value.toString() === selected);
                                            return opt?.displayName || opt?.name || selected;
                                        }}
                                    >
                                        {(enums?.GuardianStudentRelationship || []).map((r: any) => (
                                            <MenuItem key={r.value} value={r.value.toString()}>
                                                {r.displayName || r.name}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                {/* Readonly First / Last Name */}
                                <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Guardian First Name"
                                        value={selectedGuardian?.firstName || ""}
                                        InputProps={{ readOnly: true }}
                                        sx={{
                                            "& .MuiInputBase-input": {
                                                color: theme.palette.text.secondary,
                                            },
                                        }}
                                    />
                                    <TextField
                                        fullWidth
                                        size="small"
                                        label="Guardian Last Name"
                                        value={selectedGuardian?.lastName || ""}
                                        InputProps={{ readOnly: true }}
                                        sx={{
                                            "& .MuiInputBase-input": {
                                                color: theme.palette.text.secondary,
                                            },
                                        }}
                                    />
                                </Stack>
                            </Stack>
                        </Paper>
                    )}

                    <Divider sx={{ mb: 3 }} />

                    {/* ═══ Form ═══ */}
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
                                        submitButtonText={
                                            isPhotoUploading
                                                ? "Uploading Photo..."
                                                : isSubmitting
                                                    ? "Updating Student..."
                                                    : "Update Student"
                                        }
                                        columns={2}
                                        initialValues={studentData}
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

export default EditStudentDrawer;