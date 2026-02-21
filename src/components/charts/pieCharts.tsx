import React from "react";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, type ChartOptions } from "chart.js";
import ChartDataLabels from "chartjs-plugin-datalabels";
import { Pie } from "react-chartjs-2";
import { Box, Typography } from "@mui/material";

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

interface PieChartProps {
    labels: string[];
    data: number[];
    colors?: string[];
    showLegend?: boolean;
    showDataLabels?: boolean;
}

const PieChart: React.FC<PieChartProps> = ({
    labels,
    data,
    colors,
    showLegend = true,
    showDataLabels = true,
}) => {

    const filteredData = data.filter(value => value !== 0);
    const filteredLabels = labels.filter((_, index) => data[index] !== 0);
    const filteredColors = colors?.filter((_, index) => data[index] !== 0);

    const isDataEmpty = filteredData.length === 0;

    if (isDataEmpty) {
        return (
            <Box
                sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    height: "100%",
                    minHeight: "200px",
                    textAlign: "center",
                }}
            >
                <Typography
                    variant="body1"
                    sx={{
                        color: "grey.500",
                        fontSize: { xs: "16px", sm: "18px", md: "20px" },
                    }}
                >
                    No data available to display.
                </Typography>
            </Box>
        );
    }

    const chartData = {
        labels: filteredLabels,
        datasets: [
            {
                data: filteredData,
                backgroundColor: filteredColors || [
                    "#42A5F5", "#FF6384", "#FFCE56", "#66BB6A", "#9575CD",
                ],
                hoverBackgroundColor: filteredColors?.map(
                    (color) => color + "AA"
                ) || [
                        "#64B5F6", "#FF869A", "#FFE082", "#81C784", "#B39DDB",
                    ],
                borderWidth: 2,
            },
        ],
    };

    const options: ChartOptions<"pie"> = {
        responsive: true,
        maintainAspectRatio: false, // Important: allows chart to scale better with larger fonts
        plugins: {
            legend: {
                display: showLegend,
                position: "top",
                labels: {
                    // --- INCREASED LEGEND FONT SIZE ---
                    font: {
                        size: 16, // Labels like "Males", "Females"
                        family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
                    },
                    padding: 20,
                    usePointStyle: true,
                },
            },
            tooltip: {
                titleFont: { size: 16 },
                bodyFont: { size: 14 },
                callbacks: {
                    label: (tooltipItem: any) => {
                        const index = tooltipItem.dataIndex;
                        const label = chartData.labels[index];
                        const value = chartData.datasets[0].data[index];
                        return ` ${label}: ${value}`;
                    },
                },
            },
            datalabels: showDataLabels
                ? {
                    color: "#fff",
                    formatter: (value: number, context: any) => {
                        const index = context.dataIndex;
                        // Using \n to put the number on a new line so it stays inside the slice
                        return `${chartData.labels[index]}\n${value}`;
                    },
                    // --- INCREASED DATALABEL FONT SIZE ---
                    font: {
                        size: 18, // Text inside the pie slices
                        weight: "bold",
                    },
                    anchor: "center",
                    align: "center",
                    textAlign: "center",
                    display: (context: any) => {
                        // Optional: only show label if the slice is big enough
                        return context.dataset.data[context.dataIndex] > 0;
                    }
                }
                : { display: false },
        },
    };

    return (
        <Box sx={{ width: "100%", height: { xs: 300, md: 350 }, margin: "0 auto" }}>
            <Pie data={chartData} options={options} />
        </Box>
    );
};

export default PieChart;