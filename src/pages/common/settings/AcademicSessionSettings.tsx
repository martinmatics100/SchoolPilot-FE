import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Chip,
    Stack,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Checkbox,
    FormControlLabel,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Alert,
    AlertTitle,
    LinearProgress,
    CircularProgress,
    useTheme,
    useMediaQuery,
    IconButton,
    Collapse,
} from "@mui/material";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs, { Dayjs } from "dayjs";
import {
    CalendarMonth as CalendarIcon,
    ArrowForward as ArrowForwardIcon,
    History as HistoryIcon,
    CheckCircle as CheckCircleIcon,
    Close as CloseIcon,
    ChevronRight as ChevronRightIcon,
    ExpandMore as ExpandMoreIcon,
    ExpandLess as ExpandLessIcon,
    Celebration as CelebrationIcon,
    Info as InfoIcon,
} from "@mui/icons-material";
import {
    accountService,
    type SchoolInfoResponse,
    type RolloverPreviewResponse,
} from "../../../api/accountService";
import { useEnums } from "../../../hooks/useEnums";

/* ═══════════════════════════════════════════════════════════════════════
   ENUMS + LABELS
   ═══════════════════════════════════════════════════════════════════════ */

const SchoolTerms = {
    FirstTerm: 1,
    SecondTerm: 2,
    ThirdTerm: 3,
} as const;

const termLabels: Record<number, string> = {
    1: "First Term",
    2: "Second Term",
    3: "Third Term",
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════════════════════════════════ */

export default function AcademicSessionSettings() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const { enums, isLoading: isEnumsLoading } = useEnums({
        fetchPermissionData: false,
    });

    const [school, setSchool] = useState<SchoolInfoResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [loadError, setLoadError] = useState<string | null>(null);

    const [advanceModalOpen, setAdvanceModalOpen] = useState(false);
    const [rolloverWizardOpen, setRolloverWizardOpen] = useState(false);

    // ── Session label lookup from enums endpoint ──
    const sessionLabels = useMemo<Record<number, string>>(() => {
        const map: Record<number, string> = {};
        (enums?.SchoolSessions ?? []).forEach((item: any) => {
            map[item.value] = item.displayName || item.name;
        });
        return map;
    }, [enums]);

    // ── Fetch school info on mount ──
    useEffect(() => {
        const load = async () => {
            try {
                setLoading(true);
                const data = await accountService.getSchoolInformation();
                if (!data) {
                    setLoadError("No school information found for this account.");
                } else {
                    setSchool(data);
                }
            } catch (err: any) {
                setLoadError(err?.message || "Failed to load school information.");
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    // ── Decide what the next action is ──
    const nextAction = useMemo(() => {
        if (!school?.currentTerm) return null;

        if (school.currentTerm === SchoolTerms.FirstTerm) {
            return {
                type: "advance" as const,
                nextTerm: SchoolTerms.SecondTerm,
                label: "Advance to Second Term",
                description:
                    "First Term is in progress. When it ends, advance the school to Second Term. Students stay in their current classes.",
            };
        }
        if (school.currentTerm === SchoolTerms.SecondTerm) {
            return {
                type: "advance" as const,
                nextTerm: SchoolTerms.ThirdTerm,
                label: "Advance to Third Term",
                description:
                    "Second Term is in progress. When it ends, advance the school to Third Term. Students stay in their current classes.",
            };
        }
        return {
            type: "rollover" as const,
            nextTerm: null,
            label: "End Session & Roll Over",
            description:
                "Third Term is the last term of the session. Roll over to the next session and promote students to their next classes.",
        };
    }, [school]);

    // ── Loading / error ──
    if (loading || isEnumsLoading) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "60vh",
                }}
            >
                <CircularProgress />
            </Box>
        );
    }

    if (loadError || !school) {
        return (
            <Box sx={{ p: 3 }}>
                <Alert severity="error">
                    {loadError || "School information unavailable."}
                </Alert>
            </Box>
        );
    }

    return (
        <Box
            sx={{
                width: "100%",
                minHeight: "100vh",
                bgcolor: theme.palette.background.default,
                px: { xs: 2, sm: 3, md: 4 },
                py: { xs: 3, sm: 4 },
            }}
        >
            <Box sx={{ maxWidth: 1080, mx: "auto" }}>
                <Box sx={{ mb: 4 }}>
                    <Typography
                        variant={isMobile ? "h6" : "h5"}
                        fontWeight={700}
                        sx={{ color: theme.palette.text.primary, mb: 0.5 }}
                    >
                        Academic Session
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{ color: theme.palette.text.secondary }}
                    >
                        Manage your school's session and term. Advance to the next
                        term, or roll over to a new session at the end of the year.
                    </Typography>
                </Box>

                <Stack spacing={3}>
                    <CurrentStateCard school={school} sessionLabels={sessionLabels} />

                    {nextAction && (
                        <NextActionCard
                            action={nextAction}
                            onOpenAdvance={() => setAdvanceModalOpen(true)}
                            onOpenRollover={() => setRolloverWizardOpen(true)}
                            isMobile={isMobile}
                        />
                    )}

                    <HistoryCardNote />
                </Stack>
            </Box>

            {nextAction?.type === "advance" && (
                <AdvanceTermModal
                    open={advanceModalOpen}
                    onClose={() => setAdvanceModalOpen(false)}
                    school={school}
                    currentTerm={school.currentTerm!}
                    nextTerm={nextAction.nextTerm}
                    isMobile={isMobile}
                    onSuccess={async () => {
                        const fresh = await accountService.getSchoolInformation();
                        if (fresh) setSchool(fresh);
                    }}
                />
            )}

            {nextAction?.type === "rollover" && (
                <RolloverWizard
                    open={rolloverWizardOpen}
                    onClose={() => setRolloverWizardOpen(false)}
                    school={school}
                    sessionLabels={sessionLabels}
                    isMobile={isMobile}
                    onSuccess={async () => {
                        const fresh = await accountService.getSchoolInformation();
                        if (fresh) setSchool(fresh);
                    }}
                />
            )}
        </Box>
    );
}

/* ═══════════════════════════════════════════════════════════════════════
   CURRENT STATE CARD
   ═══════════════════════════════════════════════════════════════════════ */

function CurrentStateCard({
    school,
    sessionLabels,
}: {
    school: SchoolInfoResponse;
    sessionLabels: Record<number, string>;
}) {
    const theme = useTheme();

    const sessionLabel = school.currentSession
        ? sessionLabels[school.currentSession] ?? `Session ${school.currentSession}`
        : "Not set";
    const termLabel = school.currentTerm
        ? termLabels[school.currentTerm] ?? "—"
        : "Not set";

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 3,
                bgcolor: theme.palette.background.default,
                border: `1px solid ${theme.palette.divider}`,
                overflow: "hidden",
                position: "relative",
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.light} 100%)`,
                },
            }}
        >
            <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                <Stack
                    direction="row"
                    alignItems="center"
                    spacing={2}
                    sx={{ mb: 3 }}
                >
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            bgcolor: `${theme.palette.primary.main}15`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <CalendarIcon
                            sx={{ color: theme.palette.primary.main, fontSize: 22 }}
                        />
                    </Box>
                    <Box>
                        <Typography
                            variant="caption"
                            sx={{
                                color: theme.palette.text.secondary,
                                textTransform: "uppercase",
                                letterSpacing: 0.8,
                                fontSize: 11,
                                fontWeight: 600,
                            }}
                        >
                            Current
                        </Typography>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            lineHeight={1.2}
                            sx={{ color: theme.palette.text.primary }}
                        >
                            {sessionLabel} — {termLabel}
                        </Typography>
                    </Box>
                </Stack>

                <Box
                    sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                        gap: 2,
                    }}
                >
                    <StatBlock
                        label="Term Start"
                        value={
                            school.currentTermStartDate
                                ? formatDate(school.currentTermStartDate)
                                : "Not set"
                        }
                        muted={!school.currentTermStartDate}
                    />
                    <StatBlock
                        label="Term End"
                        value={
                            school.currentTermEndDate
                                ? formatDate(school.currentTermEndDate)
                                : "Not set"
                        }
                        muted={!school.currentTermEndDate}
                    />
                    <StatBlock
                        label="Next Term Begins"
                        value={
                            school.nextTermBegins
                                ? formatDate(school.nextTermBegins)
                                : "Not set"
                        }
                        muted={!school.nextTermBegins}
                    />
                </Box>
            </CardContent>
        </Card>
    );
}

function StatBlock({
    label,
    value,
    muted,
}: {
    label: string;
    value: string;
    muted?: boolean;
}) {
    const theme = useTheme();
    return (
        <Box
            sx={{
                p: 1.75,
                borderRadius: 2,
                bgcolor:
                    theme.palette.mode === "dark"
                        ? "rgba(255,255,255,0.03)"
                        : "rgba(0,0,0,0.02)",
            }}
        >
            <Typography
                variant="caption"
                sx={{
                    color: theme.palette.text.secondary,
                    display: "block",
                    mb: 0.5,
                    fontWeight: 600,
                    letterSpacing: 0.3,
                }}
            >
                {label}
            </Typography>
            <Typography
                variant="body1"
                fontWeight={600}
                sx={{
                    color: muted
                        ? theme.palette.text.disabled
                        : theme.palette.text.primary,
                }}
            >
                {value}
            </Typography>
        </Box>
    );
}

/* ═══════════════════════════════════════════════════════════════════════
   NEXT ACTION CARD
   ═══════════════════════════════════════════════════════════════════════ */

function NextActionCard({
    action,
    onOpenAdvance,
    onOpenRollover,
    isMobile,
}: {
    action: {
        type: "advance" | "rollover";
        nextTerm: number | null;
        label: string;
        description: string;
    };
    onOpenAdvance: () => void;
    onOpenRollover: () => void;
    isMobile: boolean;
}) {
    const theme = useTheme();
    const isRollover = action.type === "rollover";

    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 3,
                bgcolor: theme.palette.background.default,
                border: `1px solid ${isRollover
                    ? `${theme.palette.warning.main}60`
                    : theme.palette.divider
                    }`,
                overflow: "hidden",
            }}
        >
            <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    alignItems={{ xs: "flex-start", sm: "center" }}
                    spacing={{ xs: 2, sm: 3 }}
                >
                    <Box
                        sx={{
                            width: 52,
                            height: 52,
                            borderRadius: 2,
                            bgcolor: isRollover
                                ? `${theme.palette.warning.main}20`
                                : `${theme.palette.primary.main}15`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                        }}
                    >
                        {isRollover ? (
                            <CelebrationIcon sx={{ color: theme.palette.warning.main }} />
                        ) : (
                            <ArrowForwardIcon
                                sx={{ color: theme.palette.primary.main }}
                            />
                        )}
                    </Box>

                    <Box sx={{ flex: 1 }}>
                        <Typography
                            variant="caption"
                            sx={{
                                color: theme.palette.text.secondary,
                                textTransform: "uppercase",
                                letterSpacing: 0.8,
                                fontSize: 11,
                                fontWeight: 600,
                                display: "block",
                                mb: 0.5,
                            }}
                        >
                            Next Step
                        </Typography>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            gutterBottom
                            sx={{ color: theme.palette.text.primary }}
                        >
                            {action.label}
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: theme.palette.text.secondary, lineHeight: 1.6 }}
                        >
                            {action.description}
                        </Typography>
                    </Box>

                    <Button
                        variant="contained"
                        color={isRollover ? "warning" : "primary"}
                        onClick={isRollover ? onOpenRollover : onOpenAdvance}
                        endIcon={<ChevronRightIcon />}
                        fullWidth={isMobile}
                        sx={{
                            borderRadius: 2,
                            textTransform: "none",
                            fontWeight: 600,
                            px: 3,
                            py: 1.2,
                            flexShrink: 0,
                            alignSelf: { xs: "stretch", sm: "center" },
                            boxShadow: "none",
                            "&:hover": { boxShadow: "none" },
                        }}
                    >
                        {isRollover ? "Start Rollover" : "Advance Now"}
                    </Button>
                </Stack>
            </CardContent>
        </Card>
    );
}

/* ═══════════════════════════════════════════════════════════════════════
   HISTORY NOTE
   ═══════════════════════════════════════════════════════════════════════ */

function HistoryCardNote() {
    const theme = useTheme();
    return (
        <Card
            elevation={0}
            sx={{
                borderRadius: 3,
                bgcolor: theme.palette.background.default,
                border: `1px solid ${theme.palette.divider}`,
            }}
        >
            <CardContent sx={{ p: { xs: 2.5, sm: 3.5 } }}>
                <Stack direction="row" alignItems="center" spacing={2}>
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            bgcolor: `${theme.palette.text.secondary}15`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <HistoryIcon
                            sx={{ color: theme.palette.text.secondary, fontSize: 22 }}
                        />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{ color: theme.palette.text.primary }}
                        >
                            Past Actions
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: theme.palette.text.secondary, mt: 0.5 }}
                        >
                            A full audit of every term advancement and session
                            rollover is available in the Activity Log.
                        </Typography>
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
}

/* ═══════════════════════════════════════════════════════════════════════
   ADVANCE TERM MODAL
   ═══════════════════════════════════════════════════════════════════════ */

function AdvanceTermModal({
    open,
    onClose,
    school,
    currentTerm,
    nextTerm,
    isMobile,
    onSuccess,
}: {
    open: boolean;
    onClose: () => void;
    school: SchoolInfoResponse;
    currentTerm: number;
    nextTerm: number | null;
    isMobile: boolean;
    onSuccess: () => Promise<void>;
}) {
    const theme = useTheme();
    const [newTermStart, setNewTermStart] = useState<Dayjs | null>(
        dayjs().add(1, "day")
    );
    const [newTermEnd, setNewTermEnd] = useState<Dayjs | null>(
        dayjs().add(3, "month")
    );
    const [nextTermBegins, setNextTermBegins] = useState<Dayjs | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (open) {
            setNewTermStart(dayjs().add(1, "day"));
            setNewTermEnd(dayjs().add(3, "month"));
            setNextTermBegins(null);
            setError(null);
        }
    }, [open]);

    if (!nextTerm) return null;

    const handleConfirm = async () => {
        if (!newTermStart || !newTermEnd) {
            setError("Please provide both a start and end date.");
            return;
        }
        if (newTermEnd.isBefore(newTermStart)) {
            setError("Term end date must be after the start date.");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            await accountService.advanceTerm({
                schoolId: school.id,
                newTerm: nextTerm,
                newTermStartDate: newTermStart.format("YYYY-MM-DD"),
                newTermEndDate: newTermEnd.format("YYYY-MM-DD"),
                nextTermBegins: nextTermBegins
                    ? nextTermBegins.format("YYYY-MM-DD")
                    : null,
            });

            await onSuccess();
            onClose();
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to advance term."
            );
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="sm"
            fullScreen={isMobile}
            PaperProps={{ sx: { bgcolor: theme.palette.background.default } }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    pb: 1,
                }}
            >
                <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{ color: theme.palette.text.primary }}
                >
                    Advance to {termLabels[nextTerm]}
                </Typography>
                <IconButton onClick={onClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <DialogContent dividers>
                <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <Alert
                        severity="info"
                        icon={<InfoIcon />}
                        sx={{ mb: 3, borderRadius: 2 }}
                    >
                        Students remain in their current classes. Only the school's
                        current term will change.
                    </Alert>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Stack spacing={2.5}>
                        <Box>
                            <Typography
                                variant="caption"
                                sx={{
                                    color: theme.palette.text.secondary,
                                    display: "block",
                                    mb: 0.5,
                                    fontWeight: 600,
                                }}
                            >
                                Moving from
                            </Typography>
                            <Typography
                                variant="body1"
                                fontWeight={600}
                                sx={{ color: theme.palette.text.primary }}
                            >
                                {termLabels[currentTerm]}
                            </Typography>
                        </Box>

                        <DatePicker
                            label="New Term Start Date"
                            value={newTermStart}
                            onChange={(value) => setNewTermStart(value as Dayjs | null)}
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                        <DatePicker
                            label="New Term End Date"
                            value={newTermEnd}
                            onChange={(value) => setNewTermEnd(value as Dayjs | null)}
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                        <DatePicker
                            label="Next Term Begins (optional)"
                            value={nextTermBegins}
                            onChange={(value) => setNextTermBegins(value as Dayjs | null)}
                            slotProps={{ textField: { fullWidth: true } }}
                        />
                    </Stack>
                </LocalizationProvider>
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1 }}>
                <Button
                    onClick={onClose}
                    variant="outlined"
                    disabled={submitting}
                    sx={{ textTransform: "none" }}
                >
                    Cancel
                </Button>
                <Button
                    onClick={handleConfirm}
                    variant="contained"
                    disabled={submitting || !newTermStart || !newTermEnd}
                    sx={{ textTransform: "none" }}
                >
                    {submitting ? "Advancing..." : "Confirm"}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

/* ═══════════════════════════════════════════════════════════════════════
   ROLLOVER WIZARD
   ═══════════════════════════════════════════════════════════════════════ */

const ROLLOVER_STEPS = ["Details", "Preview", "Confirm", "Done"] as const;

function RolloverWizard({
    open,
    onClose,
    school,
    sessionLabels,
    isMobile,
    onSuccess,
}: {
    open: boolean;
    onClose: () => void;
    school: SchoolInfoResponse;
    sessionLabels: Record<number, string>;
    isMobile: boolean;
    onSuccess: () => Promise<void>;
}) {
    const theme = useTheme();

    const [activeStep, setActiveStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [ackChecked, setAckChecked] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [newSession, setNewSession] = useState<number | null>(null);
    const [termStart, setTermStart] = useState<Dayjs | null>(
        dayjs().add(1, "month")
    );
    const [termEnd, setTermEnd] = useState<Dayjs | null>(dayjs().add(4, "month"));
    const [nextTermBegins, setNextTermBegins] = useState<Dayjs | null>(null);
    const [promoteStudents, setPromoteStudents] = useState(true);

    const [preview, setPreview] = useState<RolloverPreviewResponse | null>(null);

    useEffect(() => {
        if (open) {
            setActiveStep(0);
            setNewSession(null);
            setTermStart(dayjs().add(1, "month"));
            setTermEnd(dayjs().add(4, "month"));
            setNextTermBegins(null);
            setPromoteStudents(true);
            setAckChecked(false);
            setPreview(null);
            setError(null);
            setSubmitting(false);
            setLoadingPreview(false);
        }
    }, [open]);

    const handleClose = () => {
        onClose();
    };

    const handleLoadPreview = async () => {
        if (!newSession) {
            setError("Please pick a new session first.");
            return;
        }

        setLoadingPreview(true);
        setError(null);

        try {
            const data = await accountService.previewRollover(
                school.id,
                newSession
            );
            if (data.error) {
                setError(data.error);
            } else {
                setPreview(data);
                setActiveStep(1);
            }
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to load preview."
            );
        } finally {
            setLoadingPreview(false);
        }
    };

    const handleConfirm = async () => {
        if (!newSession || !termStart || !termEnd) {
            setError("Missing required fields.");
            return;
        }
        if (termEnd.isBefore(termStart)) {
            setError("Term end date must be after the start date.");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            const result = await accountService.rolloverSession({
                schoolId: school.id,
                newSession,
                newTermStartDate: termStart.format("YYYY-MM-DD"),
                newTermEndDate: termEnd.format("YYYY-MM-DD"),
                nextTermBegins: nextTermBegins
                    ? nextTermBegins.format("YYYY-MM-DD")
                    : null,
                promoteStudents,
            });

            setPreview({
                schoolId: school.id,
                currentSession: school.currentSession,
                currentTerm: school.currentTerm,
                newSession,
                totalStudents: result.totalStudents,
                promotedCount: result.promotedCount,
                graduatedCount: result.graduatedCount,
                promotions: result.promotions,
            });

            await onSuccess();
            setActiveStep(3);
        } catch (err: any) {
            setError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to roll over session."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const canAdvanceStep0 =
        newSession !== null && termStart !== null && termEnd !== null;

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            fullWidth
            maxWidth="md"
            fullScreen={isMobile}
            PaperProps={{ sx: { bgcolor: theme.palette.background.default } }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    pb: 1,
                }}
            >
                <Box>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{ color: theme.palette.text.primary }}
                    >
                        End Session & Roll Over
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{ color: theme.palette.text.secondary }}
                    >
                        Step {activeStep + 1} of {ROLLOVER_STEPS.length} ·{" "}
                        {ROLLOVER_STEPS[activeStep]}
                    </Typography>
                </Box>
                <IconButton onClick={handleClose} size="small">
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            <LinearProgress
                variant="determinate"
                value={((activeStep + 1) / ROLLOVER_STEPS.length) * 100}
                sx={{ height: 3 }}
            />

            <DialogContent dividers sx={{ p: { xs: 2, sm: 3 } }}>
                {error && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                        {error}
                    </Alert>
                )}

                {activeStep === 0 && (
                    <RolloverStep1Details
                        school={school}
                        sessionLabels={sessionLabels}
                        newSession={newSession}
                        setNewSession={setNewSession}
                        termStart={termStart}
                        setTermStart={setTermStart}
                        termEnd={termEnd}
                        setTermEnd={setTermEnd}
                        nextTermBegins={nextTermBegins}
                        setNextTermBegins={setNextTermBegins}
                        promoteStudents={promoteStudents}
                        setPromoteStudents={setPromoteStudents}
                    />
                )}

                {activeStep === 1 && preview && (
                    <RolloverStep2Preview
                        preview={preview}
                        sessionLabels={sessionLabels}
                    />
                )}

                {activeStep === 2 && preview && (
                    <RolloverStep3Confirm
                        preview={preview}
                        sessionLabels={sessionLabels}
                        ackChecked={ackChecked}
                        setAckChecked={setAckChecked}
                    />
                )}

                {activeStep === 3 && preview && (
                    <RolloverStep4Success
                        preview={preview}
                        sessionLabels={sessionLabels}
                    />
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2, gap: 1, flexWrap: "wrap" }}>
                {activeStep === 0 && (
                    <>
                        <Button
                            onClick={handleClose}
                            variant="outlined"
                            sx={{ textTransform: "none" }}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleLoadPreview}
                            variant="contained"
                            disabled={!canAdvanceStep0 || loadingPreview}
                            endIcon={<ChevronRightIcon />}
                            sx={{ textTransform: "none" }}
                        >
                            {loadingPreview ? "Loading preview..." : "Load Preview"}
                        </Button>
                    </>
                )}

                {activeStep === 1 && (
                    <>
                        <Button
                            onClick={() => setActiveStep(0)}
                            variant="outlined"
                            sx={{ textTransform: "none" }}
                        >
                            Back
                        </Button>
                        <Button
                            onClick={() => setActiveStep(2)}
                            variant="contained"
                            endIcon={<ChevronRightIcon />}
                            sx={{ textTransform: "none" }}
                        >
                            Continue
                        </Button>
                    </>
                )}

                {activeStep === 2 && (
                    <>
                        <Button
                            onClick={() => setActiveStep(1)}
                            variant="outlined"
                            sx={{ textTransform: "none" }}
                        >
                            Back
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            variant="contained"
                            color="warning"
                            disabled={!ackChecked || submitting}
                            sx={{ textTransform: "none" }}
                        >
                            {submitting ? "Rolling over..." : "Confirm Rollover"}
                        </Button>
                    </>
                )}

                {activeStep === 3 && (
                    <Button
                        onClick={handleClose}
                        variant="contained"
                        sx={{ textTransform: "none" }}
                    >
                        Done
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
}

/* ─── Step 1: Details ─── */

function RolloverStep1Details({
    school,
    sessionLabels,
    newSession,
    setNewSession,
    termStart,
    setTermStart,
    termEnd,
    setTermEnd,
    nextTermBegins,
    setNextTermBegins,
    promoteStudents,
    setPromoteStudents,
}: {
    school: SchoolInfoResponse;
    sessionLabels: Record<number, string>;
    newSession: number | null;
    setNewSession: (n: number) => void;
    termStart: Dayjs | null;
    setTermStart: (d: Dayjs | null) => void;
    termEnd: Dayjs | null;
    setTermEnd: (d: Dayjs | null) => void;
    nextTermBegins: Dayjs | null;
    setNextTermBegins: (d: Dayjs | null) => void;
    promoteStudents: boolean;
    setPromoteStudents: (v: boolean) => void;
}) {
    const theme = useTheme();

    const availableSessions = useMemo(() => {
        const currentVal = school.currentSession ?? 0;
        return Object.entries(sessionLabels)
            .map(([value, label]) => ({ value: Number(value), label }))
            .filter((s) => s.value > currentVal)
            .sort((a, b) => a.value - b.value);
    }, [school.currentSession, sessionLabels]);

    const currentSessionLabel = school.currentSession
        ? sessionLabels[school.currentSession] ?? `Session ${school.currentSession}`
        : "Current Session";

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Stack spacing={3}>
                <Alert severity="info" sx={{ borderRadius: 2 }}>
                    You are ending <b>{currentSessionLabel}</b>. All student scores,
                    attendance, and reports from this session are preserved and
                    remain accessible.
                </Alert>

                {availableSessions.length === 0 ? (
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        There are no later sessions configured. Add a future session
                        to the School Sessions enum first.
                    </Alert>
                ) : (
                    <Box>
                        <Typography
                            variant="caption"
                            sx={{
                                color: theme.palette.text.secondary,
                                display: "block",
                                mb: 1,
                                fontWeight: 600,
                            }}
                        >
                            New Session
                        </Typography>
                        <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                            sx={{ gap: 1 }}
                        >
                            {availableSessions.map((s) => (
                                <Chip
                                    key={s.value}
                                    label={s.label}
                                    onClick={() => setNewSession(s.value)}
                                    color={newSession === s.value ? "primary" : "default"}
                                    variant={newSession === s.value ? "filled" : "outlined"}
                                    sx={{ fontWeight: 600 }}
                                />
                            ))}
                        </Stack>
                    </Box>
                )}

                <DatePicker
                    label="Term 1 Start Date"
                    value={termStart}
                    onChange={(v) => setTermStart(v as Dayjs | null)}
                    slotProps={{ textField: { fullWidth: true } }}
                />
                <DatePicker
                    label="Term 1 End Date"
                    value={termEnd}
                    onChange={(v) => setTermEnd(v as Dayjs | null)}
                    slotProps={{ textField: { fullWidth: true } }}
                />
                <DatePicker
                    label="Next Term Begins (optional)"
                    value={nextTermBegins}
                    onChange={(v) => setNextTermBegins(v as Dayjs | null)}
                    slotProps={{ textField: { fullWidth: true } }}
                />

                <Box
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                    }}
                >
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={promoteStudents}
                                onChange={(e) => setPromoteStudents(e.target.checked)}
                            />
                        }
                        label={
                            <Box>
                                <Typography
                                    variant="body2"
                                    fontWeight={600}
                                    sx={{ color: theme.palette.text.primary }}
                                >
                                    Promote students to their next class
                                </Typography>
                                <Typography
                                    variant="caption"
                                    sx={{ color: theme.palette.text.secondary }}
                                >
                                    Recommended. You'll see exactly who moves where in
                                    the next step.
                                </Typography>
                            </Box>
                        }
                    />
                </Box>
            </Stack>
        </LocalizationProvider>
    );
}

/* ─── Step 2: Preview ─── */

function RolloverStep2Preview({
    preview,
    sessionLabels,
}: {
    preview: RolloverPreviewResponse;
    sessionLabels: Record<number, string>;
}) {
    const theme = useTheme();
    const [showFullList, setShowFullList] = useState(false);

    const sessionLabel = preview.currentSession
        ? sessionLabels[preview.currentSession] ?? `Session ${preview.currentSession}`
        : "Current";
    const newSessionLabel = preview.newSession
        ? sessionLabels[preview.newSession] ?? `Session ${preview.newSession}`
        : "New";

    const perClass = useMemo(() => {
        const buckets = new Map<
            string,
            { from: string; to: string; outcome: string; count: number }
        >();

        preview.promotions.forEach((p) => {
            const to =
                p.outcome === "Graduated" ? "Graduated" : p.toClassName ?? "—";
            const key = `${p.fromClassName}|${to}|${p.outcome}`;

            const existing = buckets.get(key);
            if (existing) {
                existing.count++;
            } else {
                buckets.set(key, {
                    from: p.fromClassName,
                    to,
                    outcome: p.outcome,
                    count: 1,
                });
            }
        });

        return Array.from(buckets.values()).sort((a, b) =>
            a.from.localeCompare(b.from)
        );
    }, [preview.promotions]);

    return (
        <Stack spacing={3}>
            <Alert severity="info" sx={{ borderRadius: 2 }}>
                <AlertTitle sx={{ fontWeight: 700 }}>What will happen</AlertTitle>
                You are ending <b>{sessionLabel}</b> and rolling over to{" "}
                <b>{newSessionLabel}</b>, First Term.
            </Alert>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                    gap: 2,
                }}
            >
                <SummaryTile
                    value={preview.promotedCount}
                    label="Will be Promoted"
                    color={theme.palette.success.main}
                />
                <SummaryTile
                    value={preview.graduatedCount}
                    label="Will Graduate"
                    color={theme.palette.info.main}
                />
                <SummaryTile
                    value={preview.totalStudents}
                    label="Total Students"
                    color={theme.palette.primary.main}
                />
            </Box>

            <Box>
                <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    gutterBottom
                    sx={{ color: theme.palette.text.primary }}
                >
                    Class-by-class breakdown
                </Typography>
                <TableContainer
                    component={Paper}
                    elevation={0}
                    sx={{
                        borderRadius: 2,
                        border: `1px solid ${theme.palette.divider}`,
                        bgcolor: theme.palette.background.default,
                    }}
                >
                    <Table size="small">
                        <TableHead>
                            <TableRow sx={{ bgcolor: theme.palette.action.hover }}>
                                <TableCell sx={{ fontWeight: 700 }}>From</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>To</TableCell>
                                <TableCell sx={{ fontWeight: 700 }}>Outcome</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 700 }}>
                                    Students
                                </TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {perClass.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={4}
                                        sx={{
                                            textAlign: "center",
                                            py: 3,
                                            color: theme.palette.text.secondary,
                                        }}
                                    >
                                        No promotions to preview.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                perClass.map((row, idx) => (
                                    <TableRow key={idx}>
                                        <TableCell>{row.from}</TableCell>
                                        <TableCell>
                                            <Chip
                                                size="small"
                                                label={row.to}
                                                color={
                                                    row.outcome === "Graduated"
                                                        ? "info"
                                                        : "primary"
                                                }
                                                variant="outlined"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: theme.palette.text.secondary,
                                                    fontWeight: 600,
                                                }}
                                            >
                                                {row.outcome}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <b>{row.count}</b>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            </Box>

            {preview.promotions.length > 0 && (
                <Box>
                    <Button
                        size="small"
                        onClick={() => setShowFullList(!showFullList)}
                        endIcon={
                            showFullList ? <ExpandLessIcon /> : <ExpandMoreIcon />
                        }
                        sx={{ textTransform: "none" }}
                    >
                        {showFullList
                            ? "Hide full student list"
                            : `View full student list (${preview.promotions.length})`}
                    </Button>
                    <Collapse in={showFullList}>
                        <TableContainer
                            component={Paper}
                            elevation={0}
                            sx={{
                                mt: 1.5,
                                borderRadius: 2,
                                border: `1px solid ${theme.palette.divider}`,
                                maxHeight: 320,
                                bgcolor: theme.palette.background.default,
                            }}
                        >
                            <Table size="small" stickyHeader>
                                <TableHead>
                                    <TableRow>
                                        <TableCell sx={{ fontWeight: 700 }}>
                                            Student
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>
                                            From
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>
                                            To
                                        </TableCell>
                                        <TableCell sx={{ fontWeight: 700 }}>
                                            Outcome
                                        </TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {preview.promotions.map((p) => (
                                        <TableRow key={p.studentId}>
                                            <TableCell>{p.studentName}</TableCell>
                                            <TableCell>{p.fromClassName}</TableCell>
                                            <TableCell>
                                                {p.outcome === "Graduated"
                                                    ? "—"
                                                    : p.toClassName ?? "—"}
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    size="small"
                                                    label={p.outcome}
                                                    color={
                                                        p.outcome === "Graduated"
                                                            ? "info"
                                                            : "success"
                                                    }
                                                    variant="outlined"
                                                />
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Collapse>
                </Box>
            )}
        </Stack>
    );
}

/* ─── Step 3: Confirm ─── */

function RolloverStep3Confirm({
    preview,
    sessionLabels,
    ackChecked,
    setAckChecked,
}: {
    preview: RolloverPreviewResponse;
    sessionLabels: Record<number, string>;
    ackChecked: boolean;
    setAckChecked: (v: boolean) => void;
}) {
    const theme = useTheme();

    const currentLabel = preview.currentSession
        ? sessionLabels[preview.currentSession] ?? `Session ${preview.currentSession}`
        : "Current";
    const newLabel = preview.newSession
        ? sessionLabels[preview.newSession] ?? `Session ${preview.newSession}`
        : "Next";

    return (
        <Stack spacing={3}>
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
                <AlertTitle sx={{ fontWeight: 700 }}>
                    Review before confirming
                </AlertTitle>
                You are about to end <b>{currentLabel}</b> and roll over to{" "}
                <b>{newLabel}</b>, First Term. This action cannot be undone from the
                UI.
            </Alert>

            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                    gap: 2,
                }}
            >
                <SummaryTile
                    value={preview.promotedCount}
                    label="Will be Promoted"
                    color={theme.palette.success.main}
                />
                <SummaryTile
                    value={preview.graduatedCount}
                    label="Will Graduate"
                    color={theme.palette.info.main}
                />
                <SummaryTile
                    value={preview.totalStudents}
                    label="Total Students"
                    color={theme.palette.primary.main}
                />
            </Box>

            <Box
                sx={{
                    p: 2,
                    borderRadius: 2,
                    bgcolor: `${theme.palette.warning.main}10`,
                    border: `1px solid ${theme.palette.warning.main}40`,
                }}
            >
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={ackChecked}
                            onChange={(e) => setAckChecked(e.target.checked)}
                            color="warning"
                        />
                    }
                    label={
                        <Typography
                            variant="body2"
                            fontWeight={600}
                            sx={{ color: theme.palette.text.primary }}
                        >
                            I understand this action promotes students and cannot be
                            undone.
                        </Typography>
                    }
                />
            </Box>
        </Stack>
    );
}

/* ─── Step 4: Success ─── */

function RolloverStep4Success({
    preview,
    sessionLabels,
}: {
    preview: RolloverPreviewResponse;
    sessionLabels: Record<number, string>;
}) {
    const theme = useTheme();

    const newLabel = preview.newSession
        ? sessionLabels[preview.newSession] ?? `Session ${preview.newSession}`
        : "New Session";

    return (
        <Stack spacing={3} alignItems="center" sx={{ py: 3 }}>
            <Box
                sx={{
                    width: 80,
                    height: 80,
                    borderRadius: "50%",
                    bgcolor: `${theme.palette.success.main}20`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <CheckCircleIcon
                    sx={{ fontSize: 48, color: theme.palette.success.main }}
                />
            </Box>

            <Box sx={{ textAlign: "center" }}>
                <Typography
                    variant="h5"
                    fontWeight={700}
                    gutterBottom
                    sx={{ color: theme.palette.text.primary }}
                >
                    Rollover Complete
                </Typography>
                <Typography
                    variant="body1"
                    sx={{ color: theme.palette.text.secondary }}
                >
                    {newLabel} · First Term has begun.
                </Typography>
            </Box>

            <Box
                sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: 2,
                    width: "100%",
                    justifyContent: "center",
                }}
            >
                <SummaryTile
                    value={preview.promotedCount}
                    label="Students Promoted"
                    color={theme.palette.success.main}
                    compact
                />
                <SummaryTile
                    value={preview.graduatedCount}
                    label="Students Graduated"
                    color={theme.palette.info.main}
                    compact
                />
            </Box>

            <Alert
                severity="info"
                icon={<InfoIcon />}
                sx={{ borderRadius: 2, width: "100%" }}
            >
                Past session data is preserved. You can view past broadsheets and
                report cards from the Reports section anytime.
            </Alert>
        </Stack>
    );
}

/* ═══════════════════════════════════════════════════════════════════════
   REUSABLE BITS
   ═══════════════════════════════════════════════════════════════════════ */

function SummaryTile({
    value,
    label,
    color,
    compact,
}: {
    value: number;
    label: string;
    color: string;
    compact?: boolean;
}) {
    const theme = useTheme();
    return (
        <Box
            sx={{
                p: compact ? 2 : 2.5,
                borderRadius: 2,
                bgcolor: `${color}10`,
                border: `1px solid ${color}30`,
                textAlign: "center",
                flex: compact ? "0 1 200px" : 1,
            }}
        >
            <Typography
                variant={compact ? "h5" : "h4"}
                fontWeight={700}
                sx={{ color, lineHeight: 1.2 }}
            >
                {value}
            </Typography>
            <Typography
                variant="caption"
                sx={{
                    color: theme.palette.text.secondary,
                    display: "block",
                    mt: 0.5,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                    fontWeight: 600,
                }}
            >
                {label}
            </Typography>
        </Box>
    );
}

function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
    });
}