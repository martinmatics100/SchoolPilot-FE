import React from 'react';
import { Box, Typography } from '@mui/material';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface PieChartItem {
    label: string;
    value: number;
    color: string; // Hex, rgb, or named color for the segment
}

interface PieChartProps {
    title: string; // Chart title
    data: PieChartItem[]; // Array of data for the pie chart
}

const PieChart: React.FC<PieChartProps> = ({ title, data }) => {
    // Extract labels, values, and colors from data
    const labels = data.map(item => item.label);
    const values = data.map(item => item.value);
    const colors = data.map(item => item.color);

    // Validate data to prevent rendering issues
    if (!values.length || values.every(val => val <= 0)) {
        return (
            <Box sx={{ maxWidth: 400, margin: '20px auto', textAlign: 'center' }}>
                <Typography variant="h6" gutterBottom>
                    {title}
                </Typography>
                <Typography color="error">No valid data to display</Typography>
            </Box>
        );
    }

    // Chart.js data configuration
    const chartData = {
        labels,
        datasets: [
            {
                data: values,
                backgroundColor: colors,
                borderColor: colors,
                borderWidth: 1,
            },
        ],
    };

    // Chart.js options
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'bottom' as const,
            },
        },
    };

    return (
        <Box
            sx={{
                maxWidth: 400,
                height: 300, // Explicit height to constrain chart
                margin: '20px auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
            }}
        >
            <Typography variant="h6" textAlign="center" gutterBottom>
                {title}
            </Typography>
            <Box sx={{ width: '100%', height: '100%' }}>
                <Pie data={chartData} options={chartOptions} />
            </Box>
        </Box>
    );
};

export default PieChart;