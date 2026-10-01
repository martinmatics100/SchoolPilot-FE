// components/distributions/gender-distribution.tsx

import React, { useEffect, useState } from "react";
import { Typography, Box, CircularProgress, Alert, Paper } from "@mui/material";
import PieChart from "../charts/pieCharts";
import { accountService } from "../../api/accountService";
import { type DashboardCountsResponse } from "../../types/interfaces/i-dashboard";
import { useTheme } from "@mui/material";

const UserDistribution: React.FC = () => {
    const theme = useTheme();
    const [counts, setCounts] = useState<DashboardCountsResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await accountService.getDashboardCounts();
                setCounts(response);
            } catch (err) {
                setError("Could not load distribution data.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 5, minHeight: 300 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box sx={{ p: 2 }}>
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    const labels = ["Males", "Females"];
    const data = [
        counts?.numberOfMaleStudents ?? 0,
        counts?.numberOfFemaaleStudents ?? 0
    ];
    const colors = ["#42A5F5", "#FF6384"];

    const hasData = data[0] > 0 || data[1] > 0;

    return (
        <Paper
            sx={{
                p: 2,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                borderRadius: 2,
                overflow: "hidden",
                bgcolor: theme.palette.background.default,
            }}
        >
            <Typography
                variant="h6"
                sx={{
                    color: 'text.primary',
                    fontWeight: 600,
                    textAlign: 'center',
                    mb: 2,
                }}
            >
                Students Gender Distribution
            </Typography>

            {hasData ? (
                <Box
                    sx={{
                        flex: 1,
                        minHeight: 0,
                        width: "100%",
                        maxHeight: { xs: 250, md: 300 },
                        position: "relative",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <Box sx={{ width: "100%", height: "100%", maxWidth: 350 }}>
                        <PieChart
                            labels={labels}
                            data={data}
                            colors={colors}
                            showLegend={false}
                            showDataLabels={true}
                            height="100%"
                        />
                    </Box>
                </Box>
            ) : (
                    <Box
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        sx={{ flex: 1, minHeight: 200 }}
                    >
                        <Typography variant="body2" color="text.secondary" align="center">
                            No student data available.
                        </Typography>
                    </Box>
            )}
        </Paper>
    );
};

export default UserDistribution;