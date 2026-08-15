import React, { useEffect, useState } from "react";
import { Typography, Box, CircularProgress, Alert } from "@mui/material";
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
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return <Alert severity="error">{error}</Alert>;
    }

    const labels = ["Males", "Females"];
    const data = [
        counts?.numberOfMaleStudents ?? 0,
        counts?.numberOfFemaaleStudents ?? 0
    ];
    const colors = ["#42A5F5", "#FF6384"];

    const hasData = data[0] > 0 || data[1] > 0;

    return (
        <Box sx={{ p: 2 }}>
            <Typography
                variant="h2"
                sx={{
                    color: 'text.primary',
                    fontSize: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 3
                }}
            >
                Students Gender Distribution
            </Typography>

            {hasData ? (
                <PieChart
                    labels={labels}
                    data={data}
                    colors={colors}
                    showLegend={false}
                />
            ) : (
                <Typography variant="body1" align="center" color="text.secondary">
                    No student data available.
                </Typography>
            )}
        </Box>
    );
};

export default UserDistribution;