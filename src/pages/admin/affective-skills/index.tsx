import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    CircularProgress,
    Divider,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Typography,
    Button,
    Avatar,
    Chip,
    useMediaQuery,
    useTheme,
} from "@mui/material";
import SaveIcon from "@mui/icons-material/Save";
import SchoolIcon from "@mui/icons-material/School";
import PersonIcon from "@mui/icons-material/Person";
import { useAuth } from "../../../context";
import { useEnums } from "../../../hooks/useEnums";
import { fetchClasses } from "../../../api/classServices";
import {
    fetchClassAffectiveSkills,
    bulkSaveAffectiveSkills,
} from "../../../api/studentService";
import MessageDisplay from "../../../components/message-display";

// ---------- Types ----------
interface ClassOption {
    id: string;
    name: string;
}

interface StudentRow {
    studentId: string;
    name: string;
    conduct: number | null;
    attitude: number | null;
    interest: number | null;
}

interface EnumOption {
    value: number;
    label: string;
}

const AffectiveSkills: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const { selectedAccount } = useAuth();
    const { enums, isLoading: isEnumsLoading } = useEnums({
        fetchPermissionData: false,
    });

    // ---------- State ----------
    const [classes, setClasses] = useState<ClassOption[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [students, setStudents] = useState<StudentRow[]>([]);

    const [isLoadingClasses, setIsLoadingClasses] = useState(true);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const [alertMessage, setAlertMessage] = useState<{
        feMessage?: string;
        beMessage?: string;
        httpStatus?: number;
    }>({});

    // ---------- Derived enum options ----------
    const conductOptions: EnumOption[] = useMemo(() => {
        const list = enums?.ConductRating ?? [];
        return list.map((e: any) => ({
            value: Number(e.value),
            label: e.displayName || e.name,
        }));
    }, [enums]);

    const attitudeOptions: EnumOption[] = useMemo(() => {
        const list = enums?.AttitudeRating ?? [];
        return list.map((e: any) => ({
            value: Number(e.value),
            label: e.displayName || e.name,
        }));
    }, [enums]);

    const interestOptions: EnumOption[] = useMemo(() => {
        const list = enums?.InterestRating ?? [];
        return list.map((e: any) => ({
            value: Number(e.value),
            label: e.displayName || e.name,
        }));
    }, [enums]);

    // ---------- Load classes on mount ----------
    useEffect(() => {
        const loadClasses = async () => {
            if (!selectedAccount) return;
            setIsLoadingClasses(true);
            try {
                const fetched = await fetchClasses(selectedAccount);
                const mapped: ClassOption[] = fetched.map((c: any) => ({
                    id: c.id,
                    name: c.className,
                }));
                setClasses(mapped);

                // Select first class by default
                if (mapped.length > 0) {
                    setSelectedClassId(mapped[0].id);
                }
            } catch (err: any) {
                setAlertMessage({
                    feMessage: "Failed to load classes.",
                    beMessage: err?.message,
                    httpStatus: err?.status || 500,
                });
            } finally {
                setIsLoadingClasses(false);
            }
        };
        loadClasses();
    }, [selectedAccount]);

    // ---------- Load students + their existing affective skills ----------
    useEffect(() => {
        const loadStudents = async () => {
            if (!selectedAccount || !selectedClassId) {
                setStudents([]);
                return;
            }
            setIsLoadingStudents(true);
            setAlertMessage({});
            try {
                const fetched = await fetchClassAffectiveSkills(
                    selectedAccount,
                    selectedClassId
                );
                setStudents(
                    fetched.map((s) => ({
                        studentId: s.studentId,
                        name: s.name,
                        conduct: s.conduct,
                        attitude: s.attitude,
                        interest: s.interest,
                    }))
                );
            } catch (err: any) {
                setAlertMessage({
                    feMessage: "Failed to load students for this class.",
                    beMessage: err?.message,
                    httpStatus: err?.status || 500,
                });
                setStudents([]);
            } finally {
                setIsLoadingStudents(false);
            }
        };
        loadStudents();
    }, [selectedAccount, selectedClassId]);

    // ---------- Handlers ----------
    const handleClassChange = (classId: string) => {
        setSelectedClassId(classId);
    };

    const updateStudentField = (
        studentId: string,
        field: "conduct" | "attitude" | "interest",
        value: number | null
    ) => {
        setStudents((prev) =>
            prev.map((s) =>
                s.studentId === studentId ? { ...s, [field]: value } : s
            )
        );
    };

    const handleSaveAll = async () => {
        if (!selectedAccount) return;
        if (students.length === 0) {
            setAlertMessage({ feMessage: "No students to save.", httpStatus: 400 });
            return;
        }

        setIsSaving(true);
        setAlertMessage({ feMessage: "Saving..." });

        try {
            const payload = {
                students: students.map((s) => ({
                    studentId: s.studentId,
                    conduct: s.conduct,
                    attitude: s.attitude,
                    interest: s.interest,
                })),
            };

            const response = await bulkSaveAffectiveSkills(selectedAccount, payload);

            setAlertMessage({
                feMessage: `Saved ${response?.total ?? students.length} student${(response?.total ?? students.length) === 1 ? "" : "s"
                    } successfully!`,
                httpStatus: 200,
            });

            setTimeout(() => setAlertMessage({}), 3000);
        } catch (err: any) {
            setAlertMessage({
                feMessage: "Failed to save affective skills.",
                beMessage: err?.message,
                httpStatus: err?.status || 500,
            });
        } finally {
            setIsSaving(false);
        }
    };

    // ---------- Render helpers ----------
    const renderDropdown = (
        student: StudentRow,
        field: "conduct" | "attitude" | "interest",
        label: string,
        options: EnumOption[],
        value: number | null
    ) => (
        <FormControl fullWidth size="small">
            <InputLabel>{label}</InputLabel>
            <Select
                label={label}
                value={value === null ? "" : String(value)}
                onChange={(e) => {
                    const raw = e.target.value as string;
                    updateStudentField(
                        student.studentId,
                        field,
                        raw === "" ? null : Number(raw)
                    );
                }}
            >
                <MenuItem value="">
                    <em>—</em>
                </MenuItem>
                {options.map((o) => (
                    <MenuItem key={o.value} value={String(o.value)}>
                        {o.label}
                    </MenuItem>
                ))}
            </Select>
        </FormControl>
    );

    const renderStudentRow = (student: StudentRow, index: number) => (
        <Paper
            key={student.studentId}
            elevation={0}
            sx={{
                p: { xs: 1.5, sm: 2 },
                mb: 1.5,
                borderRadius: 2,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: "background.default",
                transition: "box-shadow 0.2s",
                "&:hover": { boxShadow: 2 },
            }}
        >
            <Stack
                direction={isMobile ? "column" : "row"}
                spacing={2}
                alignItems={isMobile ? "stretch" : "center"}
            >
                {/* Student name */}
                <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    sx={{
                        minWidth: isMobile ? "auto" : 200,
                        flex: isMobile ? "none" : "0 0 200px",
                    }}
                >
                    <Avatar
                        sx={{
                            width: 32,
                            height: 32,
                            bgcolor: "primary.main",
                            fontSize: 14,
                        }}
                    >
                        <PersonIcon fontSize="small" />
                    </Avatar>
                    <Typography
                        variant="body2"
                        fontWeight={600}
                        sx={{ wordBreak: "break-word", fontSize: isMobile ? 14 : 16, color: theme.palette.text.secondary }}
                    >
                        {student.name}
                    </Typography>
                </Stack>

                {/* Dropdowns */}
                <Box
                    sx={{
                        flex: 1,
                        display: "grid",
                        gridTemplateColumns: {
                            xs: "1fr",
                            sm: "1fr 1fr 1fr",
                        },
                        gap: 1.5,
                    }}
                >
                    {renderDropdown(student, "conduct", "Conduct", conductOptions, student.conduct)}
                    {renderDropdown(student, "attitude", "Attitude", attitudeOptions, student.attitude)}
                    {renderDropdown(student, "interest", "Interest", interestOptions, student.interest)}
                </Box>
            </Stack>
        </Paper>
    );

    const isLoadingAnything =
        isLoadingClasses || isLoadingStudents || isEnumsLoading;

    // ---------- Render ----------
    return (
        <Box
            sx={{
                width: "100%",
                px: { xs: 2, sm: 3, md: 4 },
                py: { xs: 2, sm: 4 },
            }}
        >
            {/* Header */}
            <Card
                elevation={0}
                sx={{
                    mb: 3,
                    borderRadius: 3,
                    backgroundColor: "primary.main",
                    color: "primary.contrastText",
                }}
            >
                <CardContent>
                    <Stack
                        direction={isMobile ? "column" : "row"}
                        spacing={2}
                        alignItems={isMobile ? "flex-start" : "center"}
                        justifyContent="space-between"
                    >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)" }}>
                                <SchoolIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight={700}>
                                    Affective Skills
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    Set Conduct, Attitude & Interest for each student
                                </Typography>
                            </Box>
                        </Stack>

                        <Chip
                            label={`${students.length} student${students.length === 1 ? "" : "s"
                                }`}
                            sx={{
                                bgcolor: "rgba(255,255,255,0.2)",
                                color: "inherit",
                                fontWeight: 600,
                            }}
                        />
                    </Stack>
                </CardContent>
            </Card>

            {/* Alerts */}
            <MessageDisplay
                feMessage={alertMessage.feMessage}
                beMessage={alertMessage.beMessage}
                httpStatus={alertMessage.httpStatus}
            />

            {/* Class selector */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    bgcolor: "background.default",
                }}
            >
                <Stack
                    direction={isMobile ? "column" : "row"}
                    spacing={2}
                    alignItems={isMobile ? "stretch" : "center"}
                >
                    <FormControl
                        fullWidth
                        size="small"
                        sx={{ maxWidth: isMobile ? "100%" : 400 }}
                    >
                        <InputLabel>Class</InputLabel>
                        <Select
                            label="Class"
                            value={selectedClassId}
                            onChange={(e) => handleClassChange(e.target.value as string)}
                            disabled={isLoadingClasses || classes.length === 0}
                        >
                            {classes.length === 0 ? (
                                <MenuItem value="" disabled>
                                    No classes available
                                </MenuItem>
                            ) : (
                                classes.map((c) => (
                                    <MenuItem key={c.id} value={c.id}>
                                        {c.name}
                                    </MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>

                    <Button
                        variant="contained"
                        startIcon={
                            isSaving ? (
                                <CircularProgress size={18} color="inherit" />
                            ) : (
                                <SaveIcon />
                            )
                        }
                        onClick={handleSaveAll}
                        disabled={isSaving || students.length === 0}
                        sx={{
                            minWidth: 160,
                            textTransform: "none",
                            borderRadius: 2,
                            fontWeight: 600,
                        }}
                    >
                        {isSaving ? "Saving..." : "Save All"}
                    </Button>
                </Stack>
            </Paper>

            {/* Loading spinner */}
            {isLoadingAnything && (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                </Box>
            )}

            {/* Empty state */}
            {!isLoadingAnything && students.length === 0 && selectedClassId && (
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        textAlign: "center",
                        borderRadius: 2,
                        border: "1px dashed",
                        borderColor: "divider",
                        bgcolor: "background.default",
                    }}
                >
                    <Typography color="text.secondary">
                        No students found in this class.
                    </Typography>
                </Paper>
            )}

            {/* Students list */}
            {!isLoadingAnything && students.length > 0 && (
                <>
                    {/* Column headers (desktop only) */}
                    {!isMobile && (
                        <Stack
                            direction="row"
                            spacing={2}
                            sx={{
                                px: 2,
                                mb: 1,
                                color: "text.muted",
                                fontSize: 12,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: 0.5,
                            }}
                        >
                            <Box sx={{ flex: "0 0 200px" }}>Student</Box>
                            <Box
                                sx={{
                                    flex: 1,
                                    display: "grid",
                                    gridTemplateColumns: "1fr 1fr 1fr",
                                    gap: 1.5,
                                }}
                            >
                                <Box>Conduct</Box>
                                <Box>Attitude</Box>
                                <Box>Interest</Box>
                            </Box>
                        </Stack>
                    )}

                    <Box>{students.map((s, i) => renderStudentRow(s, i))}</Box>

                    <Divider sx={{ my: 2 }} />

                    {/* Bottom save button (mobile-friendly) */}
                    <Stack direction="row" justifyContent="flex-end">
                        <Button
                            variant="contained"
                            startIcon={
                                isSaving ? (
                                    <CircularProgress size={18} color="inherit" />
                                ) : (
                                    <SaveIcon />
                                )
                            }
                            onClick={handleSaveAll}
                            disabled={isSaving || students.length === 0}
                            sx={{
                                textTransform: "none",
                                borderRadius: 2,
                                fontWeight: 600,
                                minWidth: 160,
                            }}
                        >
                            {isSaving ? "Saving..." : "Save All"}
                        </Button>
                    </Stack>
                </>
            )}
        </Box>
    );
};

export default AffectiveSkills;