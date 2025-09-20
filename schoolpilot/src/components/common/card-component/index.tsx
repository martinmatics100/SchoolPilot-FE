import React from 'react';
import { Box, Card, CardContent, Typography } from '@mui/material';

interface StatItem {
    title: string;
    icon: React.ReactNode; // e.g., <SchoolIcon /> from @mui/icons-material
    value: string | number; // Can be number (e.g., 50), string (e.g., '700kg'), or combined (e.g., '600 naira')
}

interface DashboardStatsProps {
    items: StatItem[];
    cardsPerRow?: number; // Optional prop to specify number of cards per row
    textColor?: string; // Single text color for all cards
    backgroundColor?: string; // Single background color for all cards
    borderColor?: string; // Single border color for all cards
    borderWidth?: number; // Single border width for all cards (in pixels)
}

const DashboardStats: React.FC<DashboardStatsProps> = ({
    items,
    cardsPerRow = 4,
    textColor = 'inherit',
    backgroundColor = 'inherit',
    borderColor = '#e0e0e0',
    borderWidth = 1,
}) => {
    const gap = 16; // Gap in pixels
    const cardWidth = `calc(${100 / cardsPerRow}% - ${gap}px)`;

    return (
        <Box
            sx={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: `${gap}px`,
                justifyContent: 'flex-start',
            }}
        >
            {items.map((item, index) => (
                <Card
                    key={index}
                    sx={{
                        flex: `0 0 ${cardWidth}`,
                        minWidth: 200,
                        maxWidth: '100%',
                        minHeight: 150,
                        textAlign: 'center',
                        backgroundColor, // Apply single background color
                        color: textColor, // Apply single text color
                        border: `${borderWidth}px solid ${borderColor}`, // Apply border
                    }}
                >
                    <CardContent>
                        <div style={{ marginBottom: '3px', color: 'inherit', fontSize: '15px' }}>
                            {item.icon}
                        </div>
                        <Typography variant="h6" component="div" gutterBottom sx={{ color: 'inherit', fontSize: '15px' }}>
                            {item.title}
                        </Typography>
                        <Typography variant="h4" sx={{ color: 'inherit', fontSize: '20px' }}>
                            {item.value}
                        </Typography>
                    </CardContent>
                </Card>
            ))}
        </Box>
    );
};

export default DashboardStats;