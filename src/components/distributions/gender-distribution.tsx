import React from "react";
import Typography from "@mui/material/Typography";
import PieChart from "../charts/pieCharts";

const UserDistribution: React.FC = () => {
    const labels = ["Males", "Females", "Love"];
    const data = [850, 650];
    const colors = ["#42A5F5", "#FF6384"];

    return (
        <div>
            <Typography variant="h2" sx={{ color: 'common.white', fontSize: 30, display: 'flex', alignItem: 'center', justifyContent: 'center', marginBottom: 5 }}>
                Gender Distribution
            </Typography>
            <PieChart labels={labels} data={data} colors={colors} showLegend={false} />
        </div>
    );
};

export default UserDistribution;
