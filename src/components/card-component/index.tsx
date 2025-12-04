import React from "react";
import { Card, CardContent, Typography, Box } from "@mui/material";
import PeopleIcon from "@mui/icons-material/People";
// import ReportIcon from "@mui/icons-material/Report";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { PersonOff } from "@mui/icons-material";
// import PersonAddIcon from "@mui/icons-material/PersonAdd";
// import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
// import WhatshotIcon from "@mui/icons-material/Whatshot";
// import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
// import ThumbUpIcon from "@mui/icons-material/ThumbUp";
// import BugReportIcon from "@mui/icons-material/BugReport";
// import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
// import QueryStatsIcon from "@mui/icons-material/QueryStats";
// import TimerIcon from "@mui/icons-material/Timer";
import { useTheme } from "@mui/material";

interface StatsCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon }) => {
    const theme = useTheme();
    return (
        <Card elevation={3} sx={{ display: 'flex', alignItems: 'center', p: 2, m: 1, bgcolor: theme.palette.background.default }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mr: 2 }}>
                {icon}
            </Box>
            <CardContent>
                <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
                    {title}
                </Typography>
                <Typography variant="h4" sx={{ color: theme.palette.text.secondary }}>
                    {value}
                </Typography>
            </CardContent>
        </Card>
    );
};

const DashboardStats: React.FC = () => {
    const statsData = [
        { title: "Total Users", value: 1200, icon: <PeopleIcon fontSize="large" color="primary" /> },
        { title: "Active Users", value: 850, icon: <CheckCircleIcon fontSize="large" color="success" /> },
        { title: "In Active Users", value: 850, icon: <PersonOff fontSize="large" color="error" /> },
        // { title: "New Users This Month", value: 150, icon: <PersonAddIcon fontSize="large" color="info" /> },
        // { title: "Reports Generated", value: 300, icon: <ReportIcon fontSize="large" color="secondary" /> },
        // { title: "Workouts Logged", value: 4500, icon: <FitnessCenterIcon fontSize="large" color="warning" /> },
        // { title: "Calories Tracked", value: 128000, icon: <WhatshotIcon fontSize="large" color="error" /> },
        // { title: "Meal Plans Created", value: 75, icon: <RestaurantMenuIcon fontSize="large" color="primary" /> },
        // { title: "Feedback Submitted", value: 120, icon: <ThumbUpIcon fontSize="large" color="success" /> },
        // { title: "Bugs Reported", value: 10, icon: <BugReportIcon fontSize="large" color="error" /> },
        // { title: "Revenue", value: "$10,000", icon: <AttachMoneyIcon fontSize="large" color="primary" /> },
        // { title: "Average Response Time", value: "200ms", icon: <TimerIcon fontSize="large" color="info" /> },
        // { title: "User Growth", value: "12%", icon: <QueryStatsIcon fontSize="large" color="success" /> },
    ];

    return (

        <Box
            sx={{
                maxHeight: "60vh",
                overflowY: "auto",
                p: 2,
                scrollbarWidth: "thin",
                "&::-webkit-scrollbar": {
                    width: "6px",
                },
                "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#888",
                    borderRadius: "10px",
                },
                "&::-webkit-scrollbar-thumb:hover": {
                    backgroundColor: "#555",
                },
                "&::-webkit-scrollbar-track": {
                    backgroundColor: "#f0f0f0",
                },
            }}
        >
            <Box display="grid"
                gridTemplateColumns={{
                    xs: "1fr",
                    sm: "1fr 1fr"
                }}
                gap={2}>
                {statsData.map((stat, index) => (
                    <StatsCard key={index} title={stat.title} value={stat.value} icon={stat.icon} />
                ))}
            </Box>
        </Box>
    );
};

export default DashboardStats;
