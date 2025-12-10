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
import { useTheme } from "@mui/material";

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

    const theme = useTheme();

    return (
        <Box sx={{ p: 2 }}>
            <TableContainer component={Paper} sx={{ overflowX: "auto", bgcolor: theme.palette.background.default }}>
                <Table size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: columnWidths?.sn || 10, color: theme.palette.text.secondary }}>S/N</TableCell>
                            <TableCell sx={{ width: columnWidths?.name || 200, color: theme.palette.text.secondary, whiteSpace: "nowrap" }}>Student Name</TableCell>

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
                                        color: theme.palette.text.secondary
                                    }}
                                >
                                    {subj}
                                </TableCell>
                            ))}

                            <TableCell sx={{ color: theme.palette.text.secondary, whiteSpace: "nowrap" }}>Total Subjects</TableCell>
                            <TableCell sx={{ color: theme.palette.text.secondary }}>Total Obtainable</TableCell>
                            <TableCell sx={{ color: theme.palette.text.secondary }}>Total</TableCell>
                            <TableCell sx={{ color: theme.palette.text.secondary }}>Average</TableCell>
                            <TableCell sx={{ color: theme.palette.text.secondary }}>Percentage</TableCell>
                            <TableCell sx={{ color: theme.palette.text.secondary }}>Position</TableCell>
                            <TableCell sx={{ color: theme.palette.text.secondary }}>Result Status</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {students.map((student, index) => (
                            <TableRow key={index}>
                                <TableCell sx={{ color: theme.palette.text.secondary }}>{index + 1}</TableCell>
                                <TableCell sx={{ color: theme.palette.text.secondary }}>{student}</TableCell>

                                {/* SUBJECT SCORES */}
                                {subjects.map((_, i) => (
                                    <TableCell key={i} align="center" sx={{ color: theme.palette.text.secondary }}>–</TableCell>
                                ))}

                                <TableCell sx={{ color: theme.palette.text.secondary }}>{subjects.length}</TableCell>
                                <TableCell sx={{ color: theme.palette.text.secondary }}>{subjects.length * 100}</TableCell>
                                <TableCell sx={{ color: theme.palette.text.secondary }}>–</TableCell>
                                <TableCell sx={{ color: theme.palette.text.secondary }}>–</TableCell>
                                <TableCell sx={{ color: theme.palette.text.secondary }}>–</TableCell>
                                <TableCell sx={{ color: theme.palette.text.secondary }}>–</TableCell>
                                <TableCell sx={{ color: theme.palette.text.secondary }}>–</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default BroadsheetTable;
