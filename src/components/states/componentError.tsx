import { Box, Typography, Button, Link } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useNavigate } from "react-router-dom";

interface ComponentErrorProps {
    title?: string;
    action?: string;
    message?: string;
    onRetry?: () => void;
    ticketUrl?: string;
}

const ComponentError = ({
    title,
    action,
    message,
    onRetry,
    ticketUrl
}: ComponentErrorProps) => {

    const navigate = useNavigate();

    const handleTicketClick = () => {
        if (ticketUrl) {
            navigate(ticketUrl);
        }
    };

    const defaultMessage =
        title && action
            ? `An error occurred while ${action} ${title}.`
            : "Failed to load data.";

    return (
        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            gap={1}
            p={2}
        >

            <ErrorOutlineIcon color="error" fontSize="large" />

            <Typography variant="body1" color="text.secondary">
                {message ?? defaultMessage}
            </Typography>

            {(onRetry || ticketUrl) && (
                <Typography variant="body1">

                    {onRetry && (
                        <Button
                            size="small"
                            onClick={onRetry}
                            sx={{ textTransform: "none" }}
                        >
                            Try Again
                        </Button>
                    )}

                    {ticketUrl && (
                        <>
                            {" "}or{" "}
                            <Link
                                component="button"
                                underline="hover"
                                onClick={handleTicketClick}
                            >
                                submit a ticket
                            </Link>
                            for assistance
                        </>
                    )}



                </Typography>
            )}

        </Box>
    );
};

export default ComponentError;