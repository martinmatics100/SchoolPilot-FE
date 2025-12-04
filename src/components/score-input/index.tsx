import React, { useState, useEffect } from 'react';
import {
    Box,
    Button,
    FormControl,
    Grid,
    InputLabel,
    MenuItem,
    Paper,
    Select,
    type SelectChangeEvent,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TextField,
    Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Define types for props and state
export interface Student {
    id: string;
    name: string;
}

export interface Subject {
    id: string;
    name: string;
}

export interface Score {
    test: number | null;
    exam: number | null;
}

export interface ScoreInputProps {
    students: Student[];
    subjects: Subject[];
    onSubmit: (scores: Record<string, Record<string, Score>>) => void; // Callback for submitting scores
    selectedClass?: string; // Optional class prop for pre-selection
}

const ScoreInputComponent: React.FC<ScoreInputProps> = ({ students, subjects, onSubmit }) => {

    const theme = useTheme();

    const [selectedClass, setSelectedClass] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [scores, setScores] = useState<Record<string, Score>>({});

    // Initialize scores when component mounts or subject changes
    useEffect(() => {
        const initialScores: Record<string, Score> = {};
        students.forEach((student) => {
            initialScores[student.id] = { test: null, exam: null };
        });
        setScores(initialScores);
    }, [students, selectedSubject]);

    const handleClassChange = (event: SelectChangeEvent) => {
        const newClass = event.target.value as string;
        setSelectedClass(newClass);
        // Clear selected subject when class changes
        setSelectedSubject('');
        // Clear scores when class changes
        setScores({});
    };

    const handleSubjectChange = (event: SelectChangeEvent) => {
        setSelectedSubject(event.target.value as string);
    };

    const handleScoreChange = (studentId: string, type: 'test' | 'exam', value: string) => {
        const numValue = parseFloat(value) || null;
        setScores((prev) => ({
            ...prev,
            [studentId]: {
                ...prev[studentId],
                [type]: numValue,
            },
        }));
    };

    const handleSubmit = () => {
        const allScores: Record<string, Record<string, Score>> = {
            [selectedSubject]: scores,
        };
        onSubmit(allScores);
    };

    return (
        <Box sx={{ padding: 2, maxWidth: '100%', overflowX: 'auto' }}>
            <Typography variant="h5" gutterBottom>
                Input Test and Exam Scores
            </Typography>
            <Grid container spacing={2} sx={{ mb: 2 }} alignItems="flex-start">
                <Grid item xs={12} sm={6} md={6}>
                    <FormControl fullWidth>
                        <InputLabel id="class-select-label">Select Class</InputLabel>
                        <Select
                            labelId="class-select-label"
                            value={selectedClass}
                            label="Select Class"
                            onChange={handleClassChange}
                        >
                            <MenuItem value="class1">Class 1</MenuItem>
                            <MenuItem value="class2">Class 2</MenuItem>
                            <MenuItem value="class3">Class 3</MenuItem>
                            {/* Add more classes as needed */}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                    <FormControl fullWidth disabled={!selectedClass}>
                        <InputLabel id="subject-select-label">Select Subject</InputLabel>
                        <Select
                            labelId="subject-select-label"
                            value={selectedSubject}
                            label="Select Subject"
                            onChange={handleSubjectChange}
                            disabled={!selectedClass}
                        >
                            {subjects.map((subject) => (
                                <MenuItem key={subject.id} value={subject.id}>
                                    {subject.name}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
            </Grid>

            {selectedSubject && (
                <TableContainer component={Paper}>
                    <Table aria-label="scores table" size="small" sx={{ bgcolor: theme.palette.background.default }}>
                        <TableHead>
                            <TableRow>
                                <TableCell>Student Name</TableCell>
                                <TableCell>Test Score</TableCell>
                                <TableCell>Exam Score</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {students.map((student) => (
                                <TableRow key={student.id}>
                                    <TableCell>{student.name}</TableCell>
                                    <TableCell>
                                        <TextField
                                            type="number"
                                            size="medium"
                                            value={scores[student.id]?.test ?? ''}
                                            onChange={(e) => handleScoreChange(student.id, 'test', e.target.value)}
                                            inputProps={{ min: 0, max: 100 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <TextField
                                            type="number"
                                            size="medium"
                                            value={scores[student.id]?.exam ?? ''}
                                            onChange={(e) => handleScoreChange(student.id, 'exam', e.target.value)}
                                            inputProps={{ min: 0, max: 100 }}
                                        />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={!selectedSubject}
                sx={{ mt: 2 }}
            >
                Submit Scores
            </Button>
        </Box>
    );
};

export default ScoreInputComponent;