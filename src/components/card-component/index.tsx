import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    Typography,
    Box,
    CircularProgress,
    useTheme,
    FormControl,
    Select,
    MenuItem
} from "@mui/material";

import PeopleIcon from "@mui/icons-material/People";
import SchoolIcon from "@mui/icons-material/School";

import { accountService } from "../../api/accountService";
import { type DashboardCountsResponse } from "../../types/interfaces/i-dashboard";
import ComponentError from "../../components/states/componentError";

interface FilterOption {
    label: string;
    value: string;
}

interface StatsCardProps {
    title: string;
    value: number | string;
    icon: React.ReactNode;
    filterOptions?: FilterOption[];
    selectedFilter?: string;
    onFilterChange?: (value: string) => void;
}

const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    icon,
    filterOptions,
    selectedFilter,
    onFilterChange
}) => {

    const theme = useTheme();

    return (
        <Card
            elevation={3}
            sx={{
                display: "flex",
                alignItems: "center",
                p: 2,
                m: 1,
                bgcolor: theme.palette.background.default,
                borderRadius: 2,
                position: "relative"
            }}
        >

            {filterOptions && (
                <Box
                    sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        minWidth: 90
                    }}
                >
                    <FormControl size="small" fullWidth>
                        <Select
                            value={selectedFilter}
                            onChange={(e) => onFilterChange?.(e.target.value)}
                        >
                            {filterOptions.map((option) => (
                                <MenuItem key={option.value} value={option.value}>
                                    {option.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            )}

            <Box
                sx={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    mr: 2
                }}
            >
                {icon}
            </Box>

            <CardContent sx={{ p: "0 !important" }}>

                <Typography
                    variant="body2"
                    sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: 600,
                        fontSize: "1rem"
                    }}
                >
                    {title}
                </Typography>

                <Typography
                    variant="h4"
                    sx={{
                        color: theme.palette.text.primary,
                        fontWeight: "bold"
                    }}
                >
                    {value}
                </Typography>

            </CardContent>

        </Card>
    );
};

const DashboardStats: React.FC = () => {

    const [data, setData] = useState<DashboardCountsResponse | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<boolean>(false);

    const [selectedClass, setSelectedClass] = useState("all");

    const subjectCounts: Record<string, number> = {
        all: 18,
        jss1: 12,
        jss2: 11,
        sss1: 10
    };

    const classOptions: FilterOption[] = [
        { label: "All", value: "all" },
        { label: "JSS1", value: "jss1" },
        { label: "JSS2", value: "jss2" },
        { label: "SSS1", value: "sss1" }
    ];

    const fetchDashboardData = async () => {

        try {

            setLoading(true);
            setError(false);

            const response = await accountService.getDashboardCounts();

            setData(response);

        } catch (err) {

            console.error("Dashboard fetch error:", err);
            setError(true);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        fetchDashboardData();

    }, []);

    if (loading) {

        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "200px"
                }}
            >
                <CircularProgress />
            </Box>
        );

    }

    if (error) {

        return (
            <ComponentError
                title="dashboard statistics"
                action="loading"
                onRetry={fetchDashboardData}
                ticketUrl="/support"
            />
        );

    }

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

        {
            title: "Total Subjects",
            value: subjectCounts[selectedClass],
            icon: <SchoolIcon fontSize="large" color="warning" />,
            filterOptions: classOptions,
            selectedFilter: selectedClass,
            onFilterChange: setSelectedClass
        }

    ];

    return (

        <Box
            sx={{
                maxHeight: "50vh",
                overflowY: "auto",
                p: 2,
                scrollbarWidth: "thin",
                "&::-webkit-scrollbar": { width: "6px" },
                "&::-webkit-scrollbar-thumb": {
                    backgroundColor: "#888",
                    borderRadius: "10px"
                },
                "&::-webkit-scrollbar-track": {
                    backgroundColor: "#f0f0f0"
                }
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
                        filterOptions={(stat as any).filterOptions}
                        selectedFilter={(stat as any).selectedFilter}
                        onFilterChange={(stat as any).onFilterChange}
                    />

                ))}

            </Box>

        </Box>

    );
};

export default DashboardStats;