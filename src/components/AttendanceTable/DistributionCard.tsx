// pages/attendance/AttendanceDashboard/components/DistributionCard.tsx

import React from "react";
import { Paper, Box, Typography, useTheme } from "@mui/material";
import PieChart from "../../components/charts/pieCharts";

interface DistributionCardProps {
    present: number;
    absent: number;
    late: number;
    excused: number;
}

const DistributionCard: React.FC<DistributionCardProps> = ({ present, absent, late, excused }) => {
    const theme = useTheme();
    const total = present + absent + late + excused;

    const data = [
        { label: "Present", value: present, color: theme.palette.success.main },
        { label: "Absent", value: absent, color: theme.palette.error.main },
        // { label: "Late", value: late, color: theme.palette.warning.main },
        // { label: "Excused", value: excused, color: theme.palette.info.main },
    ];

    const filteredData = data.filter((d) => d.value > 0);
    const labels = filteredData.map((d) => d.label);
    const values = filteredData.map((d) => d.value);
    const colors = filteredData.map((d) => d.color);

    return (
        <Paper
            sx={{
                p: { xs: 2, sm: 2.5, md: 3 },
                borderRadius: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                bgcolor: theme.palette.background.default,
                minHeight: { xs: 280, sm: 300, md: 'auto' },
            }}
        >
            <Typography
                variant="h6"
                fontWeight={600}
                gutterBottom
                sx={{
                    textAlign: "center",
                    color: theme.palette.text.secondary,
                    fontSize: { xs: '1rem', sm: '1.15rem', md: '1.25rem' },
                }}
            >
                🎯 Today's Distribution
            </Typography>
            <Typography
                variant="caption"
                color="text.secondary"
                sx={{
                    mb: 1.5,
                    display: "block",
                    textAlign: "center",
                    fontSize: { xs: '0.7rem', sm: '0.75rem' },
                }}
            >
                Total: {total} students
            </Typography>

            {total === 0 ? (
                <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    sx={{ flex: 1, minHeight: 150 }}
                >
                    <Typography variant="body2" color="text.secondary">
                        No attendance data for today
                    </Typography>
                </Box>
            ) : (
                <Box
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        width: "100%",
                        maxHeight: { xs: 220, sm: 250, md: 280 },
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        py: { xs: 1, sm: 2 },
                    }}
                >
                    <Box sx={{
                        width: "100%",
                        height: "100%",
                        maxWidth: { xs: 280, sm: 320, md: 400 },
                    }}>
                        <PieChart
                            labels={labels}
                            data={values}
                            colors={colors}
                            showLegend={true}
                            showDataLabels={true}
                            height="100%"
                        />
                    </Box>
                </Box>
            )}
        </Paper>
    );
};

export default DistributionCard;