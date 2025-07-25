import React from 'react';
import { useNavigate } from 'react-router-dom';
import IconButton from '@mui/material/IconButton';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Tooltip from '@mui/material/Tooltip';

interface BackButtonProps {
    /**
     * Custom click handler (optional)
     * If not provided, will use default navigate(-1) behavior
     */
    onClick?: () => void;
    /**
     * Tooltip text (optional)
     * @default 'Go back'
     */
    tooltip?: string;
    /**
     * Custom styles (optional)
     */
    sx?: object;
}

const BackButton: React.FC<BackButtonProps> = ({
    onClick,
    tooltip = 'Go back',
    sx = {}
}) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (onClick) {
            onClick();
        } else {
            navigate(-1); // Default behavior
        }
    };

    return (
        <Tooltip title={tooltip} arrow>
            <IconButton
                onClick={handleClick}
                sx={{
                    marginRight: 2,
                    '&:hover': {
                        backgroundColor: 'action.hover'
                    },
                    ...sx
                }}
                aria-label="back"
            >
                <ArrowBackIcon />
            </IconButton>
        </Tooltip>
    );
};

export default BackButton;