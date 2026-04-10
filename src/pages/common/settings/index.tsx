import { Box, Typography } from "@mui/material";
import AppTabs from "../../../components/app-tabs/index";

import GeneralSettings from "./general-settings";
import SchoolSettings from "./school-settings";
import UserPermissions from "./user-permissions";

const Settings = () => {

    const tabs = [
        {
            label: "System Settings",
            component: <GeneralSettings />,
        },
        {
            label: "School",
            component: <SchoolSettings />,
        },
        {
            label: "Permissions",
            component: <UserPermissions />,
        },
    ];

    return (
        <Box sx={{ width: "100%", p: { xs: 2, md: 3 } }}>
            {/* <Typography variant="h5" sx={{ mb: 2 }}>
                Settings
            </Typography> */}

            <AppTabs tabs={tabs} />
        </Box>
    )

}

export default Settings;