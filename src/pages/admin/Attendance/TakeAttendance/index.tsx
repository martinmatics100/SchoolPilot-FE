// pages/attendance/TakeAttendance.tsx

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Box,
    Container,
    Typography,
    Breadcrumbs,
    Link,
    Alert,
    CircularProgress,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
} from "@mui/material";
import {
    ArrowBack as ArrowBackIcon,
    Home as HomeIcon,
} from "@mui/icons-material";
import AttendanceTable, {
    type AttendanceRecord,
    type AttendanceSessionData,
    type Student,
} from "../../../../components/AttendanceTable/index";
import { getInitialAuthData } from "../../../../utils/apiClient";
import {
    fetchAttendanceSessionDetails,
    bulkMarkAttendance,
} from "../../../../api/attendanceService";
import { useEnums } from "../../../../hooks/useEnums";
import MessageDisplay from "../../../../components/message-display";

// Map status string to enum value
const getAttendanceStatusValue = (status: string, enums: any): number | null => {
    if (!enums?.AttendanceStatus) return null;
    const found = enums.AttendanceStatus.find(
        (item: any) => item.name.toLowerCase() === status.toLowerCase()
    );
    return found ? found.value : null;
};

const TakeAttendance = () => {
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sessionData, setSessionData] = useState<AttendanceSessionData | null>(null);
    const [loadError, setLoadError] = useState<string | null>(null);
    const [alertMessage, setAlertMessage] = useState<{
        feMessage?: string;
        beMessage?: string;
        httpStatus?: number;
    }>({});
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean;
        records: AttendanceRecord[] | null;
    }>({
        open: false,
        records: null,
    });

    const { selectedAccount } = getInitialAuthData();
    const { enums, isLoading: isEnumsLoading } = useEnums({
        fetchPermissionData: false,
    });

    const termMap = React.useMemo(() => {
        return enums?.SchoolTerms?.reduce(
            (acc: Record<number, string>, item: { value: number; displayName: string; name: string }) => {
                acc[item.value] = item.displayName || item.name;
                return acc;
            },
            {}
        ) || {};
    }, [enums]);

    const sessionMap = React.useMemo(() => {
        return enums?.SchoolSessions?.reduce(
            (acc: Record<number, string>, item: { value: number; displayName: string; name: string }) => {
                acc[item.value] = item.displayName || item.name;
                return acc;
            },
            {}
        ) || {};
    }, [enums]);

    const attendanceTypeMap = React.useMemo(() => {
        return enums?.AttendanceType?.reduce(
            (acc: Record<number, string>, item: { value: number; displayName: string; name: string }) => {
                acc[item.value] = item.displayName || item.name;
                return acc;
            },
            {}
        ) || {};
    }, [enums]);

    const statusMap = React.useMemo(() => {
        return enums?.AttendanceSessionStatus?.reduce(
            (acc: Record<number, string>, item: { value: number; displayName: string; name: string }) => {
                acc[item.value] = item.displayName || item.name;
                return acc;
            },
            {}
        ) || {};
    }, [enums]);

    const genderMap = React.useMemo(() => {
        return enums?.Gender?.reduce(
            (acc: Record<number, string>, item: { value: number; displayName: string; name: string }) => {
                acc[item.value] = item.displayName || item.name;
                return acc;
            },
            {}
        ) || {};
    }, [enums]);

    useEffect(() => {
        const fetchSessionData = async () => {
            if (!selectedAccount || !sessionId) return;

            setLoading(true);
            try {
                const response = await fetchAttendanceSessionDetails(selectedAccount, sessionId);

                const students: Student[] = response.students.map((s: any) => ({
                    id: s.studentId,
                    firstName: s.firstName,
                    lastName: s.lastName,
                    studentId: s.studentNumber,
                    gender: genderMap[s.gender] || "Unknown",
                    photoUrl: s.photoUrl,
                }));

                const existingRecords: AttendanceRecord[] = response.students
                    .filter((s: any) => s.attendanceRecord)
                    .map((s: any) => ({
                        studentId: s.studentId,
                        status: s.attendanceRecord.status,
                        checkInTime: s.attendanceRecord.checkInTime,
                        checkOutTime: s.attendanceRecord.checkOutTime,
                        remarks: s.attendanceRecord.remarks,
                    }));

                setSessionData({
                    id: response.session.id,
                    className: response.session.className,
                    date: response.session.attendanceDate,
                    term: termMap[response.session.term] || `Term ${response.session.term}`,
                    session: sessionMap[response.session.session] || `Session ${response.session.session}`,
                    students,
                    existingRecords,
                });
            } catch (err: any) {
                setLoadError(err.message || "Failed to load session data");
            } finally {
                setLoading(false);
            }
        };

        fetchSessionData();
    }, [sessionId, selectedAccount, termMap, sessionMap, attendanceTypeMap, statusMap, genderMap]);

    const handleSave = (records: AttendanceRecord[]) => {
        setConfirmDialog({ open: true, records });
    };

    const confirmSave = async () => {
        if (!confirmDialog.records || !sessionData || !selectedAccount) return;

        setSaving(true);
        setConfirmDialog({ open: false, records: null });

        try {
            const attendances = confirmDialog.records
                .filter((r) => r.status !== null)
                .map((r) => ({
                    studentId: r.studentId,
                    status: r.status as number,
                }));

            const payload = {
                sessionId: sessionData.id,
                attendances,
                autoCompleteSession: false,
            };

            const { status, ok, data } = await bulkMarkAttendance(selectedAccount, payload);

            const beMessage: string | undefined =
                typeof data?.message === "string" && data.message.trim()
                    ? data.message.trim()
                    : undefined;

            const successCount: number =
                typeof data?.successCount === "number" ? data.successCount : 0;

            if (ok) {
                setAlertMessage({
                    feMessage:
                        successCount > 0
                            ? `Successfully marked ${successCount} student${successCount === 1 ? "" : "s"}.`
                            : "Attendance saved.",
                    beMessage,
                    httpStatus: status,
                });

                setTimeout(() => {
                    navigate("/app/attendance");
                }, 2000);
            } else {
                setAlertMessage({
                    feMessage: "Failed to save attendance.",
                    beMessage,
                    httpStatus: status,
                });
            }
        } catch (err: any) {
            setAlertMessage({
                feMessage: "Failed to save attendance.",
                beMessage: err?.message,
                httpStatus: 500,
            });
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (window.confirm("Are you sure you want to cancel? Unsaved changes will be lost.")) {
            navigate("/app/attendance-sessions");
        }
    };

    if (loading || isEnumsLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (loadError && !loading) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="error" sx={{ borderRadius: 2 }}>
                    {loadError}
                </Alert>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/app/attendance-sessions")}
                    sx={{ mt: 2, borderRadius: 2 }}
                >
                    Go Back
                </Button>
            </Container>
        );
    }

    if (!sessionData) {
        return (
            <Container maxWidth="lg" sx={{ py: 4 }}>
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                    Session not found
                </Alert>
                <Button
                    variant="outlined"
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/app/attendance-sessions")}
                    sx={{ mt: 2, borderRadius: 2 }}
                >
                    Go Back
                </Button>
            </Container>
        );
    }

    return (
        <Box sx={{ bgcolor: "background.default", minHeight: "100vh", py: { xs: 2, sm: 3, md: 4 } }}>
            <MessageDisplay
                feMessage={alertMessage.feMessage}
                beMessage={alertMessage.beMessage}
                httpStatus={alertMessage.httpStatus}
            />

            <Container maxWidth="xl">
                <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 3 }}>
                    <Link
                        underline="hover"
                        color="inherit"
                        href="/app/dashboard"
                        sx={{ display: "flex", alignItems: "center" }}
                    >
                        <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
                        Dashboard
                    </Link>
                    <Link
                        underline="hover"
                        color="inherit"
                        href="/app/attendance-sessions"
                        onClick={(e) => {
                            e.preventDefault();
                            navigate("/app/attendance-sessions");
                        }}
                    >
                        Attendance Sessions
                    </Link>
                    <Typography color="text.primary">Take Attendance</Typography>
                </Breadcrumbs>

                <Button
                    startIcon={<ArrowBackIcon />}
                    onClick={() => navigate("/app/attendance-sessions")}
                    sx={{ mb: 2, borderRadius: 2, textTransform: "none" }}
                >
                    Back to Sessions
                </Button>

                <AttendanceTable
                    sessionData={sessionData}
                    onSave={handleSave}
                    onCancel={handleCancel}
                    isLoading={loading}
                    isSaving={saving}
                    readOnly={false}
                    enums={enums}
                />
            </Container>

            <Dialog
                open={confirmDialog.open}
                onClose={() => setConfirmDialog({ open: false, records: null })}
            >
                <DialogTitle sx={{ bgcolor: (theme) => theme.palette.background.default }}>
                    Confirm Attendance
                </DialogTitle>
                <DialogContent sx={{ bgcolor: (theme) => theme.palette.background.default }}>
                    <DialogContentText>
                        Are you sure you want to save attendance for this session?
                        {confirmDialog.records && (
                            <Box sx={{ mt: 2 }}>
                                <Typography variant="body2">
                                    Students to mark:{" "}
                                    {confirmDialog.records.filter((r) => r.status !== null).length} /{" "}
                                    {confirmDialog.records.length}
                                </Typography>
                            </Box>
                        )}
                        This action will update the attendance records and summary.
                    </DialogContentText>
                </DialogContent>
                <DialogActions sx={{ bgcolor: (theme) => theme.palette.background.default }}>
                    <Button onClick={() => setConfirmDialog({ open: false, records: null })}>
                        Cancel
                    </Button>
                    <Button onClick={confirmSave} variant="contained" color="primary" autoFocus>
                        Confirm Save
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default TakeAttendance;