// components/charts/pieCharts.tsx

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
    height?: number | string;
}

const PieChart: React.FC<PieChartProps> = ({
    labels,
    data,
    colors,
    showLegend = true,
    showDataLabels = true,
    height = "100%",
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
                borderColor: "#fff",
            },
        ],
    };

    const options: ChartOptions<"pie"> = {
        responsive: true,
        maintainAspectRatio: true, // Changed to true to prevent overflow
        plugins: {
            legend: {
                display: showLegend,
                position: "bottom", // Changed to bottom to prevent clipping
                labels: {
                    font: {
                        size: 12,
                        family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
                    },
                    padding: 12,
                    usePointStyle: true,
                    pointStyle: "circle",
                    boxWidth: 12,
                },
            },
            tooltip: {
                titleFont: { size: 13 },
                bodyFont: { size: 12 },
                callbacks: {
                    label: (tooltipItem: any) => {
                        const index = tooltipItem.dataIndex;
                        const label = chartData.labels[index];
                        const value = chartData.datasets[0].data[index];
                        const total = chartData.datasets[0].data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                        return ` ${label}: ${value} (${percentage}%)`;
                    },
                },
            },
            datalabels: showDataLabels
                ? {
                    color: "#fff",
                    formatter: (value: number, context: any) => {
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                        return `${percentage}%`;
                    },
                    font: {
                        size: 13,
                        weight: "bold" as const,
                    },
                    anchor: "center" as const,
                    align: "center" as const,
                    textAlign: "center" as const,
                    display: (context: any) => {
                        const value = context.dataset.data[context.dataIndex];
                        const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                        const percentage = total > 0 ? (value / total) * 100 : 0;
                        return percentage > 5; // Only show if slice is big enough
                    }
                }
                : { display: false },
        },
    };

    return (
        <Box
            sx={{
                width: "100%",
                height: height,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: 200,
            }}
        >
            <Pie data={chartData} options={options} />
        </Box>
    );
};

export default PieChart;