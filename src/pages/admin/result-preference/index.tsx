import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import ToggleSettingGroup, { type SettingItem } from "../../../components/toggle-settingItem/toggle-group";

const SettingsPage: React.FC = () => {
    const [schoolInfoSettings, setSchoolInfoSettings] = useState<SettingItem[]>([
        { key: "motto", label: "Display School Motto", value: true },
        { key: "mission", label: "Display School Mission Statement", value: true },
        { key: "vision", label: "Display School Vision Statement", value: true },
        { key: "coreValues", label: "Display School Core Values", value: false },
    ]);

    const [bioSettings, setBioSettings] = useState<SettingItem[]>([
        { key: "passport", label: "Student Passport Photo", value: true },
        { key: "gender", label: "Display Student Gender", value: true },
        { key: "age", label: "Display Student Age", value: true },
        { key: "dob", label: "Display Student Date of Birth", value: true },
    ]);

    const [performanceSettings, setPerformanceSettings] = useState<SettingItem[]>([
        { key: "position", label: "Student Performance Position", value: true },
        { key: "classSize", label: "Number of Students in Class", value: true },
        { key: "gpa", label: "Grade Point Average", value: true },
    ]);

    const [feesSettings, setFeesSettings] = useState<SettingItem[]>([
        { key: "nextTermFees", label: "Next Term Fees info", value: true },
        { key: "unpaidFees", label: "This term Student Unpaid Fees Info", value: true },
    ]);

    const handleSave = () => {
        const payload = {
            schoolInfo: schoolInfoSettings,
            bioData: bioSettings,
            performance: performanceSettings,
        };

        console.log("Saving settings:", payload);
        alert("Settings saved!");
        // axios.post("/api/report-settings", payload)
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ mb: 3 }}>
                Report Sheet Preferences
            </Typography>

            <ToggleSettingGroup
                title="School Information"
                settings={schoolInfoSettings}
                onChange={setSchoolInfoSettings}
            />

            <ToggleSettingGroup
                title="Student Bio Data"
                settings={bioSettings}
                onChange={setBioSettings}
            />

            <ToggleSettingGroup
                title="Performance Summary"
                settings={performanceSettings}
                onChange={setPerformanceSettings}
            />

            <ToggleSettingGroup
                title="Fees Info"
                settings={feesSettings}
                onChange={setFeesSettings}
            />

            <Button variant="contained" color="primary" onClick={handleSave}>
                Save Settings
            </Button>
        </Box>
    );
};

export default SettingsPage;
