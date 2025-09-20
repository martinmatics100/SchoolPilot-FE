import React from 'react';
import DashboardStats from '../../../components/common/card-component';
import { School as SchoolIcon, People as PeopleIcon, Class as ClassIcon } from '@mui/icons-material'; // Example icons
import PieChart from '../../../components/common/charts/pieCharts';
import { Box } from '@mui/material';

const exampleItems = [
    {
        title: 'Total Students',
        icon: <SchoolIcon fontSize="large" color="primary" />,
        value: 50,
    },
    {
        title: 'Total Teachers',
        icon: <PeopleIcon fontSize="large" color="primary" />,
        value: '25',
    },
    {
        title: 'Total Parents',
        icon: <PeopleIcon fontSize="large" color="primary" />,
        value: '100',
    },
    {
        title: 'Total Classes',
        icon: <ClassIcon fontSize="large" color="primary" />,
        value: '10',
    },
    {
        title: 'Total Revenue',
        icon: <SchoolIcon fontSize="large" color="primary" />, // Replace with a suitable icon
        value: '600 naira',
    },
    {
        title: 'Total Weight',
        icon: <SchoolIcon fontSize="large" color="primary" />, // Replace with a suitable icon
        value: '700kg',
    },
    // Add as many as you want; the grid will handle responsiveness
];

const pieChartData1 = [
    { label: 'Boys', value: 30, color: '#3b82f6' }, // Blue
    { label: 'Girls', value: 20, color: '#f43f5e' }, // Pink
];

const pieChartData2 = [
    { label: 'Science Classes', value: 5, color: '#10b981' }, // Green
    { label: 'Arts Classes', value: 3, color: '#f59e0b' }, // Orange
    { label: 'Commerce Classes', value: 2, color: '#8b5cf6' }, // Purple
];

const Index = () => {
    return (
        <div>
            <h1>Admin Dashboard</h1>
            <DashboardStats
                items={exampleItems}
                cardsPerRow={3}
                // textColor="#0000FF"
                // backgroundColor="#F5F5F5"
                // borderColor="#000000"
                borderWidth={2}
            />
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, justifyContent: 'center' }}>
                <PieChart title="Student Gender Distribution" data={pieChartData1} />
                <PieChart title="Class Type Distribution" data={pieChartData2} />
            </Box>
        </div>
    );
};

export default Index;