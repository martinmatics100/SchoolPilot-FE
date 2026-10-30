import React, { useEffect, useState, useMemo } from "react";
import { ReusableTable, type Column, type TableActionButton } from "../../../../../components/table";
import IconButton from "@mui/material/IconButton";
import AssignmentIcon from "@mui/icons-material/Assignment";
import { useTheme, alpha, Box, Typography, Chip, Tooltip } from "@mui/material";
import {
    getInitialAuthData,
    getCurrentUser,
} from "../../../../../utils/apiClient";
import { UserRoles } from "../../../../../enums/user-roles";
import { useEnums } from "../../../../../hooks/useEnums";
import CircularProgress from "@mui/material/CircularProgress";
import { fetchAttendanceSessions } from "../../../../../api/attendanceService";
import { fetchMyFormTeacherClasses } from "../../../../../api/classServices";
import { useNavigate } from "react-router-dom";
import MessageDisplay from "../../../../../components/message-display";

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
    const [selectedRows, setSelectedRows] = useState<string[]>([]);
    const [alertMessage, setAlertMessage] = useState<{
        feMessage?: string;
        beMessage?: string;
        httpStatus?: number;
    }>({});

    // ── Filter state ──
    const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);
    const [classFilter, setClassFilter] = useState<string>("");
    const [classesLoaded, setClassesLoaded] = useState(false);
    const [initialFilterApplied, setInitialFilterApplied] = useState(false);

    const theme = useTheme();
    const { selectedAccount } = getInitialAuthData();
    const { enums, isLoading: isEnumsLoading } = useEnums({
        fetchPermissionData: false,
    });

    // ── Role detection (admin vs teacher) ──
    const currentUser = getCurrentUser();
    const isAdmin = !!currentUser?.roles?.some(
        (r) => r === UserRoles.ADMIN || r === UserRoles.SUPER_ADMIN
    );

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

    const getEnumDisplayName = (
        map: Record<number, string>,
        value: number,
        defaultValue: string = "Unknown"
    ) => {
        return map[value] || defaultValue;
    };

    /* ─────────────────────────────────────────────────────────
       LOAD CLASSES
       ───────────────────────────────────────────────────────── */
    useEffect(() => {
        const loadClasses = async () => {
            if (!selectedAccount) {
                setClassesLoaded(true);
                return;
            }
            try {
                const { ok, data: responseData } =
                    await fetchMyFormTeacherClasses(selectedAccount);

                if (ok && Array.isArray(responseData?.classes)) {
                    setClasses(
                        responseData.classes.map((c: any) => ({
                            id: c.classId,
                            name: c.className,
                        }))
                    );
                } else {
                    console.error(
                        "Failed to load classes:",
                        responseData?.message
                    );
                    setClasses([]);
                }
            } catch (err) {
                console.error("Failed to load classes:", err);
                setClasses([]);
            } finally {
                setClassesLoaded(true);
            }
        };
        loadClasses();
    }, [selectedAccount]);

    // ── Auto-select first class once classes are loaded ──
    useEffect(() => {
        if (!classesLoaded) return;
        if (initialFilterApplied) return;

        if (classes.length > 0) {
            setClassFilter(classes[0].id);
        }
        setInitialFilterApplied(true);
    }, [classesLoaded, classes, initialFilterApplied]);

    /* ─────────────────────────────────────────────────────────
       LOAD SESSIONS
       ───────────────────────────────────────────────────────── */
    const loadSessions = () => {
        if (!selectedAccount) {
            setData([]);
            return;
        }

        if (!classesLoaded) return;
        if (!initialFilterApplied && classes.length > 0) return;

        setLoading(true);
        fetchAttendanceSessions(selectedAccount, {
            page,
            pageLength: rowsPerPage,
            classId: classFilter || undefined,
        })
            .then(({ items }) => {
                const mappedData: AttendanceSession[] = items.map(
                    (item: any) => ({
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
                    })
                );
                setData(mappedData);
            })
            .catch((error) => {
                console.error("Error fetching attendance sessions:", error);
                setAlertMessage({
                    feMessage: "Failed to load attendance sessions.",
                    beMessage: error?.message,
                    httpStatus: 500,
                });
                setData([]);
            })
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadSessions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        page,
        rowsPerPage,
        sortBy,
        order,
        selectedAccount,
        classFilter,
        classesLoaded,
        initialFilterApplied,
        classes.length,
    ]);

    const formatDate = (dateString: string) => {
        if (!dateString) return "Not available";
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return dateString;
        }
    };

    const handleTakeAttendance = (sessionId: string) => {
        navigate(`${sessionId}`);
    };

    /* ─────────────────────────────────────────────────────────
       FILTER CONFIG
       ───────────────────────────────────────────────────────── */
    const tableFilters = useMemo(() => {
        const classOptions = classes.map((c) => ({
            value: c.id,
            label: c.name,
        }));

        const options = isAdmin
            ? [{ value: "", label: "All Classes" }, ...classOptions]
            : classOptions;

        return [
            {
                name: "classId",
                label: "Class",
                type: "select" as const,
                defaultValue: classes.length > 0 ? classes[0].id : "",
                minWidth: 220,
                options,
            },
        ];
    }, [classes, isAdmin]);

    const handleFilterChange = (
        values: Record<string, string | number | "">
    ) => {
        const newClassId = (values.classId as string) || "";
        setClassFilter(newClassId);
        setPage(1);
    };

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
                        case 0:
                            return theme.palette.success.main;
                        case 1:
                            return theme.palette.info.main;
                        case 2:
                            return theme.palette.error.main;
                        default:
                            return theme.palette.grey[500];
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

    const actionColumn = {
        label: "Actions",
        minWidth: 80,
        align: "center" as const,
        render: (row: AttendanceSession) => (
            <Box sx={{ display: "flex", justifyContent: "center" }}>
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
            </Box>
        ),
    };

    const tableActionButtons: TableActionButton[] = [];

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
            <MessageDisplay
                feMessage={alertMessage.feMessage}
                beMessage={alertMessage.beMessage}
                httpStatus={alertMessage.httpStatus}
            />

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
                onSelectedRowsChange={(selected) =>
                    setSelectedRows(selected.map((row: any) => row.id))
                }
                page={page - 1}
                onPageChange={handlePageChange}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleRowsPerPageChange}
                loading={loading || isEnumsLoading}
                actionButtons={tableActionButtons}
                showFilters={true}
                filters={tableFilters}
                onFilterChange={handleFilterChange}
            />
        </Box>
    );
};

export default AttendanceSessionList;