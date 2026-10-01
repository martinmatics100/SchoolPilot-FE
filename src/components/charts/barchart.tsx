// components/charts/BarChart.tsx

import React from "react";
import { Bar } from "react-chartjs-2";
import { type ChartOptions } from "chart.js";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";
import { useTheme, alpha } from "@mui/material";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface BarChartProps {
    labels: string[];
    data: number[];
    colors?: string[];
    title?: string;
    showLegend?: boolean;
    maxValue?: number;
    height?: number | string;
    borderRadius?: number;
    borderWidth?: number;
}

const BarChart: React.FC<BarChartProps> = ({
    labels,
    data,
    colors,
    title = "Data",
    showLegend = false,
    maxValue = 100,
    height = "100%",
    borderRadius = 4,
    borderWidth = 0,
}) => {
    const theme = useTheme();

    // Determine font size based on number of labels
    const getFontSize = () => {
        if (labels.length > 10) return 8;
        if (labels.length > 6) return 10;
        return 12;
    };

    // Determine max rotation based on number of labels
    const getMaxRotation = () => {
        if (labels.length > 10) return 45;
        if (labels.length > 6) return 30;
        return 0;
    };

    const chartData = {
        labels,
        datasets: [
            {
                label: title,
                data,
                backgroundColor: colors || [
                    "#42A5F5", "#FF6384", "#FFCE56", "#66BB6A", "#9575CD",
                ],
                hoverBackgroundColor: colors?.map(color => color + "AA") || [
                    "#64B5F6", "#FF869A", "#FFE082", "#81C784", "#B39DDB",
                ],
                borderColor: colors?.map(() => "#333") || theme.palette.text.secondary,
                borderWidth: borderWidth,
                borderRadius: borderRadius,
            },
        ],
    };

    const options: ChartOptions<"bar"> = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: showLegend,
                position: "top",
                labels: {
                    font: {
                        size: 12,
                        weight: 'bold',
                    },
                    color: theme.palette.text.secondary,
                },
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem: any) => {
                        const index = tooltipItem.dataIndex;
                        const label = chartData.labels[index];
                        const value = chartData.datasets[0].data[index];
                        return `${label}: ${value}%`;
                    },
                },
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    font: {
                        size: getFontSize(),
                        weight: 'bold',
                    },
                    color: theme.palette.text.secondary,
                    maxRotation: getMaxRotation(),
                    minRotation: getMaxRotation(),
                    autoSkip: false,
                },
            },
            y: {
                beginAtZero: true,
                max: maxValue,
                ticks: {
                    font: {
                        size: 10,
                        weight: 'bold',
                    },
                    color: theme.palette.text.secondary,
                    stepSize: 20,
                    callback: (value) => `${value}%`,
                },
                grid: {
                    color: alpha(theme.palette.divider, 0.1),
                },
            },
        },
    };

    return (
        <div style={{ width: "100%", height: height, minHeight: '100px' }}>
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default BarChart;