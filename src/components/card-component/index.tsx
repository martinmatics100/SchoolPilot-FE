import React, { useEffect, useState } from "react";
import { 
    Card, 
    CardContent, 
    Typography, 
    Box, 
    CircularProgress, 
    Alert, 
    useTheme 
} from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { PersonOff } from "@mui/icons-material";
import SchoolIcon from "@mui/icons-material/School"; // Good icon for Teachers

import { accountService } from "../../api/accountService";
import { type DashboardCountsResponse } from "../../types/interfaces/i-dashboard";

interface StatsCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon }) => {
    const theme = useTheme();
    return (
        <Card elevation={3} sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            p: 2, 
            m: 1, 
            bgcolor: theme.palette.background.default,
            borderRadius: 2 
        }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                {icon}
            </Box>
            <CardContent sx={{ p: '0 !important' }}> {/* Remove default padding */}
                <Typography variant="body2" sx={{ color: theme.palette.text.secondary, fontWeight: 600, fontSize: "1rem" }}>
                    {title}
                </Typography>
                <Typography variant="h4" sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
};

const DashboardStats: React.FC = () => {
    const [data, setData] = useState<DashboardCountsResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                const response = await accountService.getDashboardCounts();
                setData(response);
                setError(null);
            } catch (err: any) {
                console.error("Dashboard fetch error:", err);
                setError("Failed to load dashboard statistics.");
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
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

    // Define the stats structure based on the real data from the backend
    const statsData = [
        { 
            title: "Active Students", 
            value: data?.activeStudentCount ?? 0, 
            icon: <PeopleIcon fontSize="large" color="primary" /> 
        },
        { 
            title: "Active Teachers", 
            value: data?.activeTeacherCount ?? 0, 
            icon: <SchoolIcon fontSize="large" color="success" /> 
        },
        // You can add more mappings here as the backend expands
        // { 
        //    title: "Status Code", 
        //    value: data?.status ?? "-", 
        //    icon: <CheckCircleIcon fontSize="large" color="info" /> 
        // }
    ];

    return (
        <Box
            sx={{
                maxHeight: "60vh",
                overflowY: "auto",
                p: 2,
                scrollbarWidth: "thin",
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#888",
                    borderRadius: "10px",
                },
                "&::-webkit-scrollbar-track": { backgroundColor: "#f0f0f0" },
            }}
        >
            <Box 
                display="grid"
                gridTemplateColumns={{
                    xs: "1fr",
                    sm: "1fr 1fr"
                }}
                gap={1}
            >
                {statsData.map((stat, index) => (
                    <StatsCard 
                        key={index} 
                        title={stat.title} 
                        value={stat.value} 
                        icon={stat.icon} 
                    />
                ))}
            </Box>
        </Box>
    );
};

export default DashboardStats;