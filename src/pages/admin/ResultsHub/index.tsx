import React from "react";
import {
    Box,
    Card,
    CardContent,
    Stack,
    Typography,
    Avatar,
    Button,
    useMediaQuery,
    useTheme,
    Chip,
    alpha,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import VisibilityIcon from "@mui/icons-material/Visibility";
import PrintIcon from "@mui/icons-material/Print";
import PublishIcon from "@mui/icons-material/Publish";
import AssessmentIcon from "@mui/icons-material/Assessment";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

interface WorkflowCardProps {
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    buttonLabel: string;
    onClick: () => void;
}

const WorkflowCard: React.FC<WorkflowCardProps> = ({
    title,
    description,
    icon,
    color,
    buttonLabel,
    onClick,
}) => {
    const theme = useTheme();

    return (
        <Card
            elevation={0}
            onClick={onClick}
            sx={{
                position: "relative",
                borderRadius: 3,
                border: "1px solid",
                borderColor: "divider",
                backgroundColor: theme.palette.background.default,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                overflow: "hidden",
                cursor: "pointer",
                transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
                "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: `0 12px 24px ${alpha(color, 0.15)}`,
                    borderColor: alpha(color, 0.4),
                    "& .workflow-arrow": {
                        transform: "translateX(4px)",
                    },
                    "& .workflow-icon-bg": {
                        transform: "scale(1.05)",
                    },
                },
                "&::before": {
                    content: '""',
                    position: "absolute",
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    backgroundColor: color,
                    borderTopLeftRadius: 12,
                    borderTopRightRadius: 12,
                },
            }}
        >
            <CardContent
                sx={{
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 2.5,
                    p: { xs: 2.5, sm: 3 },
                    pt: { xs: 3, sm: 3.5 },
                }}
            >
                {/* Icon */}
                <Avatar
                    className="workflow-icon-bg"
                    sx={{
                        bgcolor: alpha(color, 0.12),
                        color: color,
                        width: 56,
                        height: 56,
                        transition: "transform 0.2s ease",
                        "& svg": {
                            fontSize: 28,
                        },
                    }}
                >
                    {icon}
                </Avatar>

                {/* Text */}
                <Box>
                    <Typography
                        variant="h6"
                        fontWeight={700}
                        gutterBottom
                        sx={{
                            color: "text.primary",
                            fontSize: { xs: "1.05rem", sm: "1.15rem" },
                            lineHeight: 1.3,
                        }}
                    >
                        {title}
                    </Typography>
                    <Typography
                        variant="body2"
                        sx={{
                            color: "text.secondary",
                            lineHeight: 1.55,
                        }}
                    >
                        {description}
                    </Typography>
                </Box>

                {/* Spacer */}
                <Box sx={{ flex: 1 }} />

                {/* Button */}
                <Button
                    variant="text"
                    endIcon={
                        <ArrowForwardIcon
                            className="workflow-arrow"
                            sx={{
                                transition: "transform 0.2s ease",
                                fontSize: 18,
                            }}
                        />
                    }
                    sx={{
                        alignSelf: "flex-start",
                        textTransform: "none",
                        borderRadius: 2,
                        fontWeight: 700,
                        fontSize: "0.875rem",
                        color: color,
                        px: 1.5,
                        py: 0.75,
                        ml: -1.5,
                        "&:hover": {
                            backgroundColor: alpha(color, 0.08),
                        },
                    }}
                >
                    {buttonLabel}
                </Button>
            </CardContent>
        </Card>
    );
};

const ResultsHub: React.FC = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
    const navigate = useNavigate();

    const workflows: WorkflowCardProps[] = [
        {
            title: "View Class Results",
            description:
                "See every student's results for a class — conduct, position, and remarks included.",
            icon: <VisibilityIcon />,
            color: "#2874a6",
            buttonLabel: "View Results",
            onClick: () => navigate("/app/results-hub/classes"),
        },
        {
            title: "Print Report Cards",
            description:
                "Batch-generate PDFs for all students in a class, ready to print or email.",
            icon: <PrintIcon />,
            color: "#148f77",
            buttonLabel: "Print Cards",
            onClick: () => navigate("/app/results-hub/print-report-cards"),
        },
        {
            title: "Publish Results",
            description:
                "Make results visible to parents and students in their portal.",
            icon: <PublishIcon />,
            color: "#b9770e",
            buttonLabel: "Publish Results",
            onClick: () => navigate("/app/results-hub/publish-results"),
        },
    ];

    return (
        <Box
            sx={{
                width: "100%",
                minHeight: "100%",
                backgroundColor: theme.palette.background.default,
                px: { xs: 2, sm: 3, md: 4 },
                py: { xs: 3, sm: 4 },
            }}
        >
            {/* ---------- Header Banner ---------- */}
            <Card
                elevation={0}
                sx={{
                    mb: { xs: 3, sm: 4 },
                    borderRadius: 3,
                    position: "relative",
                    overflow: "hidden",
                    background: theme.palette.background.default,
                    color: theme.palette.text.secondary,
                }}
            >
                {/* decorative circles */}
                <Box
                    sx={{
                        position: "absolute",
                        top: -40,
                        right: -40,
                        width: 180,
                        height: 180,
                        borderRadius: "50%",
                        backgroundColor: "rgba(255,255,255,0.06)",
                        pointerEvents: "none",
                    }}
                />
                <Box
                    sx={{
                        position: "absolute",
                        bottom: -60,
                        right: 60,
                        width: 140,
                        height: 140,
                        borderRadius: "50%",
                        backgroundColor: "rgba(255,255,255,0.04)",
                        pointerEvents: "none",
                    }}
                />

                <CardContent sx={{ position: "relative", zIndex: 1 }}>
                    <Stack
                        direction={isMobile ? "column" : "row"}
                        spacing={2}
                        alignItems={isMobile ? "flex-start" : "center"}
                        justifyContent="space-between"
                    >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                            <Avatar
                                sx={{
                                    bgcolor: theme.palette.background.paper,
                                    width: 48,
                                    height: 48,
                                    backdropFilter: "blur(8px)",
                                }}
                            >
                                <AssessmentIcon />
                            </Avatar>
                            <Box>
                                <Typography
                                    variant="h6"
                                    fontWeight={700}
                                    sx={{ fontSize: { xs: "1.1rem", sm: "1.25rem" } }}
                                >
                                    Results
                                </Typography>
                                <Typography
                                    variant="body2"
                                    sx={{ opacity: 0.9, fontSize: { xs: "0.8rem", sm: "0.875rem" } }}
                                >
                                    Review, print, and publish student results
                                </Typography>
                            </Box>
                        </Stack>

                        <Chip
                            label="2025/2026 · 2nd Term"
                            sx={{
                                bgcolor: "rgba(255,255,255,0.2)",
                                color: "inherit",
                                fontWeight: 600,
                                backdropFilter: "blur(8px)",
                                border: "1px solid rgba(255,255,255,0.15)",
                            }}
                        />
                    </Stack>
                </CardContent>
            </Card>

            {/* ---------- Section Heading ---------- */}
            <Box sx={{ mb: 2.5 }}>
                <Typography
                    variant="h6"
                    fontWeight={700}
                    sx={{
                        color: "text.primary",
                        fontSize: { xs: "1rem", sm: "1.1rem" },
                    }}
                >
                    What would you like to do?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Choose a workflow to get started
                </Typography>
            </Box>

            {/* ---------- Workflow Cards ---------- */}
            <Box
                sx={{
                    display: "grid",
                    gridTemplateColumns: {
                        xs: "1fr",
                        sm: "1fr 1fr",
                        md: "1fr 1fr 1fr",
                    },
                    gap: { xs: 2, sm: 2.5 },
                }}
            >
                {workflows.map((w) => (
                    <WorkflowCard key={w.title} {...w} />
                ))}
            </Box>
        </Box>
    );
};

export default ResultsHub;