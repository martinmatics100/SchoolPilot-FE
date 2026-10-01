// pages/attendance/AttendanceDashboard/components/ClassPerformanceCard.tsx

import React from "react";
import { Paper, Box, Typography, useTheme } from "@mui/material";
import BarChart from "../../components/charts/barchart";
import { type ClassAttendance } from "../../types/interfaces/i-attendance";

interface ClassPerformanceCardProps {
    data: ClassAttendance[];
}

const ClassPerformanceCard: React.FC<ClassPerformanceCardProps> = ({ data }) => {
    const theme = useTheme();

    const sortedData = [...data].sort((a, b) => b.rate - a.rate);

    const labels = sortedData.map((d) => d.className);
    const values = sortedData.map((d) => d.rate);
    const colors = sortedData.map((d) =>
        d.rate >= 85
            ? theme.palette.success.main
            : d.rate >= 75
                ? theme.palette.warning.main
                : theme.palette.error.main
    );

    return (
        <Paper sx={{
            p: { xs: 2, sm: 2.5, md: 3 },
            borderRadius: 2,
            height: "100%",
            bgcolor: theme.palette.background.default,
            minHeight: { xs: 280, sm: 300, md: 'auto' },
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
        }}>
            <Typography
                variant="h6"
                fontWeight={600}
                gutterBottom
                sx={{
                    textAlign: "center",
                    color: theme.palette.text.secondary,
                    fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' },
                    flexShrink: 0,
                }}
            >
                📊 Class Performance
            </Typography>
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                    mb: 1.5,
                    display: "block",
                    textAlign: "center",
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    flexShrink: 0,
                }}
            >
                Attendance rate by class
            </Typography>

            {/* Scrollable chart container */}
            <Box sx={{
                flex: 1,
                minHeight: 0,
                width: '100%',
                overflowX: 'auto',
                overflowY: 'hidden',
                position: 'relative',
                // Custom scrollbar styling
                '&::-webkit-scrollbar': {
                    height: '8px',
                },
                '&::-webkit-scrollbar-track': {
                    background: theme.palette.background.paper,
                    borderRadius: '4px',
                },
                // '&::-webkit-scrollbar-thumb': {
                //     background: alpha(theme.palette.primary.main, 0.3),
                //     borderRadius: '4px',
                //     '&:hover': {
                //         background: alpha(theme.palette.primary.main, 0.5),
                //     },
                // },
            }}>
                <Box sx={{
                    height: { xs: 200, sm: 220, md: 280 },
                    minWidth: labels.length > 6 ? `${labels.length * 80}px` : '100%',
                    width: labels.length > 6 ? `${labels.length * 80}px` : '100%',
                    maxWidth: '100%',
                }}>
                    <BarChart
                        labels={labels}
                        data={values}
                        colors={colors}
                        height="100%"
                    />
                </Box>
            </Box>
        </Paper>
    );
};

export default ClassPerformanceCard;