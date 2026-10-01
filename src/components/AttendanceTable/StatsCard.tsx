// pages/attendance/AttendanceDashboard/components/StatsCard.tsx

import React from "react";
import { Card, Box, Typography, Avatar, useTheme, alpha } from "@mui/material";
import { ArrowUpward as ArrowUpwardIcon, ArrowDownward as ArrowDownwardIcon } from "@mui/icons-material";

interface StatsCardProps {
    title: string;
    value: number | string;
    subtitle?: string;
    icon: React.ReactNode;
    trend?: number;
    trendLabel?: string;
    color?: "primary" | "success" | "error" | "warning" | "info";
    dateRange?: string;
    footerText?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({
    title,
    value,
    subtitle,
    icon,
    trend,
    trendLabel,
    color = "primary",
    dateRange,
    footerText,
}) => {
    const theme = useTheme();

    const getColor = () => {
        switch (color) {
            case "success":
                return theme.palette.success.main;
            case "error":
                return theme.palette.error.main;
            case "warning":
                return theme.palette.warning.main;
            case "info":
                return theme.palette.info.main;
            default:
                return theme.palette.primary.main;
        }
    };

    const trendColor = trend && trend > 0 ? theme.palette.success.main : theme.palette.error.main;
    const TrendIcon = trend && trend > 0 ? ArrowUpwardIcon : ArrowDownwardIcon;

    return (
        <Card
            elevation={2}
            sx={{
                p: { xs: 1.5, sm: 2 },
                height: "100%",
                borderRadius: 2,
                border: `1px solid ${alpha(getColor(), 0.15)}`,
                bgcolor: alpha(getColor(), 0.03),
                transition: "all 0.3s ease",
                "&:hover": {
                    boxShadow: 6,
                    transform: "translateY(-2px)",
                },
            }}
        >
            <Box display="flex" alignItems="flex-start" justifyContent="space-between">
                <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={500}
                        sx={{
                            fontSize: { xs: '0.65rem', sm: '0.75rem' },
                            display: 'block',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                        }}
                    >
                        {title}
                        {dateRange && (
                            <Typography
                                component="span"
                                variant="caption"
                                sx={{
                                    ml: 1,
                                    color: theme.palette.primary.main,
                                    fontWeight: 600,
                                }}
                            >
                                ({dateRange})
                            </Typography>
                        )}
                    </Typography>
                    <Typography
                        variant="h4"
                        fontWeight={700}
                        sx={{
                            mt: 0.5,
                            fontSize: { xs: '1.5rem', sm: '2rem', md: '2.125rem' },
                        }}
                    >
                        {value}
                    </Typography>
                    {subtitle && (
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                fontSize: { xs: '0.6rem', sm: '0.7rem' },
                                display: 'block',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                            }}
                        >
                            {subtitle}
                        </Typography>
                    )}
                    {footerText && (
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            sx={{
                                fontSize: { xs: '0.5rem', sm: '0.65rem' },
                                display: 'block',
                                mt: 0.5,
                                opacity: 0.8,
                            }}
                        >
                            {footerText}
                        </Typography>
                    )}
                    {trend !== undefined && (
                        <Box display="flex" alignItems="center" gap={0.5} sx={{ mt: 0.5 }}>
                            <TrendIcon sx={{ fontSize: { xs: 12, sm: 14 }, color: trendColor }} />
                            <Typography
                                variant="caption"
                                sx={{
                                    color: trendColor,
                                    fontWeight: 600,
                                    fontSize: { xs: '0.6rem', sm: '0.75rem' },
                                }}
                            >
                                {trend > 0 ? "+" : ""}{trend}%
                            </Typography>
                            {trendLabel && (
                                <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{
                                        fontSize: { xs: '0.5rem', sm: '0.7rem' },
                                        display: { xs: 'none', sm: 'inline' },
                                    }}
                                >
                                    {trendLabel}
                                </Typography>
                            )}
                        </Box>
                    )}
                </Box>
                <Avatar
                    sx={{
                        bgcolor: alpha(getColor(), 0.15),
                        color: getColor(),
                        width: { xs: 36, sm: 40, md: 48 },
                        height: { xs: 36, sm: 40, md: 48 },
                        flexShrink: 0,
                        ml: 1,
                    }}
                >
                    {icon}
                </Avatar>
            </Box>
        </Card>
    );
};

export default StatsCard;