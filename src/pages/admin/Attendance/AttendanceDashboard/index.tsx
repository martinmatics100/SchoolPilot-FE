// pages/attendance/AttendanceDashboard/index.tsx

import React, { useState } from "react";
import {
    Box,
    Typography,
    FormControl,
    Select,
    MenuItem,
    IconButton,
    Tooltip,
    CircularProgress,
    InputLabel,
} from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import ComponentError from "../../../../components/states/componentError";
import AttendanceStatsCards from "../../../../components/AttendanceTable/AttendanceStatsCards";
import DailyTrendCard from "../../../../components/AttendanceTable/DailyTrendCard";
import DistributionCard from "../../../../components/AttendanceTable/DistributionCard";
import ClassPerformanceCard from "../../../../components/AttendanceTable/ClassPerformanceCard";
import AtRiskStudentsCard from "../../../../components/AttendanceTable/AtRiskStudentsCard";
import { useDashboardData, useStatsData } from "../../../../hooks/useAttendanceData";

const AttendanceDashboard: React.FC = () => {
    const [selectedClass, setSelectedClass] = useState<string>("all");

    // Dashboard data (doesn't change with filter)
    const {
        loading: dashboardLoading,
        error: dashboardError,
        classData,
        trendData,
        atRiskStudents,
        classes,
        refreshData
    } = useDashboardData();

    // Stats data (changes with filter)
    const {
        stats,
        loading: statsLoading,
        error: statsError,
        refreshStats
    } = useStatsData(selectedClass);

    // Get selected class name for display
    const getSelectedClassName = () => {
        const found = classes.find(c => c.id === selectedClass);
        return found ? found.name : "All Classes";
    };

    const handleRefresh = () => {
        refreshData();
        refreshStats();
    };

    if (dashboardLoading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    if (dashboardError) {
        return (
            <ComponentError
                title="attendance dashboard"
                action="loading"
                onRetry={handleRefresh}
                ticketUrl="/support"
            />
        );
    }

    return (
        <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
            {/* Header */}
            <Box
                display="flex"
                flexDirection={{ xs: "column", sm: "row" }}
                justifyContent="space-between"
                alignItems={{ xs: "flex-start", sm: "center" }}
                sx={{ mb: { xs: 2, sm: 3 }, gap: { xs: 1.5, sm: 2 } }}
            >
                <Box>
                    <Typography
                        variant="h4"
                        fontWeight={700}
                        sx={{ fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' } }}
                    >
                        📊 Attendance Dashboard
                    </Typography>
                    <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                    >
                        {selectedClass === "all"
                            ? "Overview of attendance across all classes"
                            : `Showing stats for: ${getSelectedClassName()}`
                        }
                    </Typography>
                </Box>
                <Box display="flex" alignItems="center" gap={{ xs: 1, sm: 2 }} flexWrap="wrap">
                    <FormControl size="small" sx={{ minWidth: { xs: 120, sm: 160 } }}>
                        <InputLabel id="class-select-label">Class</InputLabel>
                        <Select
                            labelId="class-select-label"
                            value={selectedClass}
                            onChange={(e) => {
                                setSelectedClass(e.target.value);
                            }}
                            label="Class"
                        >
                            {classes.map((cls) => (
                                <MenuItem key={cls.id} value={cls.id}>
                                    {cls.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                    <Tooltip title="Refresh Data">
                        <IconButton onClick={handleRefresh} size="small">
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                </Box>
            </Box>

            {/* Stats Cards - Only this section updates when filter changes */}
            <Box sx={{ mb: { xs: 2, sm: 3 } }}>
                {statsLoading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight="150px">
                        <CircularProgress size={30} />
                    </Box>
                ) : statsError ? (
                    <Typography color="error" align="center" sx={{ py: 2 }}>
                        {statsError}
                    </Typography>
                ) : (
                    <AttendanceStatsCards stats={stats} selectedClass={getSelectedClassName()} />
                )}
            </Box>

            {/* Charts Row 1 - Static (doesn't change with filter) */}
            <Box
                display="grid"
                gridTemplateColumns={{
                    xs: "1fr",
                    sm: "1fr 1fr",
                }}
                gap={{ xs: 2, sm: 3 }}
                sx={{ mb: { xs: 2, sm: 3 } }}
            >
                <DailyTrendCard data={trendData} />
                <DistributionCard
                    present={stats?.presentToday || 0}
                    absent={stats?.absentToday || 0}
                    late={0}
                    excused={0}
                />
            </Box>

            {/* Charts Row 2 - Static (doesn't change with filter) */}
            <Box
                display="grid"
                gridTemplateColumns={{
                    xs: "1fr",
                    md: "2fr 1fr",
                }}
                gap={{ xs: 2, sm: 3 }}
            >
                <ClassPerformanceCard data={classData} />
                <AtRiskStudentsCard students={atRiskStudents} />
            </Box>
        </Box>
    );
};

export default AttendanceDashboard;