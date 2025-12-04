import React from "react";
import { Box, Typography, Switch } from "@mui/material";
import { useTheme } from "@mui/material";

export interface ToggleSettingItemProps {
    label: string;
    checked: boolean;
    onChange: (value: boolean) => void;
}

const ToggleSettingItem: React.FC<ToggleSettingItemProps> = ({
    label,
    checked,
    onChange,
}) => {

    const theme = useTheme()
    return (
        <Box
            sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 1,
                borderBottom: `1px solid ${theme.palette.text.primary}`,
            }}
        >
            <Typography variant="body1" sx={{ color: theme.palette.text.secondary }}>{label}</Typography>

            <Switch
                checked={checked}
                onChange={(e) => onChange(e.target.checked)}
                color="primary"
                sx={{ color: theme.palette.text.secondary }}
            />
        </Box>
    );
};

export default ToggleSettingItem;
