import React from "react";
import { Bar } from "react-chartjs-2";
import { type ChartOptions } from "chart.js";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

interface BarChartProps {
    labels: string[];
    data: number[];
    colors?: string[];
}

const BarChart: React.FC<BarChartProps> = ({ labels, data, colors }) => {

    const chartData = {
        labels,
        datasets: [
            {
                label: "Data",
                data,
                backgroundColor: colors || [
                    "#42A5F5", "#FF6384", "#FFCE56", "#66BB6A", "#9575CD",
                ],
                hoverBackgroundColor: colors?.map(color => color + "AA") || [
                    "#64B5F6", "#FF869A", "#FFE082", "#81C784", "#B39DDB",
                ],
                borderColor: "#333",
                borderWidth: 1,
            },
        ],
    };

    const options: ChartOptions<"bar"> = {
        responsive: true,
        plugins: {
            legend: {
                position: "top",
            },
            tooltip: {
                callbacks: {
                    label: (tooltipItem: { dataIndex: number }) => {
                        const index = tooltipItem.dataIndex;
                        const label = chartData.labels[index];
                        const value = chartData.datasets[0].data[index];
                        return `${label}: ${value}`;
                    },
                },
            },
        },
        scales: {
            x: {
                beginAtZero: true,
            },
            y: {
                beginAtZero: true,
            },
        },
    };

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto" }}>
            <Bar data={chartData} options={options} />
        </div>
    );
};

export default BarChart;
