// hooks/useAttendanceData.ts

import { useState, useEffect, useCallback } from "react";
import { fetchAttendanceDashboardStats } from "../api/attendanceService";
import { fetchClasses } from "../api/classServices";
import { getInitialAuthData } from "../utils/apiClient";
import { type AttendanceStats, type ClassAttendance, type DailyTrend, type StudentAttendance, type ClassOption } from "../types/interfaces/i-attendance";

// Dummy data for charts (since BE only returns stats)
const dummyClassPerformance: ClassAttendance[] = [
    { className: "JSS 1A", classId: "1", rate: 92, present: 28, absent: 3, total: 31 },
    { className: "JSS 1B", classId: "2", rate: 88, present: 26, absent: 4, total: 30 },
    { className: "JSS 2A", classId: "3", rate: 78, present: 22, absent: 6, total: 28 },
    { className: "JSS 2B", classId: "4", rate: 85, present: 24, absent: 5, total: 29 },
    { className: "SSS 1A", classId: "5", rate: 95, present: 30, absent: 2, total: 32 },
    { className: "SSS 1B", classId: "6", rate: 82, present: 23, absent: 6, total: 29 },
    { className: "SSS 2A", classId: "7", rate: 76, present: 20, absent: 7, total: 27 },
    { className: "SSS 2B", classId: "8", rate: 90, present: 27, absent: 3, total: 30 },
];

const dummyDailyTrend: DailyTrend[] = [
    { date: "2024-01-08", rate: 85, present: 238, absent: 42 },
    { date: "2024-01-09", rate: 88, present: 246, absent: 34 },
    { date: "2024-01-10", rate: 82, present: 230, absent: 50 },
    { date: "2024-01-11", rate: 90, present: 252, absent: 28 },
    { date: "2024-01-12", rate: 87, present: 244, absent: 36 },
    { date: "2024-01-15", rate: 85, present: 238, absent: 42 },
    { date: "2024-01-16", rate: 89, present: 249, absent: 31 },
    { date: "2024-01-17", rate: 87, present: 244, absent: 36 },
    { date: "2024-01-18", rate: 91, present: 255, absent: 25 },
    { date: "2024-01-19", rate: 86, present: 241, absent: 39 },
];

const dummyAtRiskStudents: StudentAttendance[] = [
    { id: "1", name: "John Doe", studentId: "STU001", class: "JSS 2A", rate: 45, status: "danger" },
    { id: "2", name: "Jane Smith", studentId: "STU002", class: "SSS 2A", rate: 58, status: "danger" },
    { id: "3", name: "Michael Johnson", studentId: "STU003", class: "JSS 1B", rate: 62, status: "warning" },
    { id: "4", name: "Sarah Williams", studentId: "STU004", class: "SSS 1B", rate: 55, status: "danger" },
    { id: "5", name: "David Brown", studentId: "STU005", class: "JSS 2B", rate: 68, status: "warning" },
];

// Helper functions for date formatting
const getTodayDate = (): string => {
    const today = new Date();
    return today.toISOString().split('T')[0];
};

const getWeekStartDate = (): string => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - daysToMonday);
    return startOfWeek.toISOString().split('T')[0];
};

const getWeekEndDate = (): string => {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - daysToMonday);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 4); // Friday
    return endOfWeek.toISOString().split('T')[0];
};

const getCurrentMonth = (): number => {
    return new Date().getMonth() + 1;
};

const getCurrentYear = (): number => {
    return new Date().getFullYear();
};

// Hook for dashboard data (charts + classes)
export const useDashboardData = () => {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [classData, setClassData] = useState<ClassAttendance[]>([]);
    const [trendData, setTrendData] = useState<DailyTrend[]>([]);
    const [atRiskStudents, setAtRiskStudents] = useState<StudentAttendance[]>([]);
    const [classes, setClasses] = useState<ClassOption[]>([{ id: "all", name: "All Classes" }]);

    const { selectedAccount } = getInitialAuthData();

    const fetchData = useCallback(async () => {
        if (!selectedAccount) {
            setError("No account selected");
            setLoading(false);
            return;
        }

        try {
            setLoading(true);

            // Fetch real classes from API
            const fetchedClasses = await fetchClasses(selectedAccount);

            // Map classes to dropdown options
            const classOptions: ClassOption[] = [
                { id: "all", name: "All Classes" },
                ...fetchedClasses.map((c: any) => ({
                    id: c.id,
                    name: c.className || c.name,
                }))
            ];
            setClasses(classOptions);

            // TODO: Fetch chart data from API when available
            // For now, use dummy data
            await new Promise((resolve) => setTimeout(resolve, 500));
            setClassData(dummyClassPerformance);
            setTrendData(dummyDailyTrend);
            setAtRiskStudents(dummyAtRiskStudents);
            setError(null);
        } catch (err: any) {
            console.error("Failed to fetch dashboard data:", err);
            setError(err.message || "Failed to load dashboard data");
        } finally {
            setLoading(false);
        }
    }, [selectedAccount]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {
        loading,
        error,
        classData,
        trendData,
        atRiskStudents,
        classes,
        refreshData: fetchData,
    };
};

// Hook for stats (changes with filter)
export const useStatsData = (selectedClassId: string = "all") => {
    const [stats, setStats] = useState<AttendanceStats | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const { selectedAccount } = getInitialAuthData();

    const fetchStats = useCallback(async () => {
        if (!selectedAccount) {
            setError("No account selected");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const params = {
                todayDate: getTodayDate(),
                weekStartDate: getWeekStartDate(),
                weekEndDate: getWeekEndDate(),
                month: getCurrentMonth(),
                year: getCurrentYear(),
                // Only send classId if it's not "all"
                classId: selectedClassId !== "all" ? selectedClassId : undefined,
            };

            const response = await fetchAttendanceDashboardStats(selectedAccount, params);

            // Map the response to the expected format
            if (response?.stats) {
                setStats({
                    todayRate: response.stats.todayRate || 0,
                    weekRate: response.stats.weekRate || 0,
                    monthRate: response.stats.monthRate || 0,
                    termRate: response.stats.termRate || 0,
                    presentToday: response.stats.presentToday || 0,
                    absentToday: response.stats.absentToday || 0,
                    comparedToYesterday: response.stats.comparedToYesterday || 0,
                    weekPresent: response.stats.weekPresent || 0,
                    weekAbsent: response.stats.weekAbsent || 0,
                    monthPresent: response.stats.monthPresent || 0,
                    monthAbsent: response.stats.monthAbsent || 0,
                    termPresent: response.stats.termPresent || 0,
                    termAbsent: response.stats.termAbsent || 0,
                    termTotalSessions: response.stats.termTotalSessions || 0,
                    totalStudents: response.stats.totalStudents || 0,
                    totalClasses: response.stats.totalClasses || 0,
                    classesWithAttendance: response.stats.classesWithAttendance || 0,
                    className: response.stats.className,
                    classId: response.stats.classId,
                    currentTerm: response.stats.currentTerm,
                    currentSession: response.stats.currentSession,
                });
            }
        } catch (err: any) {
            console.error("Failed to fetch attendance stats:", err);
            setError(err.message || "Failed to load attendance stats");
        } finally {
            setLoading(false);
        }
    }, [selectedAccount, selectedClassId]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        stats,
        loading,
        error,
        refreshStats: fetchStats,
    };
};