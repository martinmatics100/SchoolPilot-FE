import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';

export interface StatCardProps {
    icon: React.ReactNode;
    name: string;
    number: number | string;
}

const StatCard: React.FC<StatCardProps> = ({ icon, name, number }) => {
    return (
        <Card variant="outlined" sx={{ p: 2, textAlign: 'center', height: '100%' }}>
            <Box sx={{ mb: 2, fontSize: '2.5rem' }}>
                {icon}
            </Box>
            <Typography variant="h6">{name}</Typography>
            <Typography variant="body1" color="text.secondary">
                {number}
            </Typography>
        </Card>
    )
};

export default StatCard;
