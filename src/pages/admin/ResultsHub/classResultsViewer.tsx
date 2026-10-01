import React, { useEffect, useMemo, useState } from "react";
import {
    Box, Button, Card, CardContent, Checkbox, CircularProgress, Divider,
    FormControl, FormControlLabel, InputLabel, MenuItem, Paper, Select,
    Stack, Typography, Avatar, Chip, Tooltip, useMediaQuery, useTheme,
} from "@mui/material";
import AssessmentIcon from "@mui/icons-material/Assessment";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PersonIcon from "@mui/icons-material/Person";
import { useAuth } from "../../../context";
import { useEnums } from "../../../hooks/useEnums";
import { fetchClasses } from "../../../api/classServices";
import { fetchClassAffectiveSkills } from "../../../api/studentService";
import { printClassTerminalReports } from "../../../api/resultService";
import MessageDisplay from "../../../components/message-display";
import ReportPreviewDialog from "../../../components/ReportPreviewDialog";

interface ClassOption {
    id: string;
    name: string;
}

interface StudentRow {
    studentId: string;
    name: string;
    selected: boolean;
}

const ClassResultsViewer: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const { selectedAccount } = useAuth();
    const { enums, isLoading: isEnumsLoading } = useEnums({
        fetchPermissionData: false,
    });

    const [classes, setClasses] = useState<ClassOption[]>([]);
    const [selectedClassId, setSelectedClassId] = useState<string>("");
    const [students, setStudents] = useState<StudentRow[]>([]);

    const [schoolSession, setSchoolSession] = useState<number>(0);
    const [schoolTerm, setSchoolTerm] = useState<number>(0);

    const [isLoadingClasses, setIsLoadingClasses] = useState(true);
    const [isLoadingStudents, setIsLoadingStudents] = useState(false);
    const [isLoadingPreview, setIsLoadingPreview] = useState(false);

    // Dialog state
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
    const [previewTitle, setPreviewTitle] = useState("Report Preview");

    const [alertMessage, setAlertMessage] = useState<{
        feMessage?: string;
        beMessage?: string;
        httpStatus?: number;
    }>({});

    // ---------- Enum options ----------
    const sessionOptions = useMemo(() => {
        const list = enums?.SchoolSessions ?? [];
        return list.map((e: any) => ({
            value: Number(e.value),
            label: e.displayName || e.name,
        }));
    }, [enums]);

    const termOptions = useMemo(() => {
        const list = enums?.SchoolTerms ?? [];
        return list.map((e: any) => ({
            value: Number(e.value),
            label: e.displayName || e.name,
        }));
    }, [enums]);

    useEffect(() => {
        if (sessionOptions.length > 0 && schoolSession === 0) {
            setSchoolSession(sessionOptions[sessionOptions.length - 1].value);
        }
        if (termOptions.length > 0 && schoolTerm === 0) {
            setSchoolTerm(termOptions[0].value);
        }
    }, [sessionOptions, termOptions, schoolSession, schoolTerm]);

    // ---------- Load classes ----------
    useEffect(() => {
        const load = async () => {
            if (!selectedAccount) return;
            setIsLoadingClasses(true);
            try {
                const fetched = await fetchClasses(selectedAccount);
                const mapped: ClassOption[] = fetched.map((c: any) => ({
                    id: c.id,
                    name: c.className,
                }));
                setClasses(mapped);
                if (mapped.length > 0) setSelectedClassId(mapped[0].id);
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
        load();
    }, [selectedAccount]);

    // ---------- Load students ----------
    useEffect(() => {
        const load = async () => {
            if (!selectedAccount || !selectedClassId) {
                setStudents([]);
                return;
            }
            setIsLoadingStudents(true);
            setAlertMessage({});
            try {
                const fetched = await fetchClassAffectiveSkills(selectedAccount, selectedClassId);
                setStudents(
                    fetched.map((s) => ({
                        studentId: s.studentId,
                        name: s.name,
                        selected: true,
                    }))
                );
            } catch (err: any) {
                setAlertMessage({
                    feMessage: "Failed to load students.",
                    beMessage: err?.message,
                    httpStatus: err?.status || 500,
                });
                setStudents([]);
            } finally {
                setIsLoadingStudents(false);
            }
        };
        load();
    }, [selectedAccount, selectedClassId]);

    // ---------- Selection ----------
    const toggleStudent = (studentId: string) => {
        setStudents((prev) =>
            prev.map((s) =>
                s.studentId === studentId ? { ...s, selected: !s.selected } : s
            )
        );
    };

    const toggleAll = (checked: boolean) => {
        setStudents((prev) => prev.map((s) => ({ ...s, selected: checked })));
    };

    const selectedCount = students.filter((s) => s.selected).length;

    // ---------- Preview helpers ----------
    const openPreview = (blob: Blob, title: string) => {
        // If a previous preview exists, revoke it
        if (previewBlob) {
            // Note: ReportPreviewDialog also revokes internally on close,
            // so this is just a safety net for repeated previews.
        }
        setPreviewBlob(blob);
        setPreviewTitle(title);
        setPreviewOpen(true);
    };

    const handlePreviewOne = async (student: StudentRow) => {
        if (!selectedAccount) return;
        if (!schoolSession || !schoolTerm) {
            setAlertMessage({ feMessage: "Select a session and term first.", httpStatus: 400 });
            return;
        }

        setIsLoadingPreview(true);
        setAlertMessage({ feMessage: `Preparing report for ${student.name}...` });

        try {
            const blob = await printClassTerminalReports(selectedAccount, {
                classId: selectedClassId,
                schoolSession,
                schoolTerm,
                studentIds: [student.studentId],
            });

            openPreview(blob, `${student.name} — Terminal Report`);
            setAlertMessage({});
        } catch (err: any) {
            setAlertMessage({
                feMessage: "Failed to generate report.",
                beMessage: err?.message,
                httpStatus: err?.status || 500,
            });
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const handlePreviewBatch = async () => {
        if (!selectedAccount || !selectedClassId) return;
        if (!schoolSession || !schoolTerm) {
            setAlertMessage({ feMessage: "Select a session and term first.", httpStatus: 400 });
            return;
        }
        if (selectedCount === 0) {
            setAlertMessage({ feMessage: "Select at least one student.", httpStatus: 400 });
            return;
        }

        setIsLoadingPreview(true);
        setAlertMessage({
            feMessage: `Preparing ${selectedCount} report card${selectedCount === 1 ? "" : "s"}...`,
        });

        try {
            const idsToSend =
                selectedCount === students.length
                    ? undefined
                    : students.filter((s) => s.selected).map((s) => s.studentId);

            const blob = await printClassTerminalReports(selectedAccount, {
                classId: selectedClassId,
                schoolSession,
                schoolTerm,
                studentIds: idsToSend,
            });

            const className = classes.find((c) => c.id === selectedClassId)?.name ?? "Class";
            openPreview(
                blob,
                `${className} — ${selectedCount} Report Card${selectedCount === 1 ? "" : "s"}`
            );
            setAlertMessage({});
        } catch (err: any) {
            setAlertMessage({
                feMessage: "Failed to generate reports.",
                beMessage: err?.message,
                httpStatus: err?.status || 500,
            });
        } finally {
            setIsLoadingPreview(false);
        }
    };

    const isLoadingAnything = isLoadingClasses || isLoadingStudents || isEnumsLoading;

    return (
        <Box
            sx={{
                width: "100%",
                backgroundColor: theme.palette.background.default,
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
                    backgroundColor: theme.palette.background.default,
                    color: theme.palette.text.secondary,
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
                                <AssessmentIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight={700}>
                                    Class Results
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    Inspect report cards before publishing
                                </Typography>
                            </Box>
                        </Stack>

                        <Chip
                            label={`${students.length} student${students.length === 1 ? "" : "s"}`}
                            sx={{
                                bgcolor: "rgba(255,255,255,0.2)",
                                color: "inherit",
                                fontWeight: 600,
                            }}
                        />
                    </Stack>
                </CardContent>
            </Card>

            <MessageDisplay
                feMessage={alertMessage.feMessage}
                beMessage={alertMessage.beMessage}
                httpStatus={alertMessage.httpStatus}
            />

            {/* Filters */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 3,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: theme.palette.background.default,
                }}
            >
                <Stack
                    direction={isMobile ? "column" : "row"}
                    spacing={2}
                    alignItems={isMobile ? "stretch" : "center"}
                    flexWrap="wrap"
                >
                    <FormControl fullWidth size="small" sx={{ maxWidth: isMobile ? "100%" : 280 }}>
                        <InputLabel>Class</InputLabel>
                        <Select
                            label="Class"
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value as string)}
                            disabled={isLoadingClasses || classes.length === 0}
                        >
                            {classes.length === 0 ? (
                                <MenuItem value="" disabled>No classes available</MenuItem>
                            ) : (
                                classes.map((c) => (
                                    <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>
                                ))
                            )}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small" sx={{ maxWidth: isMobile ? "100%" : 200 }}>
                        <InputLabel>Session</InputLabel>
                        <Select
                            label="Session"
                            value={schoolSession || ""}
                            onChange={(e) => setSchoolSession(Number(e.target.value))}
                        >
                            {sessionOptions.map((s) => (
                                <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small" sx={{ maxWidth: isMobile ? "100%" : 200 }}>
                        <InputLabel>Term</InputLabel>
                        <Select
                            label="Term"
                            value={schoolTerm || ""}
                            onChange={(e) => setSchoolTerm(Number(e.target.value))}
                        >
                            {termOptions.map((t) => (
                                <MenuItem key={t.value} value={t.value}>{t.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box sx={{ flex: 1 }} />

                    <Button
                        variant="contained"
                        startIcon={
                            isLoadingPreview ? (
                                <CircularProgress size={18} color="inherit" />
                            ) : (
                                <PictureAsPdfIcon />
                            )
                        }
                        onClick={handlePreviewBatch}
                        disabled={
                            isLoadingPreview ||
                            selectedCount === 0 ||
                            !schoolSession ||
                            !schoolTerm
                        }
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            fontWeight: 600,
                            minWidth: 240,
                        }}
                    >
                        {isLoadingPreview
                            ? "Preparing..."
                            : `Preview ${selectedCount} Report${selectedCount === 1 ? "" : "s"}`}
                    </Button>
                </Stack>
            </Paper>

            {/* Loading */}
            {isLoadingAnything && (
                <Box display="flex" justifyContent="center" py={4}>
                    <CircularProgress />
                </Box>
            )}

            {/* Empty */}
            {!isLoadingAnything && students.length === 0 && selectedClassId && (
                <Paper
                    elevation={0}
                    sx={{
                        p: 4,
                        textAlign: "center",
                        borderRadius: 2,
                        border: "1px dashed",
                        borderColor: "divider",
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
                    {/* Select-all bar */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 1.5,
                            mb: 2,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            backgroundColor: theme.palette.background.default,
                        }}
                    >
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectedCount === students.length}
                                        indeterminate={selectedCount > 0 && selectedCount < students.length}
                                        onChange={(e) => toggleAll(e.target.checked)}
                                    />
                                }
                                label={
                                    <Typography variant="body2" fontWeight={600}>
                                        Select all ({students.length})
                                    </Typography>
                                }
                            />
                            <Chip
                                size="small"
                                label={`${selectedCount} selected`}
                                color={selectedCount > 0 ? "primary" : "default"}
                            />
                        </Stack>
                    </Paper>

                    {/* Rows */}
                    {students.map((s, i) => (
                        <Paper
                            key={s.studentId}
                            elevation={0}
                            sx={{
                                p: { xs: 1.5, sm: 2 },
                                mb: 1.5,
                                borderRadius: 2,
                                border: "1px solid",
                                borderColor: s.selected ? theme.palette.primary.main : "divider",
                                backgroundColor: s.selected
                                    ? "rgba(25,118,210,0.03)"
                                    : theme.palette.common.black,
                                transition: "all 0.15s ease",
                                "&:hover": { boxShadow: 2 },
                            }}
                        >
                            <Stack
                                direction={isMobile ? "column" : "row"}
                                spacing={2}
                                alignItems={isMobile ? "stretch" : "center"}
                                justifyContent="space-between"
                            >
                                <Stack direction="row" spacing={1.5} alignItems="center">
                                    <Checkbox
                                        checked={s.selected}
                                        onChange={() => toggleStudent(s.studentId)}
                                    />
                                    <Avatar
                                        sx={{
                                            width: 36,
                                            height: 36,
                                            bgcolor: "primary.main",
                                            fontSize: 14,
                                        }}
                                    >
                                        <PersonIcon fontSize="small" />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" fontWeight={600}>{s.name}</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            #{i + 1} of {students.length}
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Tooltip title="Preview this report card">
                                    <span>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={<VisibilityIcon />}
                                            onClick={() => handlePreviewOne(s)}
                                            disabled={isLoadingPreview}
                                            sx={{
                                                textTransform: "none",
                                                borderRadius: 2,
                                                fontWeight: 600,
                                                minWidth: 130,
                                            }}
                                        >
                                            Preview
                                        </Button>
                                    </span>
                                </Tooltip>
                            </Stack>
                        </Paper>
                    ))}
                </>
            )}

            {/* Preview dialog */}
            <ReportPreviewDialog
                open={previewOpen}
                onClose={() => {
                    setPreviewOpen(false);
                    setPreviewBlob(null);
                }}
                blob={previewBlob}
                title={previewTitle}
                allowDownload={false}
            />
        </Box>
    );
};

export default ClassResultsViewer;