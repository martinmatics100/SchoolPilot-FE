import React from "react";
import {
    Box,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
} from "@mui/material";

interface BroadsheetTableProps {
    students: string[];
    subjects: string[];
    columnWidths?: {
        sn?: number | string;
        name?: number | string;
        subject?: number | string;
    };
}

const BroadsheetTable: React.FC<BroadsheetTableProps> = ({
    students,
    subjects,
    columnWidths,
}) => {
    return (
        <Box sx={{ p: 2 }}>
            <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: columnWidths?.sn || 50 }}>S/N</TableCell>
                            <TableCell sx={{ width: columnWidths?.name || 200 }}>Student Name</TableCell>

                            {/* SUBJECT HEADERS VERTICAL */}
                            {subjects.map((subj, i) => (
                                <TableCell
                                    key={i}
                                    sx={{
                                        width: columnWidths?.subject || 50,
                                        textAlign: "center",
                                        whiteSpace: "nowrap",
                                        height: "130px",
                                        writingMode: "vertical-rl",
                                        transform: "rotate(180deg)",
                                        fontSize: "12px",
                                    }}
                                >
                                    {subj}
                                </TableCell>
                            ))}

                            <TableCell>Total Subjects</TableCell>
                            <TableCell>Total Obtainable</TableCell>
                            <TableCell>Total</TableCell>
                            <TableCell>Average</TableCell>
                            <TableCell>Percentage</TableCell>
                            <TableCell>Position</TableCell>
                            <TableCell>Result Status</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {students.map((student, index) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{student}</TableCell>

                                {/* SUBJECT SCORES */}
                                {subjects.map((_, i) => (
                                    <TableCell key={i} align="center">–</TableCell>
                                ))}

                                <TableCell>{subjects.length}</TableCell>
                                <TableCell>{subjects.length * 100}</TableCell>
                                <TableCell>–</TableCell>
                                <TableCell>–</TableCell>
                                <TableCell>–</TableCell>
                                <TableCell>–</TableCell>
                                <TableCell>–</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default BroadsheetTable;
