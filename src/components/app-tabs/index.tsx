import React from "react";
import { Tabs, Tab, Box } from "@mui/material";

interface TabItem {
    label: string;
    component: React.ReactNode;
}

interface AppTabsProps {
    tabs: TabItem[];
}

const AppTabs: React.FC<AppTabsProps> = ({ tabs }) => {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, newValue: number) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: "100%" }}>
            {/* Tabs header */}
            <Box
                sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    overflowX: "auto",
                }}
            >
                <Tabs
                    value={value}
                    onChange={handleChange}
                    variant="scrollable"
                    scrollButtons="auto"
                >
                    {tabs.map((tab, index) => (
                        <Tab key={index} label={tab.label} />
                    ))}
                </Tabs>
            </Box>

            {/* Tab Content */}
            <Box sx={{ mt: 2 }}>
                {tabs.map((tab, index) => (
                    <div key={index} hidden={value !== index}>
                        {value === index && tab.component}
                    </div>
                ))}
            </Box>
        </Box>
    );
};

export default AppTabs;