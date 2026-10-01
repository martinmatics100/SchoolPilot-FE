import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Button,
    Card,
    CardContent,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    Stack,
    Typography,
    Avatar,
    Chip,
    Checkbox,
    FormControlLabel,
    useMediaQuery,
    useTheme,
    alpha,
    Tooltip,
} from "@mui/material";
import PrintIcon from "@mui/icons-material/Print";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import PersonIcon from "@mui/icons-material/Person";
import DownloadIcon from "@mui/icons-material/Download";
import { useAuth } from "../../../context";
import { useEnums } from "../../../hooks/useEnums";
import { fetchClasses } from "../../../api/classServices";
import { fetchClassAffectiveSkills } from "../../../api/studentService";
// import {
//     printStudentReport,
//     printClassBroadsheet,
// } from "../../../api/resultService";
import MessageDisplay from "../../../components/message-display";

interface ClassOption {
    id: string;
    name: string;
}

interface StudentRow {
    studentId: string;
    name: string;
    selected: boolean;
}

const PrintReportCards: React.FC = () => {
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
    const [downloadingId, setDownloadingId] = useState<string | null>(null);
    const [isDownloadingBatch, setIsDownloadingBatch] = useState(false);

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

    // ---------- Selection helpers ----------
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

    // ---------- Download helpers ----------
    const downloadBlob = (blob: Blob, fileName: string) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleDownloadOne = async (student: StudentRow) => {
        if (!selectedAccount) return;
        if (!schoolSession || !schoolTerm) {
            setAlertMessage({
                feMessage: "Select a session and term first.",
                httpStatus: 400,
            });
            return;
        }
        setDownloadingId(student.studentId);
        setAlertMessage({ feMessage: `Generating report for ${student.name}...` });

        // try {
        //     const blob = await printStudentReport(selectedAccount, {
        //         studentId: student.studentId,
        //         classId: selectedClassId,
        //         schoolSession,
        //         schoolTerm,
        //     });
        //     downloadBlob(
        //         blob,
        //         `${student.name.replace(/\s+/g, "_")}_TerminalReport.pdf`
        //     );
        //     setAlertMessage({ feMessage: "Report downloaded.", httpStatus: 200 });
        //     setTimeout(() => setAlertMessage({}), 2000);
        // } catch (err: any) {
        //     setAlertMessage({
        //         feMessage: "Failed to generate report.",
        //         beMessage: err?.message,
        //         httpStatus: err?.status || 500,
        //     });
        // } finally {
        //     setDownloadingId(null);
        // }
        setDownloadingId(null);
    };

    const handleDownloadBatch = async () => {
        if (!selectedAccount) return;
        if (!schoolSession || !schoolTerm) {
            setAlertMessage({
                feMessage: "Select a session and term first.",
                httpStatus: 400,
            });
            return;
        }
        if (selectedCount === 0) {
            setAlertMessage({ feMessage: "Select at least one student.", httpStatus: 400 });
            return;
        }

        setIsDownloadingBatch(true);
        setAlertMessage({
            feMessage: `Generating ${selectedCount} report card${selectedCount === 1 ? "" : "s"
                }...`,
        });

        try {
            //  const blob = await printClassBroadsheet(selectedAccount, {
            //     classId: selectedClassId,
            //     schoolSession,
            //     schoolTerm,
            // });
            // const className =
            //     classes.find((c) => c.id === selectedClassId)?.name ?? "Class";
            // downloadBlob(blob, `${className.replace(/\s+/g, "_")}_ReportCards.pdf`);
            // setAlertMessage({ feMessage: "Batch download complete.", httpStatus: 200 });
            // setTimeout(() => setAlertMessage({}), 2000);
        } catch (err: any) {
            setAlertMessage({
                feMessage: "Failed to generate batch.",
                beMessage: err?.message,
                httpStatus: err?.status || 500,
            });
        } finally {
            setIsDownloadingBatch(false);
        }
    };

    const isLoadingAnything = isLoadingClasses || isLoadingStudents || isEnumsLoading;

    return (
        <Box
            sx={{
                width: "100%",
                minHeight: "100%",
                backgroundColor: theme.palette.background.default,
                px: { xs: 2, sm: 3, md: 4 },
                py: { xs: 3, sm: 4 },
            }}
        >
            {/* Header */}
            <Card
                elevation={0}
                sx={{
                    mb: { xs: 3, sm: 4 },
                    borderRadius: 3,
                    position: "relative",
                    overflow: "hidden",
                    background: `linear-gradient(135deg, #0e6655 0%, #148f77 100%)`,
                    color: "#fff",
                }}
            >
                <Box
                    sx={{
                        position: "absolute",
                        top: -50,
                        right: -30,
                        width: 180,
                        height: 180,
                        borderRadius: "50%",
                        backgroundColor: "rgba(255,255,255,0.06)",
                        pointerEvents: "none",
                    }}
                />
                <CardContent sx={{ position: "relative", zIndex: 1 }}>
                    <Stack
                        direction={isMobile ? "column" : "row"}
                        spacing={2}
                        alignItems={isMobile ? "flex-start" : "center"}
                        justifyContent="space-between"
                    >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar sx={{ bgcolor: "rgba(255,255,255,0.2)", width: 48, height: 48 }}>
                                <PrintIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight={700}>
                                    Print Report Cards
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    Generate PDF report cards for one or many students
                                </Typography>
                            </Box>
                        </Stack>

                        <Chip
                            label={`${selectedCount}/${students.length} selected`}
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

            {/* Filters card */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, sm: 2.5 },
                    mb: 3,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: theme.palette.background.paper,
                }}
            >
                <Stack
                    direction={isMobile ? "column" : "row"}
                    spacing={2}
                    alignItems={isMobile ? "stretch" : "center"}
                    flexWrap="wrap"
                >
                    <FormControl
                        fullWidth
                        size="small"
                        sx={{ maxWidth: isMobile ? "100%" : 280 }}
                    >
                        <InputLabel>Class</InputLabel>
                        <Select
                            label="Class"
                            value={selectedClassId}
                            onChange={(e) => setSelectedClassId(e.target.value as string)}
                            disabled={isLoadingClasses || classes.length === 0}
                        >
                            {classes.map((c) => (
                                <MenuItem key={c.id} value={c.id}>
                                    {c.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl
                        fullWidth
                        size="small"
                        sx={{ maxWidth: isMobile ? "100%" : 180 }}
                    >
                        <InputLabel>Session</InputLabel>
                        <Select
                            label="Session"
                            value={schoolSession || ""}
                            onChange={(e) => setSchoolSession(Number(e.target.value))}
                        >
                            {sessionOptions.map((s) => (
                                <MenuItem key={s.value} value={s.value}>
                                    {s.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl
                        fullWidth
                        size="small"
                        sx={{ maxWidth: isMobile ? "100%" : 180 }}
                    >
                        <InputLabel>Term</InputLabel>
                        <Select
                            label="Term"
                            value={schoolTerm || ""}
                            onChange={(e) => setSchoolTerm(Number(e.target.value))}
                        >
                            {termOptions.map((t) => (
                                <MenuItem key={t.value} value={t.value}>
                                    {t.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Box sx={{ flex: 1 }} />

                    <Button
                        variant="contained"
                        startIcon={
                            isDownloadingBatch ? (
                                <CircularProgress size={18} color="inherit" />
                            ) : (
                                <PictureAsPdfIcon />
                            )
                        }
                        onClick={handleDownloadBatch}
                        disabled={
                            isDownloadingBatch ||
                            selectedCount === 0 ||
                            !schoolSession ||
                            !schoolTerm
                        }
                        sx={{
                            textTransform: "none",
                            borderRadius: 2,
                            fontWeight: 600,
                            minWidth: 220,
                            bgcolor: "#148f77",
                            "&:hover": { bgcolor: "#0e6655" },
                        }}
                    >
                        {isDownloadingBatch
                            ? "Generating..."
                            : `Download ${selectedCount} Report${selectedCount === 1 ? "" : "s"}`}
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
                        backgroundColor: theme.palette.background.paper,
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
                            backgroundColor: theme.palette.background.paper,
                        }}
                    >
                        <Stack
                            direction="row"
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={selectedCount === students.length}
                                        indeterminate={
                                            selectedCount > 0 &&
                                            selectedCount < students.length
                                        }
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
                                borderColor: s.selected ? alpha("#148f77", 0.4) : "divider",
                                backgroundColor: s.selected
                                    ? alpha("#148f77", 0.03)
                                    : theme.palette.background.paper,
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
                                            bgcolor: alpha("#148f77", 0.15),
                                            color: "#148f77",
                                        }}
                                    >
                                        <PersonIcon fontSize="small" />
                                    </Avatar>
                                    <Box>
                                        <Typography variant="body2" fontWeight={600}>
                                            {s.name}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            #{i + 1} of {students.length}
                                        </Typography>
                                    </Box>
                                </Stack>

                                <Tooltip title="Download this report only">
                                    <span>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            startIcon={
                                                downloadingId === s.studentId ? (
                                                    <CircularProgress size={14} />
                                                ) : (
                                                    <DownloadIcon />
                                                )
                                            }
                                            onClick={() => handleDownloadOne(s)}
                                            disabled={
                                                !!downloadingId ||
                                                isDownloadingBatch ||
                                                !schoolSession ||
                                                !schoolTerm
                                            }
                                            sx={{
                                                textTransform: "none",
                                                borderRadius: 2,
                                                fontWeight: 600,
                                                minWidth: 130,
                                            }}
                                        >
                                            Download
                                        </Button>
                                    </span>
                                </Tooltip>
                            </Stack>
                        </Paper>
                    ))}
                </>
            )}
        </Box>
    );
};

export default PrintReportCards;