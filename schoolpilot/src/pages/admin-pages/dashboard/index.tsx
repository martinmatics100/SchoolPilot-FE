import React from 'react';
import {
    Table,
    TableHead,
    TableBody,
    TableRow,
    TableCell,
    Paper,
    TableContainer,
    Button,
    Stack
} from '@mui/material';

const Index = () => {
    return (
        <div>
            <h1>Admin Dashboard</h1>
            <TableContainer component={Paper} sx={{ mt: 5 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Actions</TableCell> {/* 👈 New Column */}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        <TableRow>
                            <TableCell>Martin</TableCell>
                            <TableCell>martin@example.com</TableCell>
                            <TableCell>Active</TableCell>
                            <TableCell>
                                <Stack direction="row" spacing={1}>
                                    <Button variant="outlined" color="error" size="small">Edit</Button>
                                    <Button variant="outlined" color="error" size="small">Delete</Button>
                                </Stack>
                            </TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell>Jane</TableCell>
                            <TableCell>jane@example.com</TableCell>
                            <TableCell>Inactive</TableCell>
                            <TableCell>
                                <Stack direction="row" spacing={1}>
                                    <Button variant="outlined" color="error" size="small">Edit</Button>
                                    <Button variant="outlined" color="error" size="small">Delete</Button>
                                </Stack>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
};

export default Index;
