import React, { useEffect, useState, useMemo } from "react";
import { ReusableTable, type Column, type TableActionButton } from "../../../../../components/table";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AssignmentIcon from "@mui/icons-material/Assignment";
import AddIcon from "@mui/icons-material/Add";
import { useTheme, alpha, Box, Typography, Chip, Avatar, Tooltip, Paper } from "@mui/material";
import { NavigationButton } from "../../../../../components/navigation-button";
import { getInitialAuthData } from "../../../../../utils/apiClient";
import { useEnums } from "../../../../../hooks/useEnums";
import CircularProgress from "@mui/material/CircularProgress";
import { fetchAttendanceSessions, deleteAttendanceSession } from "../../../../../api/attendanceService";
import { useNavigate } from "react-router-dom";
import MessageDisplay from "../../../../../components/message-display";

// Types for attendance session - matches backend response
interface AttendanceSession {
    id: string;
    classId: string;
    className: string;
    classLevel: number;
    attendanceDate: string;
    schoolTerm: number;
    schoolSessions: number;
    type: number;
    status: number;
    presentCount: number;
    absentCount: number;
    attendanceRate: number;
}

const AttendanceSessionList = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<AttendanceSession[]>([]);
    const [page, setPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [sortBy, setSortBy] = useState<string>("attendanceDate");
    const [order, setOrder] = useState<"asc" | "desc">("desc");
    const [loading, setLoading] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [alertMessage, setAlertMessage] = useState<{
        feMessage?: string;
        beMessage?: string;
        httpStatus?: number;
    }>({});

    const theme = useTheme();
    const { selectedAccount } = getInitialAuthData();
    const { enums, isLoading: isEnumsLoading } = useEnums({
        fetchPermissionData: false,
    });

    // Create maps for enum values
    const termMap = useMemo(() => {
        return (
            enums?.SchoolTerms?.reduce(
                (
                    acc: Record<number, string>,
                    item: { value: number; displayName: string; name: string }
                ) => {
                    acc[item.value] = item.displayName || item.name;
                    return acc;
                },
                {}
            ) || {}
        );
    }, [enums]);

    const sessionMap = useMemo(() => {
        return (
            enums?.SchoolSessions?.reduce(
                (
                    acc: Record<number, string>,
                    item: { value: number; displayName: string; name: string }
                ) => {
                    acc[item.value] = item.displayName || item.name;
                    return acc;
                },
                {}
            ) || {}
        );
    }, [enums]);

    const attendanceTypeMap = useMemo(() => {
        return (
            enums?.AttendanceType?.reduce(
                (
                    acc: Record<number, string>,
                    item: { value: number; displayName: string; name: string }
                ) => {
                    acc[item.value] = item.displayName || item.name;
                    return acc;
                },
                {}
            ) || {}
        );
    }, [enums]);

    const statusMap = useMemo(() => {
        return (
            enums?.AttendanceSessionStatus?.reduce(
                (
                    acc: Record<number, string>,
                    item: { value: number; displayName: string; name: string }
                ) => {
                    acc[item.value] = item.displayName || item.name;
                    return acc;
                },
                {}
            ) || {}
        );
    }, [enums]);

    const classLevelMap = useMemo(() => {
        return (
            enums?.SchoolLevel?.reduce(
                (
                    acc: Record<number, string>,
                    item: { value: number; displayName: string; name: string }
                ) => {
                    acc[item.value] = item.displayName || item.name;
                    return acc;
                },
                {}
            ) || {}
        );
    }, [enums]);

    // Helper function to get enum display name
    const getEnumDisplayName = (map: Record<number, string>, value: number, defaultValue: string = "Unknown") => {
        return map[value] || defaultValue;
    };

    // Fetch attendance sessions
    useEffect(() => {
        if (selectedAccount) {
            setLoading(true);
            fetchAttendanceSessions(selectedAccount, {
                page,
                pageLength: rowsPerPage,
            })
                .then(({ items, itemCount }) => {
                    // Map the response to our display format - keep enum values as numbers
                    const mappedData = items.map((item: any) => ({
                        id: item.id,
                        classId: item.classId,
                        className: item.className || "Not available",
                        classLevel: item.classLevel,
                        attendanceDate: item.attendanceDate,
                        schoolTerm: item.schoolTerm,
                        schoolSessions: item.schoolSessions,
                        type: item.type,
                        status: item.status,
                        presentCount: item.presentCount || 0,
                        absentCount: item.absentCount || 0,
                        attendanceRate: item.attendanceRate || 0,
                    }));
                    setData(mappedData);
                    // setTotalCount(itemCount || 0);
                })
                .catch((error) => {
                    console.error("Error fetching attendance sessions:", error);
                    setAlertMessage({
                        feMessage: "Failed to load attendance sessions.",
                        beMessage: error.message,
                        httpStatus: error.status || 500,
                    });
                    setData([]);
                    // setTotalCount(0);
                })
                .finally(() => setLoading(false));
        } else {
            console.error("No account selected");
            setData([]);
            // setTotalCount(0);
        }
    }, [page, rowsPerPage, sortBy, order, selectedAccount]);

    // Format date for display
    const formatDate = (dateString: string) => {
        if (!dateString) return "Not available";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    // Handle delete
    const handleDelete = async (id: string) => {
        if (!selectedAccount) return;

        if (window.confirm("Are you sure you want to delete this attendance session?")) {
            setIsDeleting(true);
            try {
                await deleteAttendanceSession(selectedAccount, id);
                setAlertMessage({
                    feMessage: "Attendance session deleted successfully!",
                    httpStatus: 200,
                });
                // Refresh the list
                refreshSessions();
            } catch (error: any) {
                setAlertMessage({
                    feMessage: "Failed to delete attendance session.",
                    beMessage: error.message,
                    httpStatus: error.status || 500,
                });
            } finally {
                setIsDeleting(false);
            }
        }
    };

    // Handle take attendance
    const handleTakeAttendance = (sessionId: string) => {
        // Navigate to take attendance page
        navigate(`${sessionId}`);
    };

    // Refresh sessions
    const refreshSessions = () => {
        if (selectedAccount) {
            setLoading(true);
            fetchAttendanceSessions(selectedAccount, {
                page,
                pageLength: rowsPerPage,
            })
                .then(({ items, itemCount }) => {
                    const mappedData = items.map((item: any) => ({
                        id: item.id,
                        classId: item.classId,
                        className: item.className || "Not available",
                        classLevel: item.classLevel,
                        attendanceDate: item.attendanceDate,
                        schoolTerm: item.schoolTerm,
                        schoolSessions: item.schoolSessions,
                        type: item.type,
                        status: item.status,
                        presentCount: item.presentCount || 0,
                        absentCount: item.absentCount || 0,
                        attendanceRate: item.attendanceRate || 0,
                    }));
                    setData(mappedData);
                    // setTotalCount(itemCount || 0);
                })
                .catch((error) => {
                    console.error("Error fetching attendance sessions:", error);
                    setData([]);
                    // setTotalCount(0);
                })
                .finally(() => setLoading(false));
        }
    };

    // Define columns
    const columns: Column[] = [
        {
            id: "attendanceDate",
            label: "Date",
            minWidth: 120,
            sortable: true,
            format: (value: string) => (
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {formatDate(value)}
                </Typography>
            ),
        },
        {
            id: "className",
            label: "Class",
            minWidth: 150,
            sortable: true,
            format: (value: string, row: AttendanceSession) => (
                <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {value || "Not available"}
                    </Typography>
                    <Typography variant="caption" sx={{ color: "text.secondary" }}>
                        {getEnumDisplayName(classLevelMap, row.classLevel)}
                    </Typography>
                </Box>
            ),
        },
        {
            id: "schoolTerm",
            label: "Term",
            minWidth: 120,
            sortable: true,
            format: (value: number) => (
                <Chip
                    label={getEnumDisplayName(termMap, value)}
                    size="small"
                    sx={{
                        bgcolor: alpha(theme.palette.info.main, 0.1),
                        color: theme.palette.info.main,
                        fontWeight: 500,
                        borderRadius: 1.5,
                        height: 24,
                        fontSize: "0.75rem",
                    }}
                />
            ),
        },
        {
            id: "schoolSessions",
            label: "Session",
            minWidth: 120,
            sortable: true,
            format: (value: number) => (
                <Chip
                    label={getEnumDisplayName(sessionMap, value)}
                    size="small"
                    sx={{
                        bgcolor: alpha(theme.palette.warning.main, 0.1),
                        color: theme.palette.warning.main,
                        fontWeight: 500,
                        borderRadius: 1.5,
                        height: 24,
                        fontSize: "0.75rem",
                    }}
                />
            ),
        },
        {
            id: "type",
            label: "Type",
            minWidth: 100,
            sortable: true,
            format: (value: number) => (
                <Chip
                    label={getEnumDisplayName(attendanceTypeMap, value)}
                    size="small"
                    sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main,
                        fontWeight: 500,
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
            minWidth: 100,
            sortable: true,
            format: (value: number) => {
                const statusName = getEnumDisplayName(statusMap, value);
                const getStatusColor = () => {
                    switch (value) {
                        case 0: return theme.palette.success.main; // Active
                        case 1: return theme.palette.info.main; // Completed
                        case 2: return theme.palette.error.main; // Cancelled
                        default: return theme.palette.grey[500];
                    }
                };
                return (
                    <Chip
                        label={statusName}
                        size="small"
                        sx={{
                            bgcolor: alpha(getStatusColor(), 0.1),
                            color: getStatusColor(),
                            fontWeight: 500,
                            borderRadius: 1.5,
                            height: 24,
                            fontSize: "0.75rem",
                        }}
                    />
                );
            },
        },
        {
            id: "presentCount",
            label: "Present",
            minWidth: 100,
            sortable: true,
            align: "center" as const,
            format: (value: number) => (
                <Chip
                    label={value}
                    size="small"
                    sx={{
                        bgcolor: alpha(theme.palette.success.main, 0.1),
                        color: theme.palette.success.main,
                        fontWeight: 600,
                        borderRadius: 1.5,
                        height: 24,
                        minWidth: 40,
                        fontSize: "0.75rem",
                    }}
                />
            ),
        },
        {
            id: "absentCount",
            label: "Absent",
            minWidth: 100,
            sortable: true,
            align: "center" as const,
            format: (value: number) => (
                <Chip
                    label={value}
                    size="small"
                    sx={{
                        bgcolor: alpha(theme.palette.error.main, 0.1),
                        color: theme.palette.error.main,
                        fontWeight: 600,
                        borderRadius: 1.5,
                        height: 24,
                        minWidth: 40,
                        fontSize: "0.75rem",
                    }}
                />
            ),
        },
        {
            id: "attendanceRate",
            label: "Rate",
            minWidth: 100,
            sortable: true,
            align: "center" as const,
            format: (value: number) => {
                const rate = Math.round(value);
                const getRateColor = () => {
                    if (rate >= 80) return theme.palette.success.main;
                    if (rate >= 60) return theme.palette.warning.main;
                    return theme.palette.error.main;
                };
                return (
                    <Chip
                        label={`${rate}%`}
                        size="small"
                        sx={{
                            bgcolor: alpha(getRateColor(), 0.1),
                            color: getRateColor(),
                            fontWeight: 600,
                            borderRadius: 1.5,
                            height: 24,
                            minWidth: 60,
                            fontSize: "0.75rem",
                        }}
                    />
                );
            },
        },
    ];

    // Action column
    const actionColumn = {
        label: "Actions",
        minWidth: 120,
        align: "center" as const,
        render: (row: AttendanceSession) => (
            <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
                <Tooltip title="Take Attendance" arrow>
                    <IconButton
                        aria-label="take-attendance"
                        onClick={() => handleTakeAttendance(row.id)}
                        size="small"
                        sx={{
                            color: theme.palette.success.main,
                            "&:hover": {
                                bgcolor: alpha(theme.palette.success.main, 0.1),
                            },
                        }}
                    >
                        <AssignmentIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Edit Session" arrow>
                    <IconButton
                        aria-label="edit"
                        onClick={() => navigate(`edit-attendance-session/${row.id}`)}
                        size="small"
                        sx={{
                            color: theme.palette.info.main,
                            "&:hover": {
                                bgcolor: alpha(theme.palette.info.main, 0.1),
                            },
                        }}
                    >
                        <EditIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
                <Tooltip title="Delete Session" arrow>
                    <IconButton
                        aria-label="delete"
                        onClick={() => handleDelete(row.id)}
                        size="small"
                        disabled={isDeleting}
                        sx={{
                            color: theme.palette.error.main,
                            "&:hover": {
                                bgcolor: alpha(theme.palette.error.main, 0.1),
                            },
                        }}
                    >
                        <DeleteIcon fontSize="small" />
                    </IconButton>
                </Tooltip>
            </Box>
        ),
    };

    // Table action buttons
    const tableActionButtons: TableActionButton[] = [
        {
            label: "New Attendance Session",
            icon: <AddIcon />,
            onClick: () => navigate("create-session"),
            color: "primary",
            variant: "contained",
            tooltip: "Create new attendance session",
            show: true,
        },
    ];

    const handleSortChange = (sortByField: string, sortOrder: "asc" | "desc") => {
        setSortBy(sortByField);
        setOrder(sortOrder);
        setPage(1);
    };

    const handlePageChange = (event: unknown, newPage: number) => {
        setPage(newPage + 1);
    };

    const handleRowsPerPageChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(1);
    };

    if (isEnumsLoading && loading) {
        return (
            <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                minHeight="400px"
                sx={{ bgcolor: "background.default" }}
            >
                <CircularProgress size={48} sx={{ color: "primary.main" }} />
            </Box>
        );
    }

    return (
        <Box
            sx={{
                p: { xs: 2, sm: 3, md: 4 },
                bgcolor: "background.default",
                minHeight: "85%",
            }}
        >
            {/* Message Display */}
            {alertMessage.feMessage && (
                <Box sx={{ mb: 2 }}>
                    <MessageDisplay
                        feMessage={alertMessage.feMessage}
                        beMessage={alertMessage.beMessage}
                        httpStatus={alertMessage.httpStatus}
                    />
                </Box>
            )}

            {/* Table */}
            <ReusableTable
                title="Attendance Sessions"
                columns={columns}
                data={data}
                defaultRowsPerPage={rowsPerPage}
                rowsPerPageOptions={[10, 25, 50]}
                showActionColumn={true}
                actionColumn={actionColumn}
                sortBy={sortBy}
                order={order}
                onSortChange={handleSortChange}
                onSelectedRowsChange={(selected) => setSelectedRows(selected.map((row: any) => row.id))}
                page={page - 1}
                onPageChange={handlePageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageChange}
                // totalCount={totalCount}
                loading={loading || isEnumsLoading}
                actionButtons={tableActionButtons}
            />
        </Box>
    );
};

export default AttendanceSessionList;