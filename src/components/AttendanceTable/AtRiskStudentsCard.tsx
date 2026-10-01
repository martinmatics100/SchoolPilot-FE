// pages/attendance/AttendanceDashboard/components/AtRiskStudentsCard.tsx

import React from "react";
import {
    Paper,
    Box,
    Typography,
    Avatar,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Divider,
    Chip,
    useTheme,
    alpha,
} from "@mui/material";
import { type StudentAttendance } from "../../types/interfaces/i-attendance";

interface AtRiskStudentsCardProps {
    students: StudentAttendance[];
}

const AtRiskStudentsCard: React.FC<AtRiskStudentsCardProps> = ({ students }) => {
    const theme = useTheme();

    const getStatusColor = (status: string) => {
        switch (status) {
            case "danger":
                return theme.palette.error.main;
            case "warning":
                return theme.palette.warning.main;
            default:
                return theme.palette.success.main;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "danger":
                return "Critical";
            case "warning":
                return "Warning";
            default:
                return "Good";
        }
    };

    return (
        <Paper sx={{
            p: { xs: 2, sm: 2.5, md: 3 },
            borderRadius: 2,
            height: "100%",
            bgcolor: theme.palette.background.default,
            minHeight: { xs: 300, sm: 320, md: 'auto' },
        }}>
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
                ⚠️ Students at Risk
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
                Students with attendance below 70%
            </Typography>

            {students.length === 0 ? (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight={150}>
                    <Typography variant="body2" color="text.secondary">
                        No students at risk 🎉
                    </Typography>
                </Box>
            ) : (
                <List sx={{ maxHeight: { xs: 200, sm: 250, md: 300 }, overflow: "auto" }}>
                    {students.map((student, index) => (
                        <React.Fragment key={student.id}>
                            <ListItem
                                sx={{
                                    px: 0,
                                    py: { xs: 0.5, sm: 1 },
                                    flexDirection: { xs: "column", sm: "row" },
                                    alignItems: { xs: "flex-start", sm: "center" },
                                    gap: { xs: 0.5, sm: 0 },
                                }}
                            >
                                <ListItemAvatar>
                                    <Avatar
                                        sx={{
                                            bgcolor: alpha(getStatusColor(student.status), 0.15),
                                            color: getStatusColor(student.status),
                                            width: { xs: 32, sm: 36, md: 40 },
                                            height: { xs: 32, sm: 36, md: 40 },
                                        }}
                                    >
                                        {student.name.charAt(0)}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography
                                            variant="body2"
                                            fontWeight={500}
                                            sx={{ fontSize: { xs: '0.8rem', sm: '0.875rem' } }}
                                        >
                                            {student.name}
                                        </Typography>
                                    }
                                    secondary={
                                        <Typography
                                            variant="caption"
                                            color="text.secondary"
                                            sx={{ fontSize: { xs: '0.6rem', sm: '0.7rem' } }}
                                        >
                                            {student.class} • ID: {student.studentId}
                                        </Typography>
                                    }
                                    sx={{ flex: 1 }}
                                />
                                <Box
                                    display="flex"
                                    alignItems="center"
                                    gap={0.5}
                                    sx={{
                                        width: { xs: "100%", sm: "auto" },
                                        mt: { xs: 0.5, sm: 0 },
                                    }}
                                >
                                    <Chip
                                        label={`${student.rate}%`}
                                        size="small"
                                        sx={{
                                            bgcolor: alpha(getStatusColor(student.status), 0.15),
                                            color: getStatusColor(student.status),
                                            fontWeight: 600,
                                            height: { xs: 20, sm: 24 },
                                            fontSize: { xs: '0.6rem', sm: '0.7rem' },
                                        }}
                                    />
                                    <Chip
                                        label={getStatusLabel(student.status)}
                                        size="small"
                                        sx={{
                                            bgcolor: alpha(getStatusColor(student.status), 0.1),
                                            color: getStatusColor(student.status),
                                            height: { xs: 20, sm: 24 },
                                            fontSize: { xs: '0.6rem', sm: '0.7rem' },
                                        }}
                                    />
                                </Box>
                            </ListItem>
                            {index < students.length - 1 && <Divider />}
                        </React.Fragment>
                    ))}
                </List>
            )}
        </Paper>
    );
};

export default AtRiskStudentsCard;