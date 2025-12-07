import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Box,
    Typography
} from '@mui/material';
import { useTheme } from '@mui/material';

interface Teacher {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
}

interface AssignTeacherModalProps {
    open: boolean;
    onClose: () => void;
    onAssign: (teacherId: string) => void;
    fetchTeachers: () => Promise<Teacher[]>;
    isSubmitting?: boolean;
}

export const AssignTeacherModal: React.FC<AssignTeacherModalProps> = ({
    open,
    onClose,
    onAssign,
    fetchTeachers,
    isSubmitting = false,
}) => {
    const [teachers, setTeachers] = useState<Teacher[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedTeacher, setSelectedTeacher] = useState('');

    const theme = useTheme();

    useEffect(() => {
        if (open) {
            loadTeachers();
        }
    }, [open]);

    const loadTeachers = async () => {
        setLoading(true);
        try {
            const result = await fetchTeachers();
            setTeachers(result);
        } catch (error) {
            console.error('Error fetching teachers:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAssignClick = () => {
        if (!selectedTeacher) return;
        onAssign(selectedTeacher);
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="xs"
            PaperProps={{
                sx: {
                    bgcolor: theme.palette.background.default,
                }
            }}
        >
            <DialogTitle>Select Form Teacher</DialogTitle>

            <DialogContent>
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" p={3}>
                        <CircularProgress />
                    </Box>
                ) : teachers.length === 0 ? (
                    <Typography>No teachers available</Typography>
                ) : (
                    <FormControl fullWidth sx={{ mt: 2 }}>
                        <InputLabel>Select Teacher</InputLabel>
                        <Select
                            value={selectedTeacher}
                            label="Select Teacher"
                            onChange={(e) => setSelectedTeacher(e.target.value)}
                        >
                            {teachers.map((teacher) => (
                                <MenuItem key={teacher.id} value={teacher.id}>
                                    {teacher.firstName} {teacher.lastName} ({teacher.email})
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                )}
            </DialogContent>

            <DialogActions sx={{ p: 2 }}>
                <Button onClick={onClose} color="inherit">
                    Cancel
                </Button>

                <Button
                    onClick={handleAssignClick}
                    disabled={!selectedTeacher || isSubmitting}
                    variant="contained"
                    color="primary"
                >
                    {isSubmitting ? <CircularProgress size={22} /> : "Assign"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};
