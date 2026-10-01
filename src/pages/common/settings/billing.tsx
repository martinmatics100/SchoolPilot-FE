import React, { useEffect, useMemo, useState } from "react";
import {
    Box,
    Typography,
    Card,
    CardContent,
    Button,
    Stack,
    Divider,
    Chip,
    alpha,
    useTheme,
    IconButton,
    Tooltip,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Tabs,
    Tab,
    CircularProgress,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    Alert,
    InputAdornment,
    Skeleton,
    Snackbar,
    LinearProgress,
} from "@mui/material";
import IconifyIcon from "../../../components/base/iconifyIcon";
import { useAuth } from "../../../context";
import { useEnums } from "../../../hooks/useEnums";
import {
    getCurrentBillingState,
    getOrCreatePaymentReference,
    submitPaymentProof,
    getMyPaymentSubmissions,
    type CurrentBillingState,
} from "../../../api/billingService";

/* ─────────────────────────────────────────────────────────────
   TAB PANEL
   ───────────────────────────────────────────────────────────── */
interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}
const TabPanel = (props: TabPanelProps) => {
    const { children, value, index, ...other } = props;
    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`billing-tabpanel-${index}`}
            aria-labelledby={`billing-tab-${index}`}
            {...other}
        >
            {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
        </div>
    );
};

/* ─────────────────────────────────────────────────────────────
   STAT CARD
   ───────────────────────────────────────────────────────────── */
const StatCard = ({
    icon,
    iconColor,
    label,
    value,
    helper,
}: {
    icon: string;
    iconColor: string;
    label: string;
    value: string;
    helper?: string;
}) => {
    const theme = useTheme();
    return (
        <Card
            elevation={0}
            sx={{
                p: 2.5,
                borderRadius: 3,
                bgcolor: theme.palette.background.default,
                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            }}
        >
            <Stack direction="row" alignItems="center" spacing={2}>
                <Box
                    sx={{
                        width: 44,
                        height: 44,
                        borderRadius: 2,
                        bgcolor: alpha(iconColor, 0.1),
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                    }}
                >
                    <IconifyIcon icon={icon} width={22} color={iconColor} />
                </Box>
                <Box sx={{ minWidth: 0, flex: 1 }}>
                    <Typography
                        variant="caption"
                        sx={{ color: theme.palette.text.secondary }}
                    >
                        {label}
                    </Typography>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            color: theme.palette.text.primary,
                        }}
                    >
                        {value}
                    </Typography>
                    {helper && (
                        <Typography
                            variant="caption"
                            sx={{
                                color: theme.palette.text.secondary,
                                display: "block",
                                mt: 0.25,
                            }}
                        >
                            {helper}
                        </Typography>
                    )}
                </Box>
            </Stack>
        </Card>
    );
};

/* ─────────────────────────────────────────────────────────────
   STATUS CHIP
   ───────────────────────────────────────────────────────────── */
const SubmissionStatusChip = ({ status }: { status: string }) => {
    const config = {
        Pending: {
            label: "Pending",
            color: "warning",
            icon: "mdi:clock-outline",
        },
        Verified: {
            label: "Verified",
            color: "success",
            icon: "mdi:check-circle-outline",
        },
        Rejected: {
            label: "Rejected",
            color: "error",
            icon: "mdi:close-circle-outline",
        },
    } as const;

    const c = config[status as keyof typeof config] ?? config.Pending;

    return (
        <Chip
            icon={<IconifyIcon icon={c.icon} width={16} />}
            label={c.label}
            color={c.color}
            size="small"
            sx={{
                fontWeight: 600,
                fontSize: "0.7rem",
                "& .MuiChip-icon": { ml: 0.5 },
            }}
        />
    );
};

/* ─────────────────────────────────────────────────────────────
   DETAIL ROW
   ───────────────────────────────────────────────────────────── */
const DetailRow = ({ label, value }: { label: string; value: string }) => {
    const theme = useTheme();
    return (
        <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
        >
            <Typography
                variant="caption"
                sx={{ color: theme.palette.text.secondary }}
            >
                {label}
            </Typography>
            <Typography
                variant="body2"
                fontWeight={600}
                sx={{ color: theme.palette.text.primary }}
            >
                {value}
            </Typography>
        </Stack>
    );
};

/* ─────────────────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────────────────── */
const formatDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
    });
};

const daysUntil = (iso: string | null) => {
    if (!iso) return 0;
    return Math.max(
        0,
        Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000)
    );
};

const formatNaira = (n: number) => `₦${n.toLocaleString("en-NG")}`;

/* ─────────────────────────────────────────────────────────────
   MAIN PAGE
   ───────────────────────────────────────────────────────────── */
const BillingSettings = () => {
    const theme = useTheme();
    const { selectedAccount } = useAuth();
    const { enums, isLoading: isEnumsLoading } = useEnums({
        fetchPermissionData: false,
    });

    const [tabValue, setTabValue] = useState(0);
    const [submitModalOpen, setSubmitModalOpen] = useState(false);

    const [billingState, setBillingState] = useState<CurrentBillingState | null>(
        null
    );
    const [isLoadingBilling, setIsLoadingBilling] = useState(true);
    const [billingError, setBillingError] = useState<string>("");

    const [referenceCode, setReferenceCode] = useState<string>("");
    const [isLoadingReference, setIsLoadingReference] = useState(false);

    const [submissions, setSubmissions] = useState<any[]>([]);
    const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);

    const [submitting, setSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string>("");

    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error";
    }>({ open: false, message: "", severity: "success" });

    /* ─────────────────────────────────────────────────────────
       PLAN NAME MAP — from local storage enums
       { "1": "Starter", "2": "Standard", ... }
       ───────────────────────────────────────────────────────── */
    const planNameByValue = useMemo(() => {
        return (
            enums?.SubscriptionPlan?.reduce(
                (
                    acc: Record<string, string>,
                    item: { value: number; displayName?: string; name: string }
                ) => {
                    acc[String(item.value)] = item.displayName || item.name;
                    return acc;
                },
                {}
            ) || {}
        );
    }, [enums]);

    /* ── Load everything ── */
    useEffect(() => {
        if (!selectedAccount) return;

        (async () => {
            try {
                setIsLoadingBilling(true);
                setBillingError("");
                const state = await getCurrentBillingState(selectedAccount);
                setBillingState(state);
            } catch (err: any) {
                console.error("Failed to load billing state:", err);
                setBillingError(
                    err?.response?.data?.message ||
                    err?.message ||
                    "Failed to load billing information."
                );
            } finally {
                setIsLoadingBilling(false);
            }
        })();

        (async () => {
            try {
                setIsLoadingReference(true);
                const data = await getOrCreatePaymentReference(selectedAccount);
                setReferenceCode(data.referenceCode);
            } catch (err) {
                console.error("Failed to load reference:", err);
            } finally {
                setIsLoadingReference(false);
            }
        })();

        (async () => {
            try {
                setIsLoadingSubmissions(true);
                const response: any = await getMyPaymentSubmissions(
                    selectedAccount
                );
                const items = Array.isArray(response)
                    ? response
                    : response?.items ?? [];
                setSubmissions(items);
            } catch (err) {
                console.error("Failed to load submissions:", err);
                setSubmissions([]);
            } finally {
                setIsLoadingSubmissions(false);
            }
        })();
    }, [selectedAccount]);

    /* ─────────────────────────────────────────────────────────
       PLAN OPTIONS — driven by the ENUM, enriched with BE data
       Enterprise shows up even though BE doesn't send a price for it.
       Sorted by enum value for deterministic order.
       ───────────────────────────────────────────────────────── */
    const planOptions = useMemo(() => {
        // 1. Source of truth: the enum list from local storage.
        const enumList = enums?.SubscriptionPlan ?? [];

        // 2. Index BE-provided plan data by enum value.
        const beByValue = new Map<number, any>();
        billingState?.planOptions?.forEach((p) => {
            beByValue.set(p.plan, p);
        });

        // 3. Merge enum entries with BE data.
        const merged = enumList.map((item: any) => {
            const value = Number(item.value);
            const beData = beByValue.get(value);

            return {
                value,
                label:
                    item.displayName ||
                    item.name ||
                    `Plan ${value}`,
                price: beData?.pricePerTerm ?? 0,
                studentMin: beData?.studentMin ?? 0,
                studentMax: beData?.studentMax ?? 0,
                features: beData?.features ?? [],
                isCurrent: value === billingState?.currentPlan,
                isRecommended: value === billingState?.recommendedPlan,
            };
        });

        // 4. Sort by enum value.
        return merged.sort((a, b) => a.value - b.value);
    }, [enums, billingState]);

    /* ── Helper to resolve a plan name from a value ── */
    const getPlanName = (value: number, fallback?: string) =>
        planNameByValue[String(value)] ?? fallback ?? `Plan ${value}`;

    /* ── Subscription view model ── */
    const currentSubscription = useMemo(() => {
        if (!billingState) return null;

        const statusLabel =
            billingState.status === 2
                ? "Active"
                : billingState.status === 1
                    ? "Trial"
                    : "Expired";

        return {
            planName: getPlanName(
                billingState.currentPlan,
                billingState.currentPlanName
            ),
            planValue: billingState.currentPlan,
            planPrice: formatNaira(billingState.currentPlanPricePerTerm),
            billingCycle:
                billingState.billingCycle === 1 ? "Per Term" : "Per Year",
            status: statusLabel,
            trialEndsOn: billingState.trialEndsOn,
            paidUntil: billingState.paidUntil,
            daysLeft:
                statusLabel === "Trial"
                    ? daysUntil(billingState.trialEndsOn)
                    : daysUntil(billingState.paidUntil),
        };
    }, [billingState, planNameByValue]); // eslint-disable-line react-hooks/exhaustive-deps

    /* ── Handlers ── */
    const handleTabChange = (_: React.SyntheticEvent, v: number) => {
        setTabValue(v);
    };

    const copyReference = async () => {
        try {
            await navigator.clipboard.writeText(referenceCode);
            setSnackbar({
                open: true,
                message: "Reference copied to clipboard",
                severity: "success",
            });
        } catch {
            setSnackbar({
                open: true,
                message: "Could not copy — please copy manually",
                severity: "error",
            });
        }
    };

    const handleSubmitProof = async (formData: {
        referenceCode: string;
        plan: number;
        amount: number;
        bankReference: string;
        note: string;
    }) => {
        if (!selectedAccount) return;

        setSubmitting(true);
        setSubmitError("");

        try {
            await submitPaymentProof(selectedAccount, {
                referenceCode: formData.referenceCode,
                plan: formData.plan,
                amount: formData.amount,
                bankReference: formData.bankReference || undefined,
                note: formData.note || undefined,
            });

            setSubmitModalOpen(false);
            setSnackbar({
                open: true,
                message:
                    "Proof submitted. We'll verify and activate your plan within 24 hours.",
                severity: "success",
            });

            const [refreshedSubs, refreshedState] = await Promise.all([
                getMyPaymentSubmissions(selectedAccount),
                getCurrentBillingState(selectedAccount),
            ]);

            const items = Array.isArray(refreshedSubs)
                ? refreshedSubs
                : refreshedSubs?.items ?? [];
            setSubmissions(items);
            setBillingState(refreshedState);
            setTabValue(1);
        } catch (err: any) {
            setSubmitError(
                err?.response?.data?.message ||
                err?.message ||
                "Failed to submit. Please try again."
            );
        } finally {
            setSubmitting(false);
        }
    };

    const isLoadingAnything = isLoadingBilling || isEnumsLoading;

    /* ═══════════════════════════════════════════════════════════
       RENDER
       ═══════════════════════════════════════════════════════════ */
    return (
        <Box
            sx={{
                p: { xs: 2, sm: 3, md: 4 },
                bgcolor: theme.palette.background.default,
                minHeight: "100vh",
            }}
        >
            {/* ── Header ── */}
            <Box sx={{ mb: 4 }}>
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        mb: 1,
                    }}
                >
                    <Box
                        sx={{
                            width: 44,
                            height: 44,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        <IconifyIcon
                            icon="mdi:credit-card-outline"
                            width={24}
                            color={theme.palette.primary.main}
                        />
                    </Box>
                    <Typography
                        variant="h5"
                        sx={{
                            fontWeight: 700,
                            color: theme.palette.text.primary,
                            fontSize: { xs: "1.25rem", sm: "1.5rem" },
                        }}
                    >
                        Billing & Subscription
                    </Typography>
                </Box>
                <Typography
                    variant="body2"
                    sx={{
                        color: theme.palette.text.secondary,
                        ml: { xs: 0, sm: 7 },
                        fontSize: { xs: "0.875rem", sm: "1rem" },
                    }}
                >
                    Manage your subscription and submit payment proof
                </Typography>
            </Box>

            {/* ── Tabs ── */}
            <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
                <Tabs
                    value={tabValue}
                    onChange={handleTabChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        "& .MuiTab-root": {
                            textTransform: "none",
                            fontWeight: 600,
                            fontSize: "0.875rem",
                            minWidth: "auto",
                            px: { xs: 2, sm: 3 },
                            color: theme.palette.text.secondary,
                        },
                        "& .Mui-selected": {
                            color: theme.palette.primary.main,
                        },
                        "& .MuiTabs-indicator": {
                            backgroundColor: theme.palette.primary.main,
                        },
                    }}
                >
                    <Tab
                        label="Overview"
                        icon={<IconifyIcon icon="mdi:home-outline" width={20} />}
                        iconPosition="start"
                    />
                    <Tab
                        label="Billing History"
                        icon={<IconifyIcon icon="mdi:history" width={20} />}
                        iconPosition="start"
                    />
                </Tabs>
            </Box>

            {/* ═══════════════════════════════════════════════
                TAB 1 — OVERVIEW
                ═══════════════════════════════════════════════ */}
            <TabPanel value={tabValue} index={0}>
                {isLoadingAnything ? (
                    <Stack spacing={3}>
                        <Skeleton variant="rounded" height={200} />
                        <Skeleton variant="rounded" height={120} />
                    </Stack>
                ) : billingError ? (
                    <Alert severity="error" sx={{ borderRadius: 2 }}>
                        {billingError}
                    </Alert>
                ) : !billingState || !currentSubscription ? (
                    <Alert severity="warning" sx={{ borderRadius: 2 }}>
                        Could not load billing information.
                    </Alert>
                ) : (
                    <Stack spacing={3}>
                        {/* Growth / upgrade banner */}
                        {billingState.shouldUpgrade && (
                            <Alert
                                severity={
                                    billingState.isOverCurrentPlanCap
                                        ? "warning"
                                        : "info"
                                }
                                icon={
                                    <IconifyIcon
                                        icon={
                                            billingState.isOverCurrentPlanCap
                                                ? "mdi:alert-circle-outline"
                                                : "mdi:trending-up"
                                        }
                                        width={22}
                                    />
                                }
                                sx={{ borderRadius: 2 }}
                                action={
                                    <Button
                                        color="inherit"
                                        size="small"
                                        onClick={() => setSubmitModalOpen(true)}
                                        sx={{
                                            textTransform: "none",
                                            fontWeight: 600,
                                            whiteSpace: "nowrap",
                                        }}
                                    >
                                        Upgrade now
                                    </Button>
                                }
                            >
                                {billingState.isOverCurrentPlanCap ? (
                                    <>
                                        You have{" "}
                                        <strong>
                                            {billingState.currentStudentCount}{" "}
                                            students
                                        </strong>{" "}
                                        but your{" "}
                                        <strong>
                                            {getPlanName(
                                                billingState.currentPlan,
                                                billingState.currentPlanName
                                            )}
                                        </strong>{" "}
                                        plan covers up to{" "}
                                        <strong>
                                            {billingState.currentPlanStudentCap}
                                        </strong>
                                        . Upgrade to{" "}
                                        <strong>
                                            {getPlanName(
                                                billingState.recommendedPlan,
                                                billingState.recommendedPlanName
                                            )}
                                        </strong>{" "}
                                        (
                                        {formatNaira(
                                            billingState.recommendedPricePerTerm
                                        )}
                                        /term) at your next renewal.
                                    </>
                                ) : (
                                    <>
                                        You now have{" "}
                                        <strong>
                                            {billingState.currentStudentCount}{" "}
                                            students
                                        </strong>
                                        . At your next renewal you&apos;ll
                                        need{" "}
                                        <strong>
                                            {getPlanName(
                                                billingState.recommendedPlan,
                                                billingState.recommendedPlanName
                                            )}
                                        </strong>{" "}
                                        (
                                        {formatNaira(
                                            billingState.recommendedPricePerTerm
                                        )}
                                        /term).
                                    </>
                                )}
                            </Alert>
                        )}

                        {/* Current Plan + Bank details */}
                        <Box
                            sx={{
                                display: "grid",
                                gridTemplateColumns: {
                                    xs: "1fr",
                                    md: "2fr 1fr",
                                },
                                gap: 3,
                            }}
                        >
                            {/* Current Plan Card */}
                            <Card
                                elevation={0}
                                sx={{
                                    borderRadius: 3,
                                    bgcolor: theme.palette.background.default,
                                                border: `1px solid ${alpha(
                                                    theme.palette.divider,
                                                    0.08
                                                )}`,
                                                overflow: "hidden",
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    p: 3,
                                                    background: `linear-gradient(135deg, ${alpha(
                                                        theme.palette.primary.main,
                                                        0.05
                                                    )} 0%, ${alpha(
                                                        theme.palette.secondary.main,
                                                        0.05
                                                    )} 100%)`,
                                                    borderBottom: `1px solid ${alpha(
                                                        theme.palette.divider,
                                                        0.08
                                                    )}`,
                                                }}
                                            >
                                                <Stack
                                                    direction={{ xs: "column", sm: "row" }}
                                                    justifyContent="space-between"
                                                    alignItems={{
                                                        xs: "flex-start",
                                                        sm: "center",
                                                    }}
                                                    spacing={2}
                                                >
                                                    <Box>
                                                        <Typography
                                                            variant="caption"
                                                            sx={{
                                                                color: theme.palette.text
                                                                    .secondary,
                                                                textTransform: "uppercase",
                                                                letterSpacing: "0.5px",
                                                                fontWeight: 600,
                                                            }}
                                                        >
                                                            Current Plan
                                                        </Typography>
                                                        <Typography
                                                            variant="h4"
                                                            fontWeight={700}
                                                            sx={{
                                                                mt: 0.5,
                                                                color: theme.palette.text
                                                                    .primary,
                                                            }}
                                                        >
                                                            {currentSubscription.planName}
                                                        </Typography>
                                                        <Stack
                                                            direction="row"
                                                            alignItems="center"
                                                            spacing={1}
                                                            sx={{ mt: 0.5 }}
                                                        >
                                                            <Typography
                                                                variant="h5"
                                                                fontWeight={700}
                                                                sx={{
                                                                    color: theme.palette
                                                                        .primary.main,
                                                                }}
                                                            >
                                                                {
                                                                    currentSubscription.planPrice
                                                                }
                                                            </Typography>
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    color: theme.palette.text
                                                                        .secondary,
                                                                }}
                                                            >
                                                                /{" "}
                                                                {
                                                                    currentSubscription.billingCycle
                                                                }
                                                            </Typography>
                                                        </Stack>
                                                    </Box>

                                                    <Chip
                                                        label={
                                                            currentSubscription.status ===
                                                                "Trial"
                                                                ? `Trial · ${currentSubscription.daysLeft}d left`
                                                                : currentSubscription.status
                                                        }
                                                        color={
                                                            currentSubscription.status ===
                                                                "Active"
                                                                ? "success"
                                                                : currentSubscription.status ===
                                                                    "Trial"
                                                                    ? "warning"
                                                                    : "error"
                                                        }
                                                        icon={
                                                            <IconifyIcon
                                                                icon={
                                                                    currentSubscription.status ===
                                                                        "Active"
                                                                        ? "mdi:check-circle"
                                                                        : currentSubscription.status ===
                                                                            "Trial"
                                                                            ? "mdi:clock-outline"
                                                                            : "mdi:alert-circle-outline"
                                                                }
                                                                width={16}
                                                            />
                                                        }
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                </Stack>
                                            </Box>

                                            <CardContent
                                                sx={{
                                                    p: 3,
                                                    bgcolor: theme.palette.background.default,
                                                }}
                                            >
                                                <Typography
                                                    variant="subtitle2"
                                                    fontWeight={600}
                                                    sx={{
                                                        mb: 2,
                                                        color: theme.palette.text.primary,
                                                    }}
                                                >
                                                    Plan features
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        display: "grid",
                                                        gridTemplateColumns: {
                                                            xs: "1fr",
                                                            sm: "1fr 1fr",
                                                        },
                                                        gap: 1.5,
                                                    }}
                                                >
                                                    {(billingState.planOptions.find(
                                                        (p) =>
                                                            p.plan ===
                                                            billingState.currentPlan
                                                    )?.features ?? []
                                                    ).map((feature, i) => (
                                                        <Box
                                                            key={i}
                                                            sx={{
                                                                display: "flex",
                                                                alignItems: "center",
                                                                gap: 1,
                                                            }}
                                                        >
                                                            <IconifyIcon
                                                                icon="mdi:check-circle-outline"
                                                                width={18}
                                                                color={
                                                                    theme.palette.success
                                                                        .main
                                                                }
                                                            />
                                                            <Typography
                                                                variant="body2"
                                                                sx={{
                                                                    color: theme.palette.text
                                                                        .secondary,
                                                                }}
                                                            >
                                                                {feature}
                                                            </Typography>
                                                        </Box>
                                                    ))}
                                                </Box>

                                                <Divider sx={{ my: 3 }} />

                                                <Stack
                                                    direction={{ xs: "column", sm: "row" }}
                                                    justifyContent="space-between"
                                                    alignItems={{
                                                        xs: "stretch",
                                                        sm: "center",
                                                    }}
                                                    spacing={2}
                                                >
                                                    <Box>
                                                        <Typography
                                                            variant="caption"
                                                            display="block"
                                                            sx={{
                                                                color: theme.palette.text
                                                                    .secondary,
                                                            }}
                                                        >
                                                            {currentSubscription.status ===
                                                                "Trial"
                                                                ? "Trial ends on"
                                                                : "Paid until"}
                                                        </Typography>
                                                        <Typography
                                                            variant="body2"
                                                            fontWeight={600}
                                                            sx={{
                                                                color: theme.palette.text
                                                                    .primary,
                                                            }}
                                                        >
                                                            {currentSubscription.status ===
                                                                "Trial"
                                                                ? formatDate(
                                                                    currentSubscription.trialEndsOn
                                                                )
                                                                : formatDate(
                                                                    currentSubscription.paidUntil
                                                                )}
                                                        </Typography>
                                                    </Box>

                                        <Button
                                            variant="contained"
                                                        size="large"
                                                        startIcon={
                                                            <IconifyIcon
                                                                icon="mdi:cash-check"
                                                                width={18}
                                                            />
                                                        }
                                                        onClick={() =>
                                                            setSubmitModalOpen(true)
                                                        }
                                            sx={{
                                                borderRadius: 2,
                                                textTransform: "none",
                                                fontWeight: 600,
                                                background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                                            }}
                                        >
                                                        Submit Payment Proof
                                        </Button>
                                                </Stack>
                                            </CardContent>
                                        </Card>

                                        {/* Bank details */}
                            <Card
                                elevation={0}
                                            sx={{
                                    borderRadius: 3,
                                    bgcolor: theme.palette.background.default,
                                                border: `1px solid ${alpha(
                                                    theme.palette.divider,
                                                    0.08
                                                )}`,
                                                p: 3,
                                                height: "fit-content",
                                }}
                            >
                                            <Stack
                                                direction="row"
                                                spacing={1.5}
                                                alignItems="center"
                                                mb={2}
                                            >
                                    <Box
                                        sx={{
                                                        width: 36,
                                                        height: 36,
                                                        borderRadius: 1.5,
                                                        bgcolor: alpha(
                                                            theme.palette.info.main,
                                                            0.1
                                                        ),
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                        }}
                                    >
                                                    <IconifyIcon
                                                        icon="mdi:bank-outline"
                                                        width={20}
                                                        color={theme.palette.info.main}
                                                    />
                                    </Box>
                                    <Box>
                                                    <Typography
                                                        variant="subtitle2"
                                                        fontWeight={700}
                                                        sx={{
                                                            color: theme.palette.text
                                                                .primary,
                                                        }}
                                                    >
                                                        Bank Transfer
                                        </Typography>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: theme.palette.text
                                                                .secondary,
                                                        }}
                                                    >
                                                        Use the reference below
                                        </Typography>
                                    </Box>
                                </Stack>

                                            <Stack spacing={1.5}>
                                                <DetailRow
                                                    label="Bank"
                                                    value="Zenith Bank"
                                                />
                                                <DetailRow
                                                    label="Account Name"
                                                    value="SchoolPilot Ltd."
                                                />
                                                <DetailRow
                                                    label="Account No."
                                                    value="1234567890"
                                                />

                                                <Divider />

                                                <Box>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            color: theme.palette.text
                                                                .secondary,
                                                        }}
                                                    >
                                                        Your Reference Code
                                                    </Typography>
                                                    <Stack
                                                        direction="row"
                                                        alignItems="center"
                                                        spacing={1}
                                                        sx={{
                                                            mt: 0.5,
                                                            p: 1.25,
                                                            borderRadius: 1.5,
                                                            bgcolor: alpha(
                                                                theme.palette.primary.main,
                                                                0.06
                                                            ),
                                                            border: `1px dashed ${alpha(
                                                                theme.palette.primary.main,
                                                                0.3
                                                            )}`,
                                                        }}
                                                    >
                                                        <Typography
                                                            sx={{
                                                                fontFamily: "monospace",
                                                                fontWeight: 700,
                                                                fontSize: "0.9rem",
                                                                color: theme.palette.primary
                                                                    .main,
                                                                flex: 1,
                                                                wordBreak: "break-all",
                                                            }}
                                                        >
                                                            {referenceCode || "—"}
                                                        </Typography>
                                                        <Tooltip title="Copy">
                                                            <IconButton
                                                                size="small"
                                                                onClick={copyReference}
                                                                disabled={!referenceCode}
                                                            >
                                                                <IconifyIcon
                                                                    icon="mdi:content-copy"
                                                                    width={16}
                                                                />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Stack>
                                                    <Typography
                                                        variant="caption"
                                                        sx={{
                                                            mt: 0.5,
                                                            display: "block",
                                                            color: theme.palette.text
                                                                .secondary,
                                                        }}
                                                    >
                                                        Include this in the transfer
                                                        narration
                                        </Typography>
                                    </Box>
                                </Stack>
                            </Card>
                                    </Box>

                                    {/* Stats row */}
                                    <Box
                                        sx={{
                                            display: "grid",
                                            gridTemplateColumns: {
                                                xs: "1fr",
                                                sm: "1fr 1fr",
                                                md: "1fr 1fr 1fr",
                                            },
                                            gap: 2,
                                        }}
                                    >
                                        <StatCard
                                            icon="mdi:account-group"
                                            iconColor={theme.palette.primary.main}
                                            label="Students enrolled"
                                            value={`${billingState.currentStudentCount} / ${billingState.currentPlanStudentCap}`}
                                            helper={
                                                billingState.isOverCurrentPlanCap
                                                    ? "Over plan cap"
                                                    : `${billingState.currentPlanStudentCap -
                                                    billingState.currentStudentCount
                                                    } slots left`
                                            }
                                        />
                                        <StatCard
                                            icon="mdi:calendar-check"
                                            iconColor={theme.palette.info.main}
                                            label={
                                                currentSubscription.status === "Trial"
                                                    ? "Trial ends"
                                                    : "Next renewal"
                                            }
                                            value={
                                                currentSubscription.status === "Trial"
                                                    ? `${currentSubscription.daysLeft} days left`
                                                    : formatDate(billingState.paidUntil)
                                            }
                                        />
                                        <StatCard
                                            icon="mdi:cash-multiple"
                                            iconColor={theme.palette.success.main}
                                            label="Next term bill"
                                            value={
                                                billingState.nextRenewalAmount > 0
                                                    ? formatNaira(
                                                        billingState.nextRenewalAmount
                                                    )
                                                    : "Custom"
                                            }
                                            helper={getPlanName(
                                                billingState.nextRenewalPlan,
                                                billingState.nextRenewalPlanName
                                            )}
                                        />
                                    </Box>

                                    {/* Capacity bar */}
                                    <Card
                                        elevation={0}
                                        sx={{
                                            borderRadius: 3,
                                            bgcolor: theme.palette.background.default,
                                            border: `1px solid ${alpha(
                                                theme.palette.divider,
                                                0.08
                                            )}`,
                                            p: 3,
                                        }}
                                    >
                                        <Stack
                                            direction="row"
                                            justifyContent="space-between"
                                            alignItems="center"
                                            mb={1}
                                        >
                                            <Typography
                                                variant="subtitle2"
                                                fontWeight={600}
                                                sx={{ color: theme.palette.text.primary }}
                                            >
                                                Student capacity
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    color: theme.palette.text.secondary,
                                                }}
                                            >
                                                {billingState.currentStudentCount} of{" "}
                                                {billingState.currentPlanStudentCap}
                                            </Typography>
                                        </Stack>
                                        <LinearProgress
                                            variant="determinate"
                                            value={Math.min(
                                                100,
                                                (billingState.currentStudentCount /
                                                    billingState.currentPlanStudentCap) *
                                                100
                                            )}
                                            color={
                                                billingState.isOverCurrentPlanCap
                                                    ? "error"
                                                    : "primary"
                                            }
                                            sx={{
                                                height: 10,
                                                borderRadius: 5,
                                                bgcolor: alpha(
                                                    theme.palette.primary.main,
                                                    0.08
                                                ),
                                            }}
                                        />
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                mt: 1,
                                                display: "block",
                                                color: theme.palette.text.secondary,
                                            }}
                                        >
                                            Plans are billed per term based on enrolled
                                            students.
                                        </Typography>
                                    </Card>
                                </Stack>
                )}
            </TabPanel>

            {/* ═══════════════════════════════════════════════
                TAB 2 — BILLING HISTORY
                ═══════════════════════════════════════════════ */}
            <TabPanel value={tabValue} index={1}>
                <Card
                    elevation={0}
                    sx={{
                        borderRadius: 3,
                        bgcolor: theme.palette.background.default,
                        border: `1px solid ${alpha(
                            theme.palette.divider,
                            0.08
                        )}`,
                        overflow: "hidden",
                    }}
                >
                    <Box
                        sx={{
                            p: { xs: 2, sm: 3 },
                            bgcolor: theme.palette.background.default,
                            borderBottom: `1px solid ${alpha(
                                theme.palette.divider,
                                0.08
                            )}`,
                        }}
                    >
                        <Stack
                            direction={{ xs: "column", sm: "row" }}
                            justifyContent="space-between"
                            alignItems={{ xs: "flex-start", sm: "center" }}
                            spacing={2}
                        >
                            <Box>
                                <Typography
                                    variant="h6"
                                    fontWeight={600}
                                    sx={{
                                        color: theme.palette.text.primary,
                                    }}
                                >
                                    Payment Submissions
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{
                                        color: theme.palette.text.secondary,
                                    }}
                                >
                                    All your payment submissions and their
                                    statuses
                                </Typography>
                            </Box>
                            <Button
                                variant="contained"
                                startIcon={
                                    <IconifyIcon
                                        icon="mdi:plus-circle-outline"
                                        width={18}
                                    />
                                }
                                onClick={() => setSubmitModalOpen(true)}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: "none",
                                    fontWeight: 600,
                                }}
                            >
                                New Submission
                            </Button>
                        </Stack>
                    </Box>

                    {isLoadingSubmissions ? (
                        <Box sx={{ p: 3 }}>
                            <Stack spacing={2}>
                                {Array.from({ length: 3 }).map((_, i) => (
                                    <Skeleton
                                        key={i}
                                        variant="rounded"
                                        height={48}
                                    />
                                ))}
                            </Stack>
                        </Box>
                    ) : submissions.length === 0 ? (
                        <Box
                            sx={{
                                p: 6,
                                textAlign: "center",
                                bgcolor: theme.palette.background.default,
                            }}
                        >
                            <IconifyIcon
                                icon="mdi:file-document-outline"
                                width={48}
                                color={theme.palette.text.disabled}
                            />
                            <Typography
                                variant="body1"
                                fontWeight={600}
                                sx={{
                                    mt: 2,
                                    color: theme.palette.text.primary,
                                }}
                            >
                                No submissions yet
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    mt: 0.5,
                                    mb: 2,
                                    color: theme.palette.text.secondary,
                                }}
                            >
                                Once you submit payment proof, it will appear
                                here.
                            </Typography>
                            <Button
                                variant="outlined"
                                onClick={() => setSubmitModalOpen(true)}
                                sx={{
                                    borderRadius: 2,
                                    textTransform: "none",
                                }}
                            >
                                Submit payment proof
                            </Button>
                        </Box>
                    ) : (
                        <TableContainer
                            sx={{ bgcolor: theme.palette.background.default }}
                        >
                            <Table>
                                <TableHead>
                                    <TableRow>
                                                {[
                                                    "Reference",
                                                    "Plan",
                                                    "Amount",
                                                    "Submitted",
                                                    "Status",
                                                    "Actions",
                                                ].map((h, idx) => (
                                                    <TableCell
                                                        key={h}
                                                        align={
                                                            idx === 5 ? "right" : "left"
                                                        }
                                                        sx={{
                                                            fontWeight: 600,
                                                            color: theme.palette.text
                                                                .secondary,
                                                        }}
                                                    >
                                                        {h}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {submissions.map((row) => (
                                                <TableRow key={row.id}>
                                                    <TableCell>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                fontFamily: "monospace",
                                                                fontWeight: 600,
                                                                color: theme.palette.text
                                                                    .primary,
                                                            }}
                                                        >
                                                            {row.referenceCode}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: theme.palette.text
                                                                    .secondary,
                                                            }}
                                                        >
                                                            {getPlanName(
                                                                row.planValue ?? 0,
                                                                row.plan
                                                            )}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            variant="body2"
                                                            fontWeight={600}
                                                            sx={{
                                                                color: theme.palette.text
                                                                    .primary,
                                                            }}
                                                        >
                                                            ₦
                                                            {Number(
                                                                row.amount ?? 0
                                                            ).toLocaleString()}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Typography
                                                            variant="body2"
                                                            sx={{
                                                                color: theme.palette.text
                                                                    .secondary,
                                                            }}
                                                        >
                                                            {row.submittedOn
                                                                ? new Date(
                                                                    row.submittedOn
                                                                ).toLocaleDateString(
                                                                    "en-GB",
                                                                    {
                                                                        day: "2-digit",
                                                                        month: "short",
                                                                        year: "numeric",
                                                                    }
                                                                )
                                                                : "—"}
                                                        </Typography>
                                                    </TableCell>
                                                    <TableCell>
                                                        <SubmissionStatusChip
                                                            status={
                                                                row.status ?? "Pending"
                                                            }
                                                        />
                                                    </TableCell>
                                                    <TableCell align="right">
                                                        <Tooltip
                                                            title={
                                                                row.reviewerNote ??
                                                                "No reviewer note"
                                                            }
                                                        >
                                                            <span>
                                                                <IconButton
                                                                    size="small"
                                                                    disabled={
                                                                        !row.reviewerNote
                                                                    }
                                                                >
                                                                    <IconifyIcon
                                                                        icon="mdi:information-outline"
                                                                        width={18}
                                                                    />
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                    )}
                </Card>
            </TabPanel>

            {/* Submit modal */}
            <SubmitProofModal
                open={submitModalOpen}
                onClose={() => {
                    setSubmitModalOpen(false);
                    setSubmitError("");
                }}
                referenceCode={referenceCode}
                planOptions={planOptions}
                defaultPlan={
                    billingState?.recommendedPlan ??
                    billingState?.currentPlan ??
                    0
                }
                currentStudentCount={billingState?.currentStudentCount ?? 0}
                submitting={submitting}
                submitError={submitError}
                onSubmit={handleSubmitProof}
            />

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={5000}
                onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
                    sx={{ borderRadius: 2 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

/* ─────────────────────────────────────────────────────────────
   SUBMIT PROOF MODAL
   ───────────────────────────────────────────────────────────── */
const SubmitProofModal = ({
    open,
    onClose,
    referenceCode,
    planOptions,
    defaultPlan,
    currentStudentCount,
    submitting,
    submitError,
    onSubmit,
}: {
    open: boolean;
    onClose: () => void;
    referenceCode: string;
    planOptions: {
        value: number;
        label: string;
        price: number;
        studentMin: number;
        studentMax: number;
        features: string[];
        isCurrent: boolean;
        isRecommended: boolean;
    }[];
    defaultPlan: number;
    currentStudentCount: number;
    submitting: boolean;
    submitError: string;
    onSubmit: (data: {
        referenceCode: string;
        plan: number;
        amount: number;
        bankReference: string;
        note: string;
    }) => Promise<void>;
}) => {
    const theme = useTheme();

    const resolvedDefault =
        planOptions.find((o) => o.value === defaultPlan)?.value ??
        planOptions[0]?.value ??
        0;

    const [plan, setPlan] = useState<number>(resolvedDefault);
    const [amount, setAmount] = useState<string>("");
    const [bankReference, setBankReference] = useState("");
    const [note, setNote] = useState("");

    useEffect(() => {
        if (!open) return;

        setPlan(resolvedDefault);

        const selected = planOptions.find((o) => o.value === resolvedDefault);
        // Only prefill if the plan has a fixed price (> 0).
        // For Enterprise (custom pricing), leave blank.
        setAmount(selected && selected.price > 0 ? String(selected.price) : "");
        setBankReference("");
        setNote("");
    }, [open, resolvedDefault, planOptions]);

    const handlePlanChange = (newPlan: number) => {
        setPlan(newPlan);
        const selected = planOptions.find((o) => o.value === newPlan);
        // Same rule: only auto-fill when the price is known.
        setAmount(selected && selected.price > 0 ? String(selected.price) : "");
    };

    const handleSubmit = async () => {
        if (!amount) return;
        await onSubmit({
            referenceCode,
            plan,
            amount: Number(amount),
            bankReference,
            note,
        });
    };

    return (
        <Dialog
            open={open}
            onClose={submitting ? undefined : onClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{
                sx: {
                    borderRadius: 3,
                    bgcolor: theme.palette.background.default,
                },
            }}
        >
            <DialogTitle
                sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    pb: 1,
                    bgcolor: theme.palette.background.default,
                    color: theme.palette.text.primary,
                }}
            >
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
                        icon="mdi:cash-check"
                        width={22}
                        color={theme.palette.primary.main}
                    />
                </Box>
                <Box>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        sx={{ color: theme.palette.text.primary }}
                    >
                        Submit Payment Proof
                    </Typography>
                    <Typography
                        variant="caption"
                        sx={{ color: theme.palette.text.secondary }}
                    >
                        We&apos;ll verify within 24 hours
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ bgcolor: theme.palette.background.default }}>
                {submitError && (
                    <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                        {submitError}
                    </Alert>
                )}

                <Stack spacing={2.5} sx={{ mt: 1 }}>
                    <TextField
                        label="Reference Code"
                        value={referenceCode}
                        fullWidth
                        size="small"
                        InputProps={{
                            readOnly: true,
                            sx: {
                                fontFamily: "monospace",
                                fontWeight: 600,
                                bgcolor: alpha(
                                    theme.palette.primary.main,
                                    0.04
                                ),
                            },
                        }}
                    />

                    {/* ═══ Plan dropdown — enum-driven ═══ */}
                    <TextField
                        select
                        label="Plan"
                        value={plan}
                        onChange={(e) =>
                            handlePlanChange(Number(e.target.value))
                        }
                        fullWidth
                        size="small"
                        helperText={`You have ${currentStudentCount} students enrolled`}
                        FormHelperTextProps={{
                            sx: { color: theme.palette.text.secondary },
                        }}
                        SelectProps={{
                            renderValue: (selected: unknown) => {
                                const opt = planOptions.find(
                                    (o) => o.value === selected
                                );
                                if (!opt) return "";
                                return (
                                    <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={1}
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: theme.palette.text
                                                    .primary,
                                            }}
                                        >
                                            {opt.label}
                                        </Typography>
                                        {opt.isRecommended && (
                                            <Chip
                                                label="Recommended"
                                                size="small"
                                                color="primary"
                                                sx={{
                                                    height: 18,
                                                    fontSize: "0.65rem",
                                                    fontWeight: 600,
                                                }}
                                            />
                                        )}
                                    </Stack>
                                );
                            },
                        }}
                    >
                        {planOptions.map((opt) => (
                            <MenuItem key={opt.value} value={opt.value}>
                                <Stack
                                    direction="row"
                                    justifyContent="space-between"
                                    alignItems="center"
                                    sx={{ width: "100%", gap: 1 }}
                                >
                                    <Stack
                                        direction="row"
                                        spacing={1}
                                        alignItems="center"
                                    >
                                        <Typography
                                            variant="body2"
                                            sx={{
                                                color: theme.palette.text
                                                    .primary,
                                            }}
                                        >
                                            {opt.label}
                                        </Typography>
                                        {opt.isRecommended && (
                                            <Chip
                                                label="Recommended"
                                                size="small"
                                                color="primary"
                                                sx={{
                                                    height: 18,
                                                    fontSize: "0.65rem",
                                                    fontWeight: 600,
                                                }}
                                            />
                                        )}
                                        {opt.isCurrent &&
                                            !opt.isRecommended && (
                                                <Chip
                                                    label="Current"
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        height: 18,
                                                        fontSize: "0.65rem",
                                                        fontWeight: 600,
                                                        color: theme.palette
                                                            .text.secondary,
                                                        borderColor:
                                                            theme.palette
                                                                .divider,
                                                    }}
                                                />
                                            )}
                                    </Stack>
                                    <Stack alignItems="flex-end" spacing={0}>
                                        <Typography
                                            variant="caption"
                                            fontWeight={600}
                                            sx={{
                                                color: theme.palette.text
                                                    .primary,
                                            }}
                                        >
                                            {opt.price > 0
                                                ? formatNaira(opt.price)
                                                : "Custom"}
                                        </Typography>
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                color: theme.palette.text
                                                    .secondary,
                                                fontSize: "0.65rem",
                                            }}
                                        >
                                            {opt.studentMax >= 1_000_000
                                                ? "Unlimited students"
                                                : opt.studentMax > 0
                                                    ? `Up to ${opt.studentMax} students`
                                                    : "Contact us"}
                                        </Typography>
                                    </Stack>
                                </Stack>
                            </MenuItem>
                        ))}
                    </TextField>

                    <TextField
                        label="Amount Paid"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        fullWidth
                        size="small"
                        type="number"
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    ₦
                                </InputAdornment>
                            ),
                        }}
                        helperText="Amount you actually transferred"
                        FormHelperTextProps={{
                            sx: { color: theme.palette.text.secondary },
                        }}
                    />

                    <TextField
                        label="Bank Reference / Teller No. (optional)"
                        value={bankReference}
                        onChange={(e) => setBankReference(e.target.value)}
                        fullWidth
                        size="small"
                        placeholder="e.g. 0938271 or Zenith transfer ref"
                    />

                    <TextField
                        label="Note (optional)"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        fullWidth
                        size="small"
                        multiline
                        minRows={2}
                        placeholder="Any extra info to help us verify"
                    />

                    <Alert
                        severity="info"
                        sx={{ borderRadius: 2, fontSize: 13 }}
                    >
                        Make sure the amount and reference match your transfer.
                        Mismatched info may delay verification.
                    </Alert>
                </Stack>
            </DialogContent>

            <DialogActions
                sx={{
                    p: 2.5,
                    pt: 0,
                    bgcolor: theme.palette.background.default,
                }}
            >
                <Button
                    onClick={onClose}
                    disabled={submitting}
                    sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        color: theme.palette.text.secondary,
                    }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={submitting || !amount}
                    startIcon={
                        submitting ? (
                            <CircularProgress size={16} color="inherit" />
                        ) : (
                            <IconifyIcon icon="mdi:check" width={18} />
                        )
                    }
                    sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        fontWeight: 600,
                        minWidth: 140,
                    }}
                >
                    {submitting ? "Submitting…" : "Submit Proof"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BillingSettings;