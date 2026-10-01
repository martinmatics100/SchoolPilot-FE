// src/pages/parent-portal/ParentPortal.tsx

import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Typography,
    Button,
    Avatar,
    Stack,
    Paper,
    Alert,
    Skeleton,
    Tooltip,
    useTheme,
    alpha,
    useMediaQuery,
    Divider,
} from "@mui/material";
import IconifyIcon from "../../components/base/iconifyIcon";
import { useAuth } from "../../context";
import {
    downloadPublishedReport,
    getMyChildrenPublishedReports,
} from "../../api/resultService";

/* ─────────────────────────────────────────────────────────────
   Types
   ───────────────────────────────────────────────────────────── */
interface WardReport {
    reportId: string;
    schoolSession: number;
    schoolTerm: number;
    schoolSessionLabel: string;
    schoolTermLabel: string;
    version: number;
    publishedAt: string;
}

interface Ward {
    id: string;
    firstName: string;
    lastName: string;
    admissionNumber: string;
    className: string;
    classLevel: string;
    gender: string;
    photoUrl?: string | null;
    resultStatus: "published" | "pending" | string;
    resultNote?: string | null;
    reports: WardReport[];
}

/* ─────────────────────────────────────────────────────────────
   Page
   ───────────────────────────────────────────────────────────── */
const ParentPortal: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const isTablet = useMediaQuery(theme.breakpoints.between("sm", "md"));
    const { selectedAccount } = useAuth();

    const [wards, setWards] = useState<Ward[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const [currentSessionLabel, setCurrentSessionLabel] = useState<string>("");
    const [currentTermLabel, setCurrentTermLabel] = useState<string>("");

    const [downloadingWardId, setDownloadingWardId] = useState<string | null>(
        null
    );

    /* ─── Load ─── */
    useEffect(() => {
        const load = async () => {
            if (!selectedAccount) return;
            setIsLoading(true);
            setErrorMessage(null);
            try {
                const response = await getMyChildrenPublishedReports(
                    selectedAccount
                );

                const mapped: Ward[] = (response.children ?? []).map((c) => ({
                    id: c.studentId,
                    firstName: c.firstName,
                    lastName: c.lastName,
                    admissionNumber: c.admissionNumber,
                    className: c.className,
                    classLevel: c.classLevel,
                    gender: c.gender,
                    photoUrl: c.photoUrl ?? undefined,
                    resultStatus: c.resultStatus,
                    resultNote: c.resultNote ?? undefined,
                    reports: c.reports ?? [],
                }));

                setWards(mapped);
                setCurrentSessionLabel(response.currentSessionLabel ?? "");
                setCurrentTermLabel(response.currentTermLabel ?? "");
            } catch (err: any) {
                setErrorMessage(
                    err?.message ?? "Failed to load your children's reports."
                );
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, [selectedAccount]);

    const publishedCount = useMemo(
        () => wards.filter((w) => w.resultStatus === "published").length,
        [wards]
    );

    const latestReportFor = (ward: Ward): WardReport | null => {
        if (!ward.reports || ward.reports.length === 0) return null;
        return ward.reports[0];
    };

    const handleDownload = async (ward: Ward) => {
        const report = latestReportFor(ward);
        if (!report || !selectedAccount) return;

        setDownloadingWardId(ward.id);
        setErrorMessage(null);

        try {
            const blob = await downloadPublishedReport(
                selectedAccount,
                report.reportId
            );

            if (!(blob instanceof Blob)) {
                throw new Error("Server did not return a file.");
            }

            const fileName =
                `${ward.lastName}_${ward.firstName}_${report.schoolTermLabel}_${report.schoolSessionLabel}.pdf`.replace(
                    /\s+/g,
                    "_"
                );

            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err: any) {
            setErrorMessage(
                err?.message ??
                "Failed to download the report. Please try again."
            );
        } finally {
            setDownloadingWardId(null);
        }
    };

    return (
        <Box
            sx={{
                minHeight: "100vh",
                width: "100%",
                bgcolor: theme.palette.background.default,
                px: { xs: 2, sm: 3, md: 5, lg: 6 },
                py: { xs: 3, sm: 4, md: 5 },
            }}
        >
            <Box sx={{ width: "100%", maxWidth: 1440, mx: "auto" }}>
                {/* ═══ Page header ═══ */}
                <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={2}
                    alignItems={{ xs: "flex-start", sm: "flex-end" }}
                    justifyContent="space-between"
                    sx={{ mb: { xs: 3, md: 4 } }}
                >
                    <Box>
                        <Typography
                            variant="caption"
                            sx={{
                                color: theme.palette.text.secondary,
                                textTransform: "uppercase",
                                letterSpacing: 1.2,
                                fontWeight: 600,
                                display: "block",
                                mb: 0.75,
                            }}
                        >
                            Parent Portal
                        </Typography>
                        <Typography
                            variant="h4"
                            fontWeight={700}
                            sx={{
                                color: theme.palette.text.primary,
                                letterSpacing: -0.5,
                                lineHeight: 1.1,
                                fontSize: {
                                    xs: "1.75rem",
                                    sm: "2.25rem",
                                    md: "2.5rem",
                                },
                            }}
                        >
                            Your Children
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                color: theme.palette.text.secondary,
                                mt: 1,
                                maxWidth: 560,
                            }}
                        >
                            View and download each child&apos;s terminal
                            report as a PDF.
                        </Typography>
                    </Box>

                    <SummaryBadge
                        publishedCount={publishedCount}
                        totalCount={wards.length}
                    />
                </Stack>

                {/* ═══ Term info strip ═══ */}
                {(currentTermLabel || currentSessionLabel) && (
                    <Paper
                        elevation={0}
                        sx={{
                            mb: { xs: 3, md: 4 },
                            borderRadius: 3,
                            border: `1px solid ${alpha(
                                theme.palette.divider,
                                0.6
                            )}`,
                            display: "grid",
                            gridTemplateColumns: {
                                xs: "1fr",
                                sm: "1fr 1fr",
                            },
                            overflow: "hidden",
                            bgcolor: theme.palette.background.default,
                        }}
                    >
                        <MetaPanel
                            icon="mdi:calendar-month-outline"
                            label="Current Term"
                            value={currentTermLabel || "—"}
                            borderRight
                        />
                        <MetaPanel
                            icon="mdi:calendar-range"
                            label="Academic Session"
                            value={currentSessionLabel || "—"}
                        />
                    </Paper>
                )}

                {/* ═══ Error ═══ */}
                {errorMessage && !isLoading && (
                    <Alert
                        severity="error"
                        onClose={() => setErrorMessage(null)}
                        sx={{ mb: 3, borderRadius: 2 }}
                    >
                        {errorMessage}
                    </Alert>
                )}

                {/* ═══ Loading ═══ */}
                {isLoading && (
                    <Stack spacing={2}>
                        {[0, 1, 2].map((i) => (
                            <SkeletonWardRow key={i} />
                        ))}
                    </Stack>
                )}

                {/* ═══ Ward list with timeline rail ═══ */}
                {!isLoading && wards.length > 0 && (
                    <Box
                        sx={{
                            position: "relative",
                            pl: { xs: 0, sm: 4 },
                        }}
                    >
                        {/* vertical rail (hidden on xs) */}
                        <Box
                            aria-hidden
                            sx={{
                                display: { xs: "none", sm: "block" },
                                position: "absolute",
                                left: 15,
                                top: 8,
                                bottom: 8,
                                width: 2,
                                background: `linear-gradient(180deg, ${alpha(
                                    theme.palette.primary.main,
                                    0.35
                                )} 0%, ${alpha(
                                    theme.palette.divider,
                                    0.2
                                )} 100%)`,
                                borderRadius: 1,
                            }}
                        />

                        <Stack spacing={2}>
                            {wards.map((ward, index) => (
                                <WardRow
                                    key={ward.id}
                                    ward={ward}
                                    index={index}
                                    isDownloading={
                                        downloadingWardId === ward.id
                                    }
                                    isAnyDownloading={
                                        downloadingWardId !== null
                                    }
                                    onDownload={handleDownload}
                                    isMobile={isMobile}
                                    isTablet={isTablet}
                                />
                            ))}
                        </Stack>
                    </Box>
                )}

                {/* ═══ Empty ═══ */}
                {!isLoading && wards.length === 0 && !errorMessage && (
                    <Paper
                        elevation={0}
                        sx={{
                            p: { xs: 4, sm: 6, md: 8 },
                            textAlign: "center",
                            borderRadius: 3,
                            border: `1px dashed ${theme.palette.divider}`,
                            bgcolor: theme.palette.background.default,
                        }}
                    >
                        <Box
                            sx={{
                                width: 80,
                                height: 80,
                                borderRadius: "50%",
                                mx: "auto",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.08
                                ),
                                color: theme.palette.primary.main,
                            }}
                        >
                            <IconifyIcon
                                icon="mdi:account-off-outline"
                                width={40}
                            />
                        </Box>
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{ mt: 2.5, color: theme.palette.text.primary }}
                        >
                            No wards found
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{
                                mt: 0.75,
                                color: theme.palette.text.secondary,
                                maxWidth: 460,
                                mx: "auto",
                            }}
                        >
                            Contact your school administrator if your child is
                            not listed here.
                        </Typography>
                    </Paper>
                )}
            </Box>

            <style>
                {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                  @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }`}
            </style>
        </Box>
    );
};

/* ─────────────────────────────────────────────────────────────
   Summary badge
   ───────────────────────────────────────────────────────────── */
const SummaryBadge: React.FC<{
    publishedCount: number;
    totalCount: number;
}> = ({ publishedCount, totalCount }) => {
    const theme = useTheme();
    const allDone = totalCount > 0 && publishedCount === totalCount;
    const color = allDone
        ? theme.palette.success.main
        : publishedCount > 0
            ? theme.palette.primary.main
            : theme.palette.text.secondary;

    return (
        <Stack
            direction="row"
            spacing={1.25}
            alignItems="center"
            sx={{
                px: 1.75,
                py: 1,
                borderRadius: 999,
                border: `1px solid ${alpha(color, 0.25)}`,
                bgcolor: alpha(color, 0.06),
                flexShrink: 0,
            }}
        >
            <Box
                sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    bgcolor: color,
                    boxShadow: `0 0 0 4px ${alpha(color, 0.15)}`,
                }}
            />
            <Typography
                variant="caption"
                fontWeight={700}
                sx={{ color, letterSpacing: 0.3 }}
            >
                {publishedCount} of {totalCount} published
            </Typography>
        </Stack>
    );
};

/* ─────────────────────────────────────────────────────────────
   Term / Session meta panel
   ───────────────────────────────────────────────────────────── */
const MetaPanel: React.FC<{
    icon: string;
    label: string;
    value: string;
    borderRight?: boolean;
}> = ({ icon, label, value, borderRight }) => {
    const theme = useTheme();
    return (
        <Box
            sx={{
                p: { xs: 2, sm: 2.5, md: 3 },
                borderRight: {
                    xs: "none",
                    sm: borderRight
                        ? `1px solid ${theme.palette.divider}`
                        : "none",
                },
                borderBottom: {
                    xs: borderRight
                        ? `1px solid ${theme.palette.divider}`
                        : "none",
                    sm: "none",
                },
                display: "flex",
                alignItems: "center",
                gap: 1.75,
            }}
        >
            <Box
                sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.main,
                    flexShrink: 0,
                }}
            >
                <IconifyIcon icon={icon} width={20} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography
                    variant="caption"
                    sx={{
                        color: theme.palette.text.secondary,
                        textTransform: "uppercase",
                        letterSpacing: 0.8,
                        fontWeight: 600,
                        display: "block",
                        fontSize: "0.65rem",
                    }}
                >
                    {label}
                </Typography>
                <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{
                        color: theme.palette.text.primary,
                        lineHeight: 1.2,
                    }}
                >
                    {value}
                </Typography>
            </Box>
        </Box>
    );
};

/* ─────────────────────────────────────────────────────────────
   Ward row — three-zone horizontal layout on wide screens
   ───────────────────────────────────────────────────────────── */
const WardRow: React.FC<{
    ward: Ward;
    index: number;
    isDownloading: boolean;
    isAnyDownloading: boolean;
    onDownload: (ward: Ward) => void;
    isMobile: boolean;
    isTablet: boolean;
}> = ({
    ward,
    index,
    isDownloading,
    isAnyDownloading,
    onDownload,
    isMobile,
    isTablet,
}) => {
        const theme = useTheme();

        const initials = `${ward.firstName?.[0] ?? ""}${ward.lastName?.[0] ?? ""
            }`.toUpperCase();

        const isPublished = ward.resultStatus === "published";
        const hasReport = (ward.reports?.length ?? 0) > 0;
        const canDownload = isPublished && hasReport;
        const isFemale = ward.gender?.toLowerCase() === "female";
        const latestReport = ward.reports?.[0] ?? null;

        const accent = isFemale
            ? theme.palette.secondary.main
            : theme.palette.primary.main;

        const stackVertical = isMobile || isTablet;

        return (
            <Paper
                elevation={0}
                sx={{
                    position: "relative",
                    borderRadius: 3,
                    border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                    bgcolor: theme.palette.background.default,
                    transition:
                        "border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease",
                    animation: `fadeUp 0.35s ease ${index * 0.04}s both`,
                    "&:hover": {
                        borderColor: alpha(accent, 0.35),
                        boxShadow: `0 6px 24px ${alpha(accent, 0.1)}`,
                        transform: {
                            xs: "none",
                            sm: "translateY(-1px)",
                        },
                    },
                }}
            >
                {/* Timeline node (hidden on xs) */}
                <Box
                    aria-hidden
                    sx={{
                        display: { xs: "none", sm: "flex" },
                        position: "absolute",
                        left: -32,
                        top: 30,
                        width: 24,
                        height: 24,
                        borderRadius: "50%",
                        bgcolor: theme.palette.background.default,
                        border: `2px solid ${alpha(accent, 0.4)}`,
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1,
                    }}
                >
                    <Box
                        sx={{
                            width: 8,
                            height: 8,
                            borderRadius: "50%",
                            bgcolor: accent,
                        }}
                    />
                </Box>

                <Stack
                    direction={stackVertical ? "column" : "row"}
                    spacing={{ xs: 2, md: 3 }}
                    alignItems={stackVertical ? "stretch" : "center"}
                    sx={{ p: { xs: 2, sm: 2.5, md: 3 } }}
                >
                    {/* ── Zone 1: Identity ── */}
                    <Stack
                        direction="row"
                        spacing={2}
                        alignItems="center"
                        sx={{
                            minWidth: 0,
                            flex: { md: "0 0 320px" },
                        }}
                    >
                        <Box sx={{ position: "relative", flexShrink: 0 }}>
                            <Avatar
                                src={ward.photoUrl ?? undefined}
                                sx={{
                                    width: { xs: 56, sm: 64 },
                                    height: { xs: 56, sm: 64 },
                                    fontSize: 22,
                                    fontWeight: 700,
                                    bgcolor: alpha(accent, 0.1),
                                    color: accent,
                                    border: `1.5px solid ${alpha(accent, 0.2)}`,
                                }}
                            >
                                {initials}
                            </Avatar>
                            {/* status dot on avatar */}
                            <Box
                                sx={{
                                    position: "absolute",
                                    right: -1,
                                    bottom: -1,
                                    width: 16,
                                    height: 16,
                                    borderRadius: "50%",
                                    bgcolor: isPublished
                                        ? theme.palette.success.main
                                        : theme.palette.warning.main,
                                    border: `2.5px solid ${theme.palette.background.default}`,
                                }}
                            />
                        </Box>

                        <Box sx={{ minWidth: 0, flex: 1 }}>
                            <Typography
                                variant="subtitle1"
                                fontWeight={700}
                                sx={{
                                    color: theme.palette.text.primary,
                                    lineHeight: 1.2,
                                    fontSize: { xs: "1rem", sm: "1.0625rem" },
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    whiteSpace: "nowrap",
                                }}
                            >
                                {ward.firstName} {ward.lastName}
                            </Typography>

                            <Typography
                                variant="caption"
                                sx={{
                                    color: theme.palette.text.secondary,
                                    display: "block",
                                    mt: 0.25,
                                    fontFamily: "monospace",
                                    letterSpacing: 0.3,
                                }}
                            >
                                {ward.admissionNumber}
                            </Typography>

                            {/* status line */}
                            <Typography
                                variant="caption"
                                sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 0.5,
                                    mt: 0.75,
                                    color: canDownload
                                        ? theme.palette.success.main
                                        : theme.palette.text.secondary,
                                    fontWeight: 600,
                                }}
                            >
                                <IconifyIcon
                                    icon={
                                        canDownload
                                            ? "mdi:check-circle-outline"
                                            : "mdi:clock-outline"
                                    }
                                    width={14}
                                />
                                {canDownload
                                    ? `${latestReport?.schoolTermLabel ?? "Result"
                                    } ready`
                                    : ward.resultNote ??
                                    "Results will be published soon"}
                            </Typography>
                        </Box>
                    </Stack>

                    {/* ── Divider between zones on wide screens ── */}
                    {!stackVertical && (
                        <Divider
                            orientation="vertical"
                            flexItem
                            sx={{
                                alignSelf: "stretch",
                                borderColor: alpha(theme.palette.divider, 0.6),
                            }}
                        />
                    )}

                    {/* ── Zone 2: Class metadata (takes remaining width) ── */}
                    <Stack
                        direction="row"
                        spacing={{ xs: 2, md: 3 }}
                        alignItems="center"
                        flexWrap="wrap"
                        sx={{ flex: 1, minWidth: 0 }}
                    >
                        <MetaInline
                            icon="mdi:google-classroom"
                            label="Class"
                            value={ward.className || "—"}
                        />
                        <MetaInline
                            icon="mdi:school-outline"
                            label="Level"
                            value={ward.classLevel || "—"}
                        />
                        {latestReport && (
                            <MetaInline
                                icon="mdi:calendar-check-outline"
                                label="Term"
                                value={latestReport.schoolTermLabel || "—"}
                            />
                        )}
                    </Stack>

                    {/* ── Zone 3: Action ── */}
                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: stackVertical
                                ? "stretch"
                                : "flex-end",
                            alignItems: "center",
                            flexShrink: 0,
                            minWidth: { md: 180 },
                        }}
                    >
                        <Tooltip
                            arrow
                            title={
                                canDownload ? "Download report card" : ""
                            }
                            placement="top"
                            disableHoverListener={!canDownload}
                        >
                            <span
                                style={{
                                    display: "block",
                                    width: stackVertical ? "100%" : "auto",
                                }}
                            >
                                <Button
                                    fullWidth={stackVertical}
                                    variant={
                                        canDownload ? "contained" : "outlined"
                                    }
                                    disabled={
                                        !canDownload ||
                                        isDownloading ||
                                        isAnyDownloading
                                    }
                                    onClick={() => onDownload(ward)}
                                    startIcon={
                                        isDownloading ? (
                                            <IconifyIcon
                                                icon="mdi:loading"
                                                width={18}
                                                style={{
                                                    animation:
                                                        "spin 0.9s linear infinite",
                                                }}
                                            />
                                        ) : (
                                            <IconifyIcon
                                                icon={
                                                    canDownload
                                                        ? "mdi:download-outline"
                                                        : "mdi:lock-outline"
                                                }
                                                width={18}
                                            />
                                        )
                                    }
                                    sx={{
                                        textTransform: "none",
                                        fontWeight: 600,
                                        fontSize: "0.875rem",
                                        borderRadius: 2,
                                        px: 2.5,
                                        py: 1,
                                        minWidth: { md: 170 },
                                        ...(canDownload
                                            ? {
                                                bgcolor: accent,
                                                color: "#fff",
                                                boxShadow: `0 2px 10px ${alpha(
                                                    accent,
                                                    0.25
                                                )}`,
                                                "&:hover": {
                                                    bgcolor: accent,
                                                    boxShadow: `0 4px 16px ${alpha(
                                                        accent,
                                                        0.4
                                                    )}`,
                                                },
                                            }
                                            : {
                                                borderColor: alpha(
                                                    theme.palette.divider,
                                                    0.8
                                                ),
                                                color: theme.palette.text
                                                    .secondary,
                                            }),
                                    }}
                                >
                                    {isDownloading
                                        ? "Downloading..."
                                        : canDownload
                                            ? "Download"
                                            : "Locked"}
                                </Button>
                            </span>
                        </Tooltip>
                    </Box>
                </Stack>
            </Paper>
        );
    };

/* ─────────────────────────────────────────────────────────────
   Inline meta — icon + uppercase label + value on one line
   ───────────────────────────────────────────────────────────── */
const MetaInline: React.FC<{
    icon: string;
    label: string;
    value: string;
}> = ({ icon, label, value }) => {
    const theme = useTheme();
    return (
        <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ minWidth: 0 }}
        >
            <Box
                sx={{
                    width: 30,
                    height: 30,
                    borderRadius: 1.5,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    bgcolor: alpha(theme.palette.primary.main, 0.06),
                    color: theme.palette.primary.main,
                    flexShrink: 0,
                }}
            >
                <IconifyIcon icon={icon} width={16} />
            </Box>
            <Box sx={{ minWidth: 0 }}>
                <Typography
                    variant="caption"
                    sx={{
                        color: theme.palette.text.secondary,
                        textTransform: "uppercase",
                        letterSpacing: 0.6,
                        fontWeight: 600,
                        fontSize: "0.625rem",
                        display: "block",
                        lineHeight: 1,
                    }}
                >
                    {label}
                </Typography>
                <Typography
                    variant="body2"
                    fontWeight={600}
                    sx={{
                        color: theme.palette.text.primary,
                        lineHeight: 1.2,
                        mt: 0.25,
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                    }}
                >
                    {value}
                </Typography>
            </Box>
        </Stack>
    );
};

/* ─────────────────────────────────────────────────────────────
   Skeleton row — mirrors the wide three-zone layout
   ───────────────────────────────────────────────────────────── */
const SkeletonWardRow: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));

    return (
        <Paper
            elevation={0}
            sx={{
                borderRadius: 3,
                border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                bgcolor: theme.palette.background.default,
                p: { xs: 2, sm: 2.5, md: 3 },
            }}
        >
            <Stack
                direction={isMobile ? "column" : "row"}
                spacing={{ xs: 2, md: 3 }}
                alignItems={isMobile ? "stretch" : "center"}
            >
                {/* Identity zone */}
                <Stack
                    direction="row"
                    spacing={2}
                    alignItems="center"
                    sx={{ flex: { md: "0 0 320px" } }}
                >
                    <Skeleton variant="circular" width={64} height={64} />
                    <Box sx={{ flex: 1 }}>
                        <Skeleton variant="text" width="70%" height={22} />
                        <Skeleton variant="text" width="50%" height={16} />
                        <Skeleton variant="text" width="80%" height={14} />
                    </Box>
                </Stack>

                {!isMobile && (
                    <Divider
                        orientation="vertical"
                        flexItem
                        sx={{
                            alignSelf: "stretch",
                            borderColor: alpha(theme.palette.divider, 0.6),
                        }}
                    />
                )}

                {/* Meta zone */}
                <Stack
                    direction="row"
                    spacing={{ xs: 2, md: 3 }}
                    sx={{ flex: 1 }}
                >
                    <Skeleton variant="text" width={100} height={32} />
                    <Skeleton variant="text" width={100} height={32} />
                    <Skeleton variant="text" width={100} height={32} />
                </Stack>

                {/* Action zone */}
                <Skeleton
                    variant="rounded"
                    width={isMobile ? "100%" : 170}
                    height={40}
                    sx={{ borderRadius: 2, flexShrink: 0 }}
                />
            </Stack>
        </Paper>
    );
};

export default ParentPortal;