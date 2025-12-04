import React from "react";
import { Box, Typography, Paper } from "@mui/material";
import ToggleSettingItem from ".";
import { useTheme } from "@mui/material";

export interface SettingItem {
    key: string;
    label: string;
    value: boolean;
}

export interface ToggleSettingGroupProps {
    title: string;
    settings: SettingItem[];
    onChange: (updated: SettingItem[]) => void;
}

const ToggleSettingGroup: React.FC<ToggleSettingGroupProps> = ({
    title,
    settings,
    onChange,
}) => {

    const handleToggle = (key: string, newValue: boolean) => {
        const updated = settings.map((item) =>
            item.key === key ? { ...item, value: newValue } : item
        );
        onChange(updated);
    };

    const theme = useTheme()

    return (
        <Paper sx={{ p: 2, mb: 3, bgcolor: theme.palette.background.default }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                {title}
            </Typography>

            {settings.map((item) => (
                <ToggleSettingItem
                    key={item.key}
                    label={item.label}
                    checked={item.value}
                    onChange={(val) => handleToggle(item.key, val)}
                />
            ))}
        </Paper>
    );
};

export default ToggleSettingGroup;
