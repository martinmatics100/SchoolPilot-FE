import React from 'react';
import { Box, Typography } from '@mui/material';
import ScoreInputComponent, { type Student, type Subject, type Score } from '../../../components/score-input';

const ScoreInput: React.FC = () => {

    // Sample data (replace with dynamic data from your backend)
    const students: Student[] = [
        { id: '1', name: 'Adeleke Adeyemi' },
        { id: '2', name: 'Adeyemi Abiodun' },
        { id: '3', name: 'Adeyemi John' },
        { id: '1', name: 'Adeleke Adeyemi' },
        { id: '2', name: 'Adeyemi Abiodun' },
        { id: '3', name: 'Adeyemi John' },
        { id: '1', name: 'Adeleke Adeyemi' },
        { id: '2', name: 'Adeyemi Abiodun' },
        { id: '3', name: 'Adeyemi John' },
        { id: '1', name: 'Adeleke Adeyemi' },
        { id: '2', name: 'Adeyemi Abiodun' },
        { id: '3', name: 'Adeyemi John' },
        { id: '1', name: 'Adeleke Adeyemi' },
        { id: '2', name: 'Adeyemi Abiodun' },
        { id: '3', name: 'Adeyemi John' },
        { id: '1', name: 'Adeleke Adeyemi' },
        { id: '2', name: 'Adeyemi Abiodun' },
        { id: '3', name: 'Adeyemi John' },
        { id: '1', name: 'Adeleke Adeyemi' },
        { id: '2', name: 'Adeyemi Abiodun' },
        { id: '3', name: 'Adeyemi John' },
    ];

    const subjects: Subject[] = [
        { id: 'math', name: 'Mathematics' },
        { id: 'eng', name: 'English Language' },
        { id: 'phy', name: 'Physics' }
    ];

    const handleSubmit = (scores: Record<string, Record<string, Score>>) => {
        console.log('Submitted scores for page:', scores);
        // Here you would typically send the scores to a backend API
        alert('Scores submitted successfully!');
    };

    return (
        <Box sx={{ padding: 2 }}>
            {/* <Typography variant="h4" gutterBottom>
                Nigerian School Web App - Score Input
            </Typography> */}
            <ScoreInputComponent
                students={students}
                subjects={subjects}
                onSubmit={handleSubmit}
            // Optionally pass selectedClass if needed
            />
        </Box>
    )
}

export default ScoreInput