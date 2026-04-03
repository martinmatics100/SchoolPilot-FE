import { Box, Typography, Button, Link } from "@mui/material";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import { useNavigate } from "react-router-dom";

interface PageErrorProps {
    title: string;
    action: string;
    onRetry?: () => void;
    ticketUrl?: string;
}

const PageError = ({ title, action, onRetry, ticketUrl }: PageErrorProps) => {

    const navigate = useNavigate();

    const handleTicketClick = () => {
        if (ticketUrl) {
            navigate(ticketUrl);
        }
    };

    return (

        <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            textAlign="center"
            minHeight="60vh"
            gap={2}
        >

            <ErrorOutlineIcon color="error" sx={{ fontSize: 100 }} />

            <Typography variant="h5">
                Something went wrong
            </Typography>

            <Typography color="text.secondary">

                An error occurred while {action} {title}. <br />

                Please try again or{" "}

                {ticketUrl && (
                    <Link
                        component="button"
                        onClick={handleTicketClick}
                        underline="hover"
                        sx={{ color: "lightblue" }}
                    >
                        submit a ticket
                    </Link>
                )}
                <span>for assitance</span>

            </Typography>

            {onRetry && (
                <Button
                    variant="contained"
                    onClick={onRetry}
                >
                    Try Again
                </Button>
            )}

        </Box>

    );
};

export default PageError;