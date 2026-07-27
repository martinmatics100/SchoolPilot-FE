import { Box, Typography } from "@mui/material";
import AppTabs from "../../../components/app-tabs/index";

import GeneralSettings from "./general-settings";
import AppearanceSettings from "./apperance";
import CurrentUserProfile from "./profile";
import BillingSettings from "./billing";
import NotificationsSettings from "./notification";

const Settings = () => {

    const tabs = [
        {
            label: "Profile",
            component: <CurrentUserProfile />,
        },
        {
            label: "System Settings",
            component: <GeneralSettings />,
        },
        {
            label: "Appearance",
            component: <AppearanceSettings />,
        },
        // {
        //     label: "Notifications",
        //     component: <NotificationsSettings />,
        // },
        {
            label: "Billing & Subscription",
            component: <BillingSettings />,
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