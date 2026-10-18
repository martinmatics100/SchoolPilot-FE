import React, { useEffect, useState, useMemo } from "react";
import {
    Box,
    Chip,
    Typography,
    CircularProgress,
    alpha,
    useTheme,
} from "@mui/material";
import { ReusableTable, type Column } from "../../components/table";
import { useEnums } from "../../hooks/useEnums";
import { fetchMyFeedback, type FeedbackItem } from "../../api/feedbackService";

const MyFeedback = () => {
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

    // Enum maps
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

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        fetchMyFeedback(page, rowsPerPage)
            .then(({ items, itemCount }) => {
                if (cancelled) return;
                setData(items);
                setTotalCount(itemCount);
                setError(null);
            })
            .catch((err) => {
                if (cancelled) return;
                console.error("Failed to load my feedback:", err);
                setError("Could not load your feedback. Please try again.");
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [page, rowsPerPage]);

    const statusConfig = (status: number) => {
        // Adjust colors per status value.
        switch (status) {
            case 1: return { bg: "#e8f5e9", color: "#2e7d32" };   // New
            case 2: return { bg: "#e3f2fd", color: "#1976d2" };   // Acknowledged
            case 3: return { bg: "#fff3e0", color: "#ed6c02" };   // In Progress
            case 4: return { bg: "#e8f5e9", color: "#2e7d32" };   // Resolved
            case 5: return { bg: "#f5f5f5", color: "#616161" };   // Won't Fix
            default: return { bg: "#f5f5f5", color: "#616161" };
        }
    };

    const columns: Column[] = [
        {
            id: "title",
            label: "Title",
            minWidth: 220,
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
                            maxWidth: 320,
                        }}
                    >
                        {row.description}
                    </Typography>
                </Box>
            ),
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
                const s = statusConfig(value);
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
            id: "createdOn",
            label: "Submitted",
            minWidth: 140,
            format: (value?: string | null) =>
                value ? new Date(value).toLocaleDateString() : "—",
        },
        {
            id: "publicReply",
            label: "Reply",
            minWidth: 200,
            format: (value?: string | null) => (
                <Typography
                    variant="body2"
                    color={value ? "text.primary" : "text.disabled"}
                    sx={{ fontStyle: value ? "normal" : "italic" }}
                >
                    {value || "No reply yet"}
                </Typography>
            ),
        },
    ];

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
                title="My Feedback"
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
                showActionColumn={false}
            />
        </Box>
    );
};

export default MyFeedback;