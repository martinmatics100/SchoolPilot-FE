// pages/attendance/AttendanceDashboard/components/DailyTrendCard.tsx

import React, { useEffect, useRef } from "react";
import { Paper, Box, Typography, Chip, useTheme, alpha } from "@mui/material";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";
import { type DailyTrend } from "../../types/interfaces/i-attendance";

// Register all required Chart.js components
ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

interface DailyTrendCardProps {
    data: DailyTrend[];
}

const DailyTrendCard: React.FC<DailyTrendCardProps> = ({ data }) => {
    const theme = useTheme();
    const chartRef = useRef<any>(null);

    useEffect(() => {
        if (chartRef.current) {
            chartRef.current.update();
        }
    }, [data]);

    const chartData = {
        labels: data.map((d) => {
            const date = new Date(d.date);
            return date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
        }),
        datasets: [
            {
                label: "Attendance Rate",
                data: data.map((d) => d.rate),
                borderColor: theme.palette.primary.main,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                fill: true,
                tension: 0.4,
                pointBackgroundColor: theme.palette.primary.main,
                pointRadius: 4,
                pointHoverRadius: 6,
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 1200,
            easing: 'easeInOutQuart' as const,
        },
        plugins: {
            legend: {
                display: false
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const index = context.dataIndex;
                        const item = data[index];
                        return [
                            `Rate: ${item.rate}%`,
                            `Present: ${item.present}`,
                            `Absent: ${item.absent}`,
                        ];
                    },
                },
            },
        },
        scales: {
            x: {
                type: 'category' as const,
                grid: {
                    display: false,
                },
                ticks: {
                    maxRotation: 45,
                    minRotation: 45,
                    font: {
                        size: 13,
                        // Use number instead of string for weight
                        weight: 'bold' as const, // or 'normal' | 'bolder' | 'lighter'
                    },
                    color: theme.palette.text.secondary,
                },
            },
            y: {
                beginAtZero: true,
                max: 100,
                grid: {
                    color: alpha(theme.palette.divider, 0.1)
                },
                ticks: {
                    font: {
                        size: 13,
                        weight: 'bold' as const,
                    },
                    color: theme.palette.text.secondary,
                    stepSize: 20,
                },
            },
        },
    };

    return (
        <Paper sx={{ p: 3, borderRadius: 2, height: "100%", bgcolor: theme.palette.background.default }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap" gap={1} sx={{ mb: 2 }}>
                <Typography variant="h6" fontWeight={600} sx={{ color: theme.palette.text.secondary }}>
                    📈 Attendance Trend
                </Typography>
                <Chip
                    label={`Avg: ${Math.round(data.reduce((sum, d) => sum + d.rate, 0) / data.length)}%`}
                    size="small"
                    color="secondary"
                />
            </Box>
            <Box sx={{ height: { xs: 200, md: 250 }, color: theme.palette.text.secondary }}>
                <Line
                    ref={chartRef}
                    data={chartData}
                    options={options}
                />
            </Box>
        </Paper>
    );
};

export default DailyTrendCard;