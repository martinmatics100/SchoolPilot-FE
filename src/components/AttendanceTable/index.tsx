// components/attendance/AttendanceTable.tsx
import React, { useState, useEffect, useMemo } from "react";
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Button,
    Avatar,
    CircularProgress,
    Alert,
    Snackbar,
    useTheme,
    alpha,
    Menu,
    MenuItem,
} from "@mui/material";
import {
    CheckCircle as PresentIcon,
    Cancel as AbsentIcon,
    Save as SaveIcon,
    Refresh as RefreshIcon,
    FilterList as FilterIcon,
    People as PeopleIcon,
    TrendingUp as TrendingUpIcon,
} from "@mui/icons-material";

// Types
export interface Student {
    id: string;
    firstName: string;
    lastName: string;
    studentId: string;
    gender: string;
    photoUrl?: string;
}

export interface AttendanceRecord {
    studentId: string;
    status: number | null; // null means not marked
    checkInTime?: string;
    checkOutTime?: string;
    remarks?: string;
}

export interface AttendanceSessionData {
    id: string;
    className: string;
    date: string;
    term: string;
    session: string;
    students: Student[];
    existingRecords?: AttendanceRecord[];
}

interface AttendanceTableProps {
    sessionData: AttendanceSessionData;
    onSave: (records: AttendanceRecord[]) => void;
    onCancel?: () => void;
    isLoading?: boolean;
    isSaving?: boolean;
    readOnly?: boolean;
    enums?: any; // Pass enums from parent
}

type FilterStatus = "all" | "notmarked" | number;

const AttendanceTable: React.FC<AttendanceTableProps> = ({
    sessionData,
    onSave,
    onCancel,
    isLoading = false,
    isSaving = false,
    readOnly = false,
    enums,
}) => {
    const theme = useTheme();
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [selectedStatus, setSelectedStatus] = useState<FilterStatus>("all");
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [snackbar, setSnackbar] = useState<{
        open: boolean;
        message: string;
        severity: "success" | "error" | "info" | "warning";
    }>({
        open: false,
        message: "",
        severity: "info",
    });

    // Create map for AttendanceStatus enum from localStorage
    const attendanceStatusMap = useMemo(() => {
        if (enums?.AttendanceStatus && enums.AttendanceStatus.length > 0) {
            const map = enums.AttendanceStatus.reduce(
                (acc: Record<number, string>, item: { value: number; name: string; displayName?: string }) => {
                    acc[item.value] = item.displayName || item.name;
                    return acc;
                },
                {}
            );
            return map;
        }
        // Fallback hardcoded values if enums not available
        return {
            1: 'Present',
            2: 'Absent'
        };
    }, [enums]);

    // Get status value from name
    const getStatusValue = (statusName: string): number | null => {
        if (!enums?.AttendanceStatus) return null;
        const found = enums.AttendanceStatus.find(
            (item: any) => item.name.toLowerCase() === statusName.toLowerCase()
        );
        return found ? found.value : null;
    };

    // Get status name from value
    const getStatusName = (value: number | null): string => {
        if (value === null) return 'Not Marked';
        return attendanceStatusMap[value] || 'Unknown';
    };

    // Get status label for display (capitalized)
    const getStatusLabel = (value: number | null): string => {
        if (value === null) return 'Not Marked';
        const name = getStatusName(value);
        return name.charAt(0).toUpperCase() + name.slice(1);
    };

    // Get status icon
    const getStatusIcon = (value: number | null) => {
        if (value === null) return null;
        const name = getStatusName(value).toLowerCase();
        switch (name) {
            case 'present':
                return <PresentIcon sx={{ fontSize: 18 }} />;
            case 'absent':
                return <AbsentIcon sx={{ fontSize: 18 }} />;
            default:
                return null;
        }
    };

    // Get status color
    const getStatusColor = (value: number | null) => {
        if (value === null) return theme.palette.grey[500];
        const name = getStatusName(value).toLowerCase();
        switch (name) {
            case 'present':
                return theme.palette.success.main;
            case 'absent':
                return theme.palette.error.main;
            default:
                return theme.palette.grey[500];
        }
    };

    // Initialize attendance records
    useEffect(() => {
        if (sessionData.students) {
            const initialRecords = sessionData.students.map((student) => {
                const existing = sessionData.existingRecords?.find(
                    (r) => r.studentId === student.id
                );
                return {
                    studentId: student.id,
                    status: existing?.status ?? null,
                    checkInTime: existing?.checkInTime,
                    checkOutTime: existing?.checkOutTime,
                    remarks: existing?.remarks,
                };
            });
            setAttendanceRecords(initialRecords);
        }
    }, [sessionData]);

    const handleStatusChange = (studentId: string, statusValue: number | null) => {
        setAttendanceRecords((prev) =>
            prev.map((record) =>
                record.studentId === studentId
                    ? {
                        ...record,
                        status: statusValue,
                        checkInTime: statusValue === getStatusValue('present') ? new Date().toISOString() : record.checkInTime
                    }
                    : record
            )
        );
    };

    const handleSelectAll = (statusValue: number) => {
        setAttendanceRecords((prev) =>
            prev.map((record) => ({
                ...record,
                status: statusValue,
                checkInTime: statusValue === getStatusValue('present') ? new Date().toISOString() : record.checkInTime,
            }))
        );
        showSnackbar(`All students marked as ${getStatusName(statusValue)}`, "info");
    };

    const handleSave = () => {
        // Validate that all students have a status
        const allMarked = attendanceRecords.every((record) => record.status !== null);
        if (!allMarked) {
            showSnackbar("Please mark attendance for all students", "error");
            return;
        }
        onSave(attendanceRecords);
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
    };

    const showSnackbar = (message: string, severity: "success" | "error" | "info" | "warning") => {
        setSnackbar({ open: true, message, severity });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    // Get available statuses from enums
    const availableStatuses = useMemo(() => {
        if (enums?.AttendanceStatus && enums.AttendanceStatus.length > 0) {
            return enums.AttendanceStatus.map((item: any) => ({
                value: item.value,
                name: item.displayName || item.name
            }));
        }
        // Fallback
        return [
            { value: 1, name: 'Present' },
            { value: 2, name: 'Absent' }
        ];
    }, [enums]);

    // Statistics
    const stats = {
        total: attendanceRecords.length,
        marked: attendanceRecords.filter((r) => r.status !== null).length,
        present: attendanceRecords.filter((r) => r.status === getStatusValue('present')).length,
        absent: attendanceRecords.filter((r) => r.status === getStatusValue('absent')).length,
    };

    const attendanceRate = stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0;

    // Filter students
    const filteredStudents = sessionData.students.filter((student) => {
        const record = attendanceRecords.find((r) => r.studentId === student.id);
        const status = record?.status;

        if (selectedStatus === "all") return true;
        if (selectedStatus === "notmarked") return status === null;
        return status === selectedStatus;
    });

    if (isLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            {/* Header */}
            <Paper
                elevation={0}
                sx={{
                    p: { xs: 2, sm: 3 },
                    mb: 3,
                    borderRadius: 2,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.05)} 0%, ${alpha(theme.palette.primary.main, 0.02)} 100%)`,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
            >
                <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2 }}>
                    <Box>
                        <Typography variant="h5" fontWeight={600} gutterBottom>
                            📋 Take Attendance
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            {sessionData.className} • {new Date(sessionData.date).toLocaleDateString()} • {sessionData.term} • {sessionData.session}
                        </Typography>
                    </Box>
                    <Box display="flex" gap={1} flexWrap="wrap">
                        <Chip
                            icon={<PeopleIcon />}
                            label={`${stats.total} Students`}
                            size="small"
                            sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1) }}
                        />
                        <Chip
                            icon={<TrendingUpIcon />}
                            label={`${stats.marked > 0 ? Math.round((stats.present / stats.marked) * 100) : 0}% Present`}
                            size="small"
                            sx={{
                                bgcolor: alpha(
                                    attendanceRate >= 80 ? theme.palette.success.main :
                                        attendanceRate >= 60 ? theme.palette.warning.main :
                                            theme.palette.error.main,
                                    0.1
                                ),
                                color: attendanceRate >= 80 ? theme.palette.success.main :
                                    attendanceRate >= 60 ? theme.palette.warning.main :
                                        theme.palette.error.main,
                            }}
                        />
                        <Chip
                            label={`${stats.marked}/${stats.total} Marked`}
                            size="small"
                            sx={{ bgcolor: alpha(theme.palette.info.main, 0.1) }}
                        />
                    </Box>
                </Box>
            </Paper>

            {/* Toolbar */}
            <Paper
                elevation={0}
                sx={{
                    p: 2,
                    mb: 2,
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    alignItems: "center",
                    justifyContent: "space-between",
                    bgcolor: theme.palette.background.default
                }}
            >
                <Box display="flex" flexWrap="wrap" gap={1}>
                    <Button
                        size="small"
                        variant={selectedStatus === "all" ? "contained" : "outlined"}
                        onClick={() => setSelectedStatus("all")}
                        sx={{ borderRadius: 2, textTransform: "none" }}
                    >
                        All ({stats.total})
                    </Button>
                    {availableStatuses.map((status) => (
                        <Button
                            key={status.value}
                            size="small"
                            variant={selectedStatus === status.value ? "contained" : "outlined"}
                            onClick={() => setSelectedStatus(status.value)}
                            sx={{
                                borderRadius: 2,
                                textTransform: "none",
                                color: selectedStatus === status.value ? '#fff' : getStatusColor(status.value),
                                borderColor: getStatusColor(status.value),
                                bgcolor: selectedStatus === status.value ? getStatusColor(status.value) : 'transparent',
                            }}
                        >
                            {status.name} ({stats[status.name.toLowerCase() as keyof typeof stats] || 0})
                        </Button>
                    ))}
                    <Button
                        size="small"
                        variant={selectedStatus === "notmarked" ? "contained" : "outlined"}
                        onClick={() => setSelectedStatus("notmarked")}
                        sx={{ borderRadius: 2, textTransform: "none" }}
                    >
                        Not Marked ({stats.total - stats.marked})
                    </Button>
                </Box>

                <Box display="flex" gap={1}>
                    {/* <Button
                        size="small"
                        startIcon={<RefreshIcon />}
                        onClick={() => {
                            const initialRecords = sessionData.students.map((student) => ({
                                studentId: student.id,
                                status: null,
                            }));
                            setAttendanceRecords(initialRecords);
                            showSnackbar("Attendance reset", "info");
                        }}
                        sx={{ borderRadius: 2, textTransform: "none" }}
                    >
                        Reset
                    </Button> */}
                    <Button
                        size="small"
                        startIcon={<FilterIcon />}
                        onClick={(e) => setAnchorEl(e.currentTarget)}
                        sx={{ borderRadius: 2, textTransform: "none" }}
                    >
                        Bulk Action
                    </Button>
                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                    >
                        {availableStatuses.map((status) => (
                            <MenuItem
                                key={status.value}
                                onClick={() => {
                                    handleSelectAll(status.value);
                                    setAnchorEl(null);
                                }}
                            >
                                {getStatusIcon(status.value)}
                                <span style={{ marginLeft: 8 }}>
                                    Mark All {status.name}
                                </span>
                            </MenuItem>
                        ))}
                    </Menu>
                </Box>
            </Paper>

            {/* Table */}
            <TableContainer
                component={Paper}
                sx={{
                    borderRadius: 2,
                    border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                    overflow: "auto",
                    bgcolor: theme.palette.background.default
                }}
            >
                <Table stickyHeader>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 600, bgcolor: theme.palette.background.default, color: theme.palette.text.secondary }}>
                                #
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, bgcolor: theme.palette.background.default, color: theme.palette.text.secondary }}>
                                Student
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, bgcolor: theme.palette.background.default, color: theme.palette.text.secondary }}>
                                ID
                            </TableCell>
                            <TableCell sx={{ fontWeight: 600, bgcolor: theme.palette.background.default, color: theme.palette.text.secondary, minWidth: 300 }}>
                                Attendance Status
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {filteredStudents.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                                    <Typography variant="body1" color="text.secondary">
                                        No students found
                                    </Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            sessionData.students.map((student, index) => {
                                const record = attendanceRecords.find((r) => r.studentId === student.id);
                                const currentStatus = record?.status ?? null;

                                // Skip if filtered out
                                if (selectedStatus !== "all" && selectedStatus !== "notmarked") {
                                    if (currentStatus !== selectedStatus) return null;
                                }
                                if (selectedStatus === "notmarked" && currentStatus !== null) return null;

                                const isMarked = currentStatus !== null;

                                return (
                                    <TableRow
                                        key={student.id}
                                        hover
                                        sx={{
                                            bgcolor: !isMarked
                                                ? alpha(theme.palette.grey[500], 0.03)
                                                : currentStatus === getStatusValue('absent')
                                                    ? alpha(theme.palette.error.main, 0.03)
                                                    : currentStatus === getStatusValue('present')
                                                        ? alpha(theme.palette.success.main, 0.03)
                                                        : "transparent",
                                        }}
                                    >
                                        <TableCell>{index + 1}</TableCell>
                                        <TableCell>
                                            <Box display="flex" alignItems="center" gap={1.5}>
                                                <Avatar
                                                    sx={{
                                                        width: 32,
                                                        height: 32,
                                                        bgcolor: alpha(theme.palette.background.default, 0.1),
                                                        color: theme.palette.text.secondary,
                                                        fontSize: "0.75rem",
                                                    }}
                                                >
                                                    {student.firstName?.[0]}{student.lastName?.[0]}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="body2" fontWeight={500} sx={{ color: theme.palette.text.secondary }}>
                                                        {student.lastName}, {student.firstName}
                                                    </Typography>
                                                    <Typography variant="caption" color="text.secondary">
                                                        {student.gender || "N/A"}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {student.studentId || "N/A"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Box display="flex" flexWrap="wrap" gap={0.5}>
                                                <Button
                                                    size="small"
                                                    variant={!isMarked ? "contained" : "outlined"}
                                                    onClick={() => handleStatusChange(student.id, null)}
                                                    sx={{
                                                        borderRadius: 2,
                                                        textTransform: "none",
                                                        fontSize: "0.7rem",
                                                        px: 1.5,
                                                        py: 0.5,
                                                        minWidth: "auto",
                                                        bgcolor: !isMarked ? theme.palette.grey[500] : "transparent",
                                                        color: !isMarked ? "#fff" : theme.palette.grey[500],
                                                        borderColor: !isMarked ? theme.palette.grey[500] : alpha(theme.palette.grey[500], 0.3),
                                                        "&:hover": {
                                                            bgcolor: !isMarked ? theme.palette.grey[500] : alpha(theme.palette.grey[500], 0.1),
                                                        },
                                                    }}
                                                    disabled={readOnly}
                                                >
                                                    Not Marked
                                                </Button>
                                                {availableStatuses.map((status) => {
                                                    const isSelected = currentStatus === status.value;
                                                    const color = getStatusColor(status.value);
                                                    return (
                                                        <Button
                                                            key={status.value}
                                                            size="small"
                                                            variant={isSelected ? "contained" : "outlined"}
                                                            onClick={() => handleStatusChange(student.id, status.value)}
                                                            startIcon={getStatusIcon(status.value)}
                                                            sx={{
                                                                borderRadius: 2,
                                                                textTransform: "none",
                                                                fontSize: "0.7rem",
                                                                px: 1.5,
                                                                py: 0.5,
                                                                minWidth: "auto",
                                                                bgcolor: isSelected ? color : "transparent",
                                                                color: isSelected ? "#fff" : color,
                                                                borderColor: isSelected ? color : alpha(color, 0.3),
                                                                "&:hover": {
                                                                    bgcolor: isSelected ? color : alpha(color, 0.1),
                                                                },
                                                            }}
                                                            disabled={readOnly}
                                                        >
                                                            {status.name}
                                                        </Button>
                                                    );
                                                })}
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Actions */}
            <Box
                sx={{
                    mt: 3,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    justifyContent: "flex-end",
                    position: "sticky",
                    bottom: 0,
                    bgcolor: "background.default",
                    pt: 2,
                    pb: 1,
                    borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                }}
            >
                <Button
                    variant="outlined"
                    onClick={handleCancel}
                    disabled={isSaving}
                    sx={{ borderRadius: 2, textTransform: "none" }}
                >
                    Cancel
                </Button>
                <Button
                    variant="contained"
                    startIcon={isSaving ? <CircularProgress size={20} /> : <SaveIcon />}
                    onClick={handleSave}
                    disabled={isSaving || readOnly}
                    sx={{
                        borderRadius: 2,
                        textTransform: "none",
                        px: 4,
                        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                    }}
                >
                    {isSaving ? "Saving..." : "Save Attendance"}
                </Button>
            </Box>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    onClose={handleCloseSnackbar}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ borderRadius: 2 }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default AttendanceTable;