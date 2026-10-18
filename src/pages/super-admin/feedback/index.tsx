import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
    Box,
    Chip,
    Typography,
    CircularProgress,
    IconButton,
    Tooltip,
    alpha,
    useTheme,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import { ReusableTable, type Column } from "../../../components/table";
import { useEnums } from "../../../hooks/useEnums";
import {
    fetchAllFeedback,
    updateFeedback,
    type FeedbackItem,
} from "../../../api/feedbackService";
import { FeedbackDetailModal } from "./FeedbackDetailModal";

const SuperAdminFeedback = () => {
    const theme = useTheme();
    const { enums, isLoading: isEnumsLoading } = useEnums({
        fetchPermissionData: false,
    });

    const [data, setData] = useState<FeedbackItem[]>([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [totalCount, setTotalCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Filters
    const [typeFilter, setTypeFilter] = useState<number | "">("");
    const [statusFilter, setStatusFilter] = useState<number | "">("");

    // Detail modal
    const [detailOpen, setDetailOpen] = useState(false);
    const [selected, setSelected] = useState<FeedbackItem | null>(null);
    const [saving, setSaving] = useState(false);

    const typeMap = useMemo(() => {
        return (
            enums?.FeedbackAndSupport?.reduce(
                (acc: Record<string, string>, item: any) => {
                    acc[item.value] = item.displayName || item.name;
                    return acc;
                },
                {}
            ) || {}
        );
    }, [enums]);

    const statusMap = useMemo(() => {
        return (
            enums?.FeedbackStatus?.reduce(
                (acc: Record<string, string>, item: any) => {
                    acc[item.value] = item.displayName || item.name;
                    return acc;
                },
                {}
            ) || {}
        );
    }, [enums]);

    const statusOptions = useMemo(() => {
        return (enums?.FeedbackStatus ?? []).map((s: any) => ({
            value: s.value,
            label: s.displayName || s.name,
        }));
    }, [enums]);

    const load = useCallback(() => {
        setLoading(true);
        fetchAllFeedback(
            page,
            rowsPerPage,
            typeFilter === "" ? undefined : typeFilter,
            statusFilter === "" ? undefined : statusFilter
        )
            .then(({ items, itemCount }) => {
                setData(items);
                setTotalCount(itemCount);
                setError(null);
            })
            .catch((err) => {
                console.error("Failed to load feedback:", err);
                setError(
                    err instanceof Error
                        ? `Could not load feedback: ${err.message}`
                        : "Could not load feedback. Please try again."
                );
            })
            .finally(() => setLoading(false));
    }, [page, rowsPerPage, typeFilter, statusFilter]);

    useEffect(() => {
        load();
    }, [load]);

    const tableFilters = useMemo(
        () => [
            {
                name: "type",
                label: "Type",
                type: "select" as const,
                defaultValue: "",
                minWidth: 200,
                options: (enums?.FeedbackAndSupport ?? []).map((t: any) => ({
                    value: t.value,
                    label: t.displayName || t.name,
                })),
            },
            {
                name: "status",
                label: "Status",
                type: "select" as const,
                defaultValue: "",
                minWidth: 180,
                options: (enums?.FeedbackStatus ?? []).map((s: any) => ({
                    value: s.value,
                    label: s.displayName || s.name,
                })),
            },
        ],
        [enums]
    );

    const handleFilterChange = (
        values: Record<string, string | number | "">
    ) => {
        setTypeFilter(
            values.type === "" || values.type === undefined
                ? ""
                : Number(values.type)
        );
        setStatusFilter(
            values.status === "" || values.status === undefined
                ? ""
                : Number(values.status)
        );
        setPage(1);
    };

    const statusChip = (status: number) => {
        switch (status) {
            case 1: return { bg: "#e8f5e9", color: "#2e7d32" };
            case 2: return { bg: "#e3f2fd", color: "#1976d2" };
            case 3: return { bg: "#fff3e0", color: "#ed6c02" };
            case 4: return { bg: "#e8f5e9", color: "#2e7d32" };
            case 5: return { bg: "#f5f5f5", color: "#616161" };
            default: return { bg: "#f5f5f5", color: "#616161" };
        }
    };

    const openDetail = (row: FeedbackItem) => {
        setSelected(row);
        setDetailOpen(true);
    };

    const closeDetail = () => {
        if (saving) return;
        setDetailOpen(false);
        setSelected(null);
    };

    const handleSave = async (payload: {
        status: number;
        publicReply: string | null;
        internalNotes: string | null;
    }) => {
        if (!selected) return;
        setSaving(true);
        try {
            await updateFeedback(selected.id, payload);
            // Close and refresh. If you'd rather keep the modal open
            // with updated data, re-fetch and update `selected` instead.
            setDetailOpen(false);
            setSelected(null);
            load();
        } finally {
            setSaving(false);
        }
    };

    const columns: Column[] = [
        {
            id: "title",
            label: "Feedback",
            minWidth: 260,
            format: (value: string, row: FeedbackItem) => (
                <Box>
                    <Typography sx={{ fontWeight: 700, fontSize: "0.95rem" }}>
                        {value}
                    </Typography>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{
                            display: "block",
                            mt: 0.25,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            maxWidth: 380,
                        }}
                    >
                        {row.description}
                    </Typography>
                    <Typography
                        variant="caption"
                        color="text.disabled"
                        sx={{ display: "block", mt: 0.25 }}
                    >
                        {row.submittedByName} · {row.submittedByEmail}
                    </Typography>
                </Box>
            ),
        },
        {
            id: "accountName",
            label: "School",
            minWidth: 160,
            format: (value?: string) => value || "—",
        },
        {
            id: "type",
            label: "Type",
            minWidth: 140,
            format: (value: number) => (
                <Chip
                    label={typeMap[value] ?? "—"}
                    size="small"
                    sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.1),
                        color: theme.palette.primary.main,
                        fontWeight: 600,
                        borderRadius: 1.5,
                        height: 24,
                        fontSize: "0.75rem",
                    }}
                />
            ),
        },
        {
            id: "status",
            label: "Status",
            minWidth: 130,
            format: (value: number) => {
                const s = statusChip(value);
                return (
                    <Chip
                        label={statusMap[value] ?? "—"}
                        size="small"
                        sx={{
                            bgcolor: s.bg,
                            color: s.color,
                            fontWeight: 600,
                            borderRadius: 1.5,
                            height: 24,
                            fontSize: "0.75rem",
                        }}
                    />
                );
            },
        },
        {
            id: "severity",
            label: "Severity",
            minWidth: 110,
            format: (value?: string | null) => value || "—",
        },
        {
            id: "createdOn",
            label: "Submitted",
            minWidth: 140,
            format: (value?: string | null) =>
                value ? new Date(value).toLocaleDateString() : "—",
        },
    ];

    // ── Action column ──
    const actionColumn = {
        label: "Actions",
        minWidth: 100,
        align: "center" as const,
        render: (row: FeedbackItem) => (
            <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                <Tooltip title="View details" arrow>
                    <IconButton
                        size="small"
                        onClick={() => openDetail(row)}
                        sx={{
                            color: theme.palette.info.main,
                            "&:hover": {
                                bgcolor: alpha(theme.palette.info.main, 0.1),
                            },
                        }}
                    >
                        <VisibilityIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
        ),
    };

    if (isEnumsLoading && loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="400px"
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 2, sm: 3, md: 4 }, minHeight: "85vh" }}>
            {error && (
                <Box
                    sx={{
                        mb: 2,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                        color: theme.palette.error.main,
                    }}
                >
                    {error}
                </Box>
            )}

            <ReusableTable
                title="Platform Feedback"
                columns={columns}
                data={data}
                page={page - 1}
                onPageChange={(_, newPage) => setPage(newPage + 1)}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={(e) => {
                    setRowsPerPage(parseInt(e.target.value, 10));
                    setPage(1);
                }}
                totalCount={totalCount}
                loading={loading || isEnumsLoading}
                showCheckboxes={false}
                showActionColumn={true}
                actionColumn={actionColumn}
                showFilters={true}
                filters={tableFilters}
                onFilterChange={handleFilterChange}
            />

            <FeedbackDetailModal
                open={detailOpen}
                feedback={selected}
                statusOptions={statusOptions}
                typeLabelFor={(type) => typeMap[type] ?? "—"}
                isSaving={saving}
                onClose={closeDetail}
                onSave={handleSave}
            />
        </Box>
    );
};

export default SuperAdminFeedback;