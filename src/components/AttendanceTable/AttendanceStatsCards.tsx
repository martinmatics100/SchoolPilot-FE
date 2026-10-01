// pages/attendance/AttendanceDashboard/components/AttendanceStatsCards.tsx

import React from "react";
import { Box } from "@mui/material";
import {
    People as PeopleIcon,
    CheckCircle as PresentIcon,
    Cancel as AbsentIcon,
    CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import StatsCard from "./StatsCard";
import { type AttendanceStats } from "../../types/interfaces/i-attendance";

interface AttendanceStatsCardsProps {
    stats: AttendanceStats | null;
    selectedClass?: string;
}

// Helper functions
const getTodayDate = (): string => {
    const today = new Date();
    return today.toLocaleDateString("en-US", {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    });
};

const getWeekRange = (): string => {
    const today = new Date();
    const dayOfWeek = today.getDay();

    // Get Monday (start of week)
    const startOfWeek = new Date(today);
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    startOfWeek.setDate(today.getDate() - daysToMonday);

    // Get Friday (end of week - school week)
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 4); // Friday

    const startStr = startOfWeek.toLocaleDateString("en-US", { month: 'short', day: 'numeric' });
    const endStr = endOfWeek.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' });

    return `${startStr} - ${endStr}`;
};

const getMonthName = (): string => {
    const today = new Date();
    return today.toLocaleDateString("en-US", { month: 'long', year: 'numeric' });
};

const AttendanceStatsCards: React.FC<AttendanceStatsCardsProps> = ({ stats, selectedClass }) => {
    const todayDate = getTodayDate();
    const weekRange = getWeekRange();
    const monthName = getMonthName();

    return (
        <Box
            display="grid"
            gridTemplateColumns={{
                xs: "1fr 1fr",
                sm: "1fr 1fr",
                md: "1fr 1fr 1fr 1fr",
            }}
            gap={{ xs: 1.5, sm: 2, md: 2 }}
        >
            <StatsCard
                title="Today's Attendance"
                value={`${stats?.todayRate || 0}%`}
                subtitle={`${stats?.presentToday || 0} present`}
                icon={<PresentIcon />}
                color="success"
                trend={stats?.comparedToYesterday}
                trendLabel="vs yesterday"
                dateRange={todayDate}
                footerText={selectedClass ? `Class: ${selectedClass}` : "All Classes"}
            />
            <StatsCard
                title="This Week's Attendance"
                value={`${stats?.weekRate || 0}%`}
                subtitle={`Avg: ${stats?.weekRate || 0}%`}
                icon={<CalendarIcon />}
                color="primary"
                dateRange={weekRange}
                footerText={`Week of ${weekRange}`}
            />
            <StatsCard
                title="This Month's Attendance"
                value={`${stats?.monthRate || 0}%`}
                subtitle={`Avg: ${stats?.monthRate || 0}%`}
                icon={<CalendarIcon />}
                color="info"
                dateRange={monthName}
                footerText={`Month of ${monthName}`}
            />
            <StatsCard
                title="Term Average"
                value={`${stats?.termRate || 0}%`}
                subtitle="Overall attendance"
                icon={<CalendarIcon />}
                color="warning"
                footerText="Current Term"
            />
        </Box>
    );
};

export default AttendanceStatsCards;