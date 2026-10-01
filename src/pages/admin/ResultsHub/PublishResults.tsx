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
    Switch,
    IconButton,
    Tooltip,
    useMediaQuery,
    useTheme,
    alpha,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from "@mui/material";
import PublishIcon from "@mui/icons-material/Publish";
import UnpublishedIcon from "@mui/icons-material/Unpublished";
import PersonIcon from "@mui/icons-material/Person";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import HourglassEmptyIcon from "@mui/icons-material/HourglassEmpty";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useAuth } from "../../../context";
import { useEnums } from "../../../hooks/useEnums";
import { fetchClasses } from "../../../api/classServices";
import { fetchClassAffectiveSkills } from "../../../api/studentService";
import {
    publishResults,
    unpublishResults,
    getPublishedReportStatus,
} from "../../../api/resultService";
import MessageDisplay from "../../../components/message-display";

interface ClassOption {
    id: string;
    name: string;
}

interface StudentRow {
    studentId: string;
    name: string;
    published: boolean;
    selected: boolean;
}

type Mode = "publish" | "unpublish";

const PublishResults: React.FC = () => {
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
    const [isLoadingPublishedStatus, setIsLoadingPublishedStatus] = useState(false);
    const [isPublishing, setIsPublishing] = useState(false);
    const [isUnpublishing, setIsUnpublishing] = useState(false);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmUnpublishOpen, setConfirmUnpublishOpen] = useState(false);
    const [confirmSingleUnpublishOpen, setConfirmSingleUnpublishOpen] = useState(false);
    const [singleUnpublishTarget, setSingleUnpublishTarget] = useState<StudentRow | null>(null);

    // ---------- NEW: mode toggle ----------
    const [mode, setMode] = useState<Mode>("publish");

    const [alertMessage, setAlertMessage] = useState<{
        feMessage?: string;
        beMessage?: string;
        httpStatus?: number;
    }>({});

    // ---------- Reusable checkbox style ----------
    const checkboxSx = {
        color: "#1976d2",
        "&.Mui-checked": { color: "#b9770e" },
        "&.MuiCheckbox-indeterminate": { color: "#b9770e" },
    } as const;

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

    // ---------- Load students (roster) ----------
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
                    fetched.map((s: any) => ({
                        studentId: s.studentId,
                        name: s.name,
                        published: false,
                        selected: false,
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

    // ---------- Load published status ----------
    useEffect(() => {
        const load = async () => {
            if (
                !selectedAccount ||
                !selectedClassId ||
                !schoolSession ||
                !schoolTerm ||
                students.length === 0
            ) {
                return;
            }

            setIsLoadingPublishedStatus(true);
            try {
                const result = await getPublishedReportStatus(selectedAccount, {
                    classId: selectedClassId,
                    schoolSession,
                    schoolTerm,
                });

                const publishedSet = new Set(result?.publishedStudentIds ?? []);

                setStudents((prev) =>
                    prev.map((s) => {
                        const isPublished = publishedSet.has(s.studentId);
                        return {
                            ...s,
                            published: isPublished,
                            selected: isPublished ? false : s.selected,
                        };
                    })
                );
            } catch (err: any) {
                setAlertMessage({
                    feMessage: "Failed to load published status.",
                    beMessage: err?.message,
                    httpStatus: err?.status || 500,
                });
            } finally {
                setIsLoadingPublishedStatus(false);
            }
        };
        load();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAccount, selectedClassId, schoolSession, schoolTerm, students.length]);

    // ---------- Selection ----------
    // Only allow selecting rows that match the current mode.
    const toggleStudent = (studentId: string) => {
        setStudents((prev) =>
            prev.map((s) => {
                if (s.studentId !== studentId) return s;
                if (mode === "publish" && s.published) return s;
                if (mode === "unpublish" && !s.published) return s;
                return { ...s, selected: !s.selected };
            })
        );
    };

    const toggleAll = (checked: boolean) => {
        setStudents((prev) =>
            prev.map((s) => {
                if (mode === "publish") {
                    // Only unpublished are selectable.
                    return s.published ? s : { ...s, selected: checked };
                } else {
                    // Only published are selectable.
                    return s.published ? { ...s, selected: checked } : s;
                }
            })
        );
    };

    // When mode flips, clear all selections and close any open dialogs.
    const handleModeChange = (next: Mode) => {
        setMode(next);
        setStudents((prev) => prev.map((s) => ({ ...s, selected: false })));
        setConfirmOpen(false);
        setConfirmUnpublishOpen(false);
    };

    // ---------- Derived counts ----------
    const selectableStudents = students.filter((s) =>
        mode === "publish" ? !s.published : s.published
    );
    const selectableCount = selectableStudents.length;
    const selectedCount = students.filter((s) =>
        mode === "publish"
            ? s.selected && !s.published
            : s.selected && s.published
    ).length;
    const publishedCount = students.filter((s) => s.published).length;
    const unpublishedCount = students.length - publishedCount;
    const allSelectableSelected =
        selectableCount > 0 && selectedCount === selectableCount;

    // ---------- Publish (unchanged behaviour) ----------
    const handlePublish = async () => {
        if (!selectedAccount) return;
        if (!schoolSession || !schoolTerm) {
            setConfirmOpen(false);
            setAlertMessage({
                feMessage: "Select a session and term first.",
                httpStatus: 400,
            });
            return;
        }
        setConfirmOpen(false);

        const toPublish = students.filter((s) => s.selected && !s.published);
        if (toPublish.length === 0) {
            setAlertMessage({ feMessage: "Select at least one student.", httpStatus: 400 });
            return;
        }

        setIsPublishing(true);
        setAlertMessage({
            feMessage: `Publishing ${toPublish.length} result${toPublish.length === 1 ? "" : "s"
                }...`,
        });

        try {
            const publishingAllSelectable =
                toPublish.length === selectableCount && publishedCount === 0;

            const idsToSend = publishingAllSelectable
                ? undefined
                : toPublish.map((s) => s.studentId);

            const response = await publishResults(selectedAccount, {
                classId: selectedClassId,
                schoolSession,
                schoolTerm,
                studentIds: idsToSend,
            });

            const publishedSet = new Set(toPublish.map((s) => s.studentId));
            setStudents((prev) =>
                prev.map((s) =>
                    publishedSet.has(s.studentId)
                        ? { ...s, published: true, selected: false }
                        : s
                )
            );

            const publishedCountFromServer = response?.publishedCount ?? toPublish.length;
            const skippedCountFromServer = response?.skippedCount ?? 0;

            setAlertMessage({
                feMessage:
                    `Published ${publishedCountFromServer} result${publishedCountFromServer === 1 ? "" : "s"
                    } successfully.` +
                    (skippedCountFromServer > 0
                        ? ` (${skippedCountFromServer} skipped — no changes)`
                        : ""),
                httpStatus: 200,
            });
            setTimeout(() => setAlertMessage({}), 3000);
        } catch (err: any) {
            setAlertMessage({
                feMessage: "Failed to publish results.",
                beMessage: err?.message,
                httpStatus: err?.status || 500,
            });
        } finally {
            setIsPublishing(false);
        }
    };

    // ---------- Unpublish (new) ----------
    const performUnpublish = async (
        targets: StudentRow[],
        reason: string | undefined,
        isSingle: boolean
    ) => {
        if (!selectedAccount || targets.length === 0) return;

        const setIsLoading = isSingle ? setIsUnpublishing : setIsUnpublishing;
        setIsLoading(true);
        setAlertMessage({
            feMessage: `Unpublishing ${targets.length} result${targets.length === 1 ? "" : "s"
                }...`,
        });

        try {
            const ids = targets.map((s) => s.studentId);

            await unpublishResults(selectedAccount, {
                classId: selectedClassId,
                schoolSession,
                schoolTerm,
                studentIds: ids,
                reason,
            });

            const removedSet = new Set(ids);
            setStudents((prev) =>
                prev.map((s) =>
                    removedSet.has(s.studentId)
                        ? { ...s, published: false, selected: false }
                        : s
                )
            );

            setAlertMessage({
                feMessage: `Unpublished ${targets.length} result${targets.length === 1 ? "" : "s"
                    } successfully.`,
                httpStatus: 200,
            });
            setTimeout(() => setAlertMessage({}), 3000);
        } catch (err: any) {
            setAlertMessage({
                feMessage: "Failed to unpublish results.",
                beMessage: err?.message,
                httpStatus: err?.status || 500,
            });
        } finally {
            setIsLoading(false);
            setConfirmUnpublishOpen(false);
            setConfirmSingleUnpublishOpen(false);
            setSingleUnpublishTarget(null);
        }
    };

    // Bulk unpublish from the toolbar button
    const handleBulkUnpublish = async () => {
        const targets = students.filter((s) => s.selected && s.published);
        if (targets.length === 0) return;
        await performUnpublish(targets, undefined, false);
    };

    // Single-row inline unpublish
    const openSingleUnpublish = (student: StudentRow) => {
        setSingleUnpublishTarget(student);
        setConfirmSingleUnpublishOpen(true);
    };

    const handleSingleUnpublishConfirm = async () => {
        if (!singleUnpublishTarget) return;
        await performUnpublish([singleUnpublishTarget], undefined, true);
    };

    const isLoadingAnything =
        isLoadingClasses ||
        isLoadingStudents ||
        isLoadingPublishedStatus ||
        isEnumsLoading;

    const isBusy = isPublishing || isUnpublishing;

    return (
        <Box
            sx={{
                width: "100%",
                minHeight: "100%",
                backgroundColor: theme.palette.background.default,
                color: theme.palette.text.secondary,
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
                    background: `linear-gradient(135deg, #7e5109 0%, #b9770e 100%)`,
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
                                <PublishIcon />
                            </Avatar>
                            <Box>
                                <Typography variant="h6" fontWeight={700}>
                                    {mode === "publish" ? "Publish Results" : "Unpublish Results"}
                                </Typography>
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                    {mode === "publish"
                                        ? "Make results visible to parents & students"
                                        : "Take results back down from parents & students"}
                                </Typography>
                            </Box>
                        </Stack>

                        <Chip
                            label={`${publishedCount}/${students.length} published`}
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

            {/* Filters + mode toggle */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, sm: 2.5 },
                    mb: 3,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: theme.palette.background.default,
                    color: theme.palette.text.secondary,
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
                            {classes.map((c) => (
                                <MenuItem key={c.id} value={c.id}>
                                    {c.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small" sx={{ maxWidth: isMobile ? "100%" : 180 }}>
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

                    <FormControl fullWidth size="small" sx={{ maxWidth: isMobile ? "100%" : 180 }}>
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

                    {/* NEW: mode toggle */}
                    <FormControlLabel
                        control={
                            <Switch
                                checked={mode === "unpublish"}
                                onChange={(e) =>
                                    handleModeChange(e.target.checked ? "unpublish" : "publish")
                                }
                                color="warning"
                            />
                        }
                        label={
                            <Typography variant="body2" fontWeight={600}>
                                Unpublish mode
                            </Typography>
                        }
                        sx={{ mr: 1 }}
                    />

                    {mode === "publish" ? (
                        <Button
                            variant="contained"
                            startIcon={
                                isPublishing ? (
                                    <CircularProgress size={18} color="inherit" />
                                ) : (
                                    <PublishIcon />
                                )
                            }
                            onClick={() => setConfirmOpen(true)}
                            disabled={
                                isBusy ||
                                selectedCount === 0 ||
                                !schoolSession ||
                                !schoolTerm
                            }
                            sx={{
                                textTransform: "none",
                                borderRadius: 2,
                                fontWeight: 600,
                                minWidth: 200,
                                bgcolor: "#b9770e",
                                "&:hover": { bgcolor: "#7e5109" },
                            }}
                        >
                            {isPublishing
                                ? "Publishing..."
                                : `Publish ${selectedCount} Selected`}
                        </Button>
                    ) : (
                        <Button
                            variant="contained"
                            color="warning"
                            startIcon={
                                isUnpublishing ? (
                                    <CircularProgress size={18} color="inherit" />
                                ) : (
                                    <UnpublishedIcon />
                                )
                            }
                            onClick={() => setConfirmUnpublishOpen(true)}
                            disabled={
                                isBusy ||
                                selectedCount === 0 ||
                                !schoolSession ||
                                !schoolTerm
                            }
                            sx={{
                                textTransform: "none",
                                borderRadius: 2,
                                fontWeight: 600,
                                minWidth: 220,
                                bgcolor: "#b9770e",
                                "&:hover": { bgcolor: "#7e5109" },
                            }}
                        >
                            {isUnpublishing
                                ? "Unpublishing..."
                                : `Unpublish ${selectedCount} Selected`}
                        </Button>
                    )}
                </Stack>
            </Paper>

            {/* Info banner */}
            <Paper
                elevation={0}
                sx={{
                    p: 1.5,
                    mb: 2,
                    borderRadius: 2,
                    border: "1px solid",
                    borderColor: alpha("#b9770e", 0.3),
                    backgroundColor: alpha("#b9770e", 0.06),
                    color: theme.palette.text.secondary,
                }}
            >
                <Stack direction="row" spacing={1} alignItems="center">
                    <WarningAmberIcon sx={{ color: "#b9770e", fontSize: 20 }} />
                    <Typography variant="caption" color="text.secondary">
                        {mode === "publish"
                            ? "Once published, results become visible to parents and students. You can unpublish anytime."
                            : "Unpublishing hides these results from parents and students immediately. You can republish later."}
                    </Typography>
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
                        backgroundColor: theme.palette.background.default,
                        color: theme.palette.text.secondary,
                    }}
                >
                    <Typography color="text.secondary">
                        No students found in this class.
                    </Typography>
                </Paper>
            )}

            {/* List */}
            {!isLoadingAnything && students.length > 0 && (
                <>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 1.5,
                            mb: 2,
                            borderRadius: 2,
                            border: "1px solid",
                            borderColor: "divider",
                            backgroundColor: theme.palette.background.default,
                            color: theme.palette.text.secondary,
                        }}
                    >
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        sx={checkboxSx}
                                        checked={allSelectableSelected}
                                        indeterminate={
                                            selectedCount > 0 && selectedCount < selectableCount
                                        }
                                        onChange={(e) => toggleAll(e.target.checked)}
                                        disabled={selectableCount === 0}
                                    />
                                }
                                label={
                                    <Typography variant="body2" fontWeight={600}>
                                        {mode === "publish"
                                            ? `Select all (${selectableCount} unpublished)`
                                            : `Select all (${selectableCount} published)`}
                                    </Typography>
                                }
                            />
                            <Chip
                                size="small"
                                label={`${selectedCount} selected`}
                                color={selectedCount > 0 ? "warning" : "default"}
                            />
                        </Stack>
                    </Paper>

                    {students.map((s, i) => {
                        // In publish mode, only unpublished rows are selectable.
                        // In unpublish mode, only published rows are selectable.
                        const isSelectable =
                            mode === "publish" ? !s.published : s.published;

                        return (
                            <Paper
                                key={s.studentId}
                                elevation={0}
                                sx={{
                                    p: { xs: 1.5, sm: 2 },
                                    mb: 1.5,
                                    borderRadius: 2,
                                    border: "1px solid",
                                    borderColor: s.selected
                                        ? alpha("#b9770e", 0.4)
                                        : "divider",
                                    backgroundColor: s.selected
                                        ? alpha("#b9770e", 0.04)
                                        : theme.palette.background.default,
                                    color: theme.palette.text.secondary,
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
                                        {isSelectable ? (
                                            <Checkbox
                                                sx={checkboxSx}
                                                checked={s.selected}
                                                onChange={() => toggleStudent(s.studentId)}
                                            />
                                        ) : (
                                            // Reserve the slot so rows don't shift
                                            <Box sx={{ width: 42, height: 42 }} />
                                        )}
                                        <Avatar
                                            sx={{
                                                width: 36,
                                                height: 36,
                                                bgcolor: alpha("#b9770e", 0.15),
                                                color: "#b9770e",
                                            }}
                                        >
                                            <PersonIcon fontSize="small" />
                                        </Avatar>
                                        <Box>
                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                                fontSize={16}
                                                color="text.secondary"
                                            >
                                                {s.name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                #{i + 1} of {students.length}
                                            </Typography>
                                        </Box>
                                    </Stack>

                                    <Stack direction="row" spacing={1} alignItems="center">
                                        <Chip
                                            size="small"
                                            icon={
                                                s.published ? (
                                                    <CheckCircleIcon />
                                                ) : (
                                                    <HourglassEmptyIcon />
                                                )
                                            }
                                            label={s.published ? "Published" : "Not published"}
                                            color={s.published ? "success" : "default"}
                                            variant={s.published ? "filled" : "outlined"}
                                            sx={{ fontWeight: 600 }}
                                        />

                                        {/* NEW: inline unpublish button, only on published rows in publish mode */}
                                        {s.published && mode === "publish" && (
                                            <Tooltip title="Unpublish this result">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => openSingleUnpublish(s)}
                                                    disabled={isBusy}
                                                    sx={{
                                                        color: "#b9770e",
                                                        "&:hover": {
                                                            bgcolor: alpha("#b9770e", 0.12),
                                                        },
                                                    }}
                                                >
                                                    <UnpublishedIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        )}
                                    </Stack>
                                </Stack>
                            </Paper>
                        );
                    })}
                </>
            )}

            {/* Publish confirm dialog */}
            <Dialog
                open={confirmOpen}
                onClose={() => setConfirmOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 700 }}>
                    Publish {selectedCount} result{selectedCount === 1 ? "" : "s"}?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Once published, parents and students will be able to see these
                        results in their portal. You can unpublish later if needed.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setConfirmOpen(false)}
                        sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handlePublish}
                        disabled={isPublishing}
                        startIcon={
                            isPublishing ? (
                                <CircularProgress size={16} color="inherit" />
                            ) : (
                                <PublishIcon />
                            )
                        }
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            bgcolor: "#b9770e",
                            "&:hover": { bgcolor: "#7e5109" },
                        }}
                    >
                        {isPublishing ? "Publishing..." : "Publish"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Bulk unpublish confirm dialog */}
            <Dialog
                open={confirmUnpublishOpen}
                onClose={() => setConfirmUnpublishOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 700 }}>
                    Unpublish {selectedCount} result{selectedCount === 1 ? "" : "s"}?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        These results will no longer be visible to parents and students.
                        You can republish them later.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => setConfirmUnpublishOpen(false)}
                        sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={handleBulkUnpublish}
                        disabled={isUnpublishing}
                        startIcon={
                            isUnpublishing ? (
                                <CircularProgress size={16} color="inherit" />
                            ) : (
                                <UnpublishedIcon />
                            )
                        }
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            bgcolor: "#b9770e",
                            "&:hover": { bgcolor: "#7e5109" },
                        }}
                    >
                        {isUnpublishing ? "Unpublishing..." : "Unpublish"}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Single-row unpublish confirm dialog */}
            <Dialog
                open={confirmSingleUnpublishOpen}
                onClose={() => {
                    setConfirmSingleUnpublishOpen(false);
                    setSingleUnpublishTarget(null);
                }}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 700 }}>
                    Unpublish {singleUnpublishTarget?.name}'s result?
                </DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        This result will no longer be visible to the student's parents or
                        guardians. You can republish it later.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ p: 2 }}>
                    <Button
                        onClick={() => {
                            setConfirmSingleUnpublishOpen(false);
                            setSingleUnpublishTarget(null);
                        }}
                        sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="warning"
                        onClick={handleSingleUnpublishConfirm}
                        disabled={isUnpublishing}
                        startIcon={
                            isUnpublishing ? (
                                <CircularProgress size={16} color="inherit" />
                            ) : (
                                <UnpublishedIcon />
                            )
                        }
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            bgcolor: "#b9770e",
                            "&:hover": { bgcolor: "#7e5109" },
                        }}
                    >
                        {isUnpublishing ? "Unpublishing..." : "Unpublish"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PublishResults;