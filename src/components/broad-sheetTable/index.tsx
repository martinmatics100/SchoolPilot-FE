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

interface Subject {
  subject: number;
  totalScore: number | null;
}

interface Student {
  studentId: string;
  studentName: string;
  subjects: Subject[];
  totalSubjects: number;
  totalObtainable: number;
  totalScore: number;
  average: number;
  percentage: number;
  positionText: string; 
  resultStatus: string;
}

interface BroadsheetTableProps {
  students: Student[];
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
      <TableContainer
        component={Paper}
        sx={{ overflowX: "auto", bgcolor: theme.palette.background.default }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  width: columnWidths?.sn || 10,
                  color: theme.palette.text.secondary,
                }}
              >
                S/N
              </TableCell>
              <TableCell
                sx={{
                  width: columnWidths?.name || 200,
                  color: theme.palette.text.secondary,
                  whiteSpace: "nowrap",
                }}
              >
                Student Name
              </TableCell>

              {/* SUBJECT HEADERS VERTICAL */}
              {subjects.map((subj, i) => (
                <TableCell
                  key={i}
                  sx={{
                    width: columnWidths?.subject || 150,
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    height: "150px",
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                    fontSize: "15px",
                    color: theme.palette.primary.dark,
                  }}
                >
                  {subj}
                </TableCell>
              ))}

              <TableCell
                sx={{
                  color: theme.palette.text.secondary,
                  whiteSpace: "nowrap",
                }}
              >
                Total Subjects
              </TableCell>
              <TableCell sx={{ color: theme.palette.text.secondary }}>
                Total Obtainable
              </TableCell>
              <TableCell sx={{ color: theme.palette.text.secondary }}>
                Grand Total
              </TableCell>
              <TableCell sx={{ color: theme.palette.text.secondary }}>
                Average
              </TableCell>
              {/* <TableCell sx={{ color: theme.palette.text.secondary }}>
                Percentage (%)
              </TableCell> */}
              <TableCell sx={{ color: theme.palette.text.secondary }}>
                Class Position
              </TableCell>
              <TableCell sx={{ color: theme.palette.text.secondary }}>
                Result Status
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {students.map((student, index) => (
              <TableRow key={student.studentId}>
                <TableCell sx={{ color: theme.palette.text.secondary }}>
                  {index + 1}
                </TableCell>
                <TableCell sx={{ color: theme.palette.text.secondary }}>
                  {student.studentName}
                </TableCell>

                {/* SUBJECT SCORES */}
                {student.subjects.map((sub, i) => (
                  <TableCell
                    key={i}
                    align="center"
                    sx={{ color: theme.palette.text.secondary }}
                  >
                    {sub.totalScore !== null ? sub.totalScore : "–"}
                  </TableCell>
                ))}

                <TableCell sx={{ color: theme.palette.text.secondary }}>
                  {student.totalSubjects}
                </TableCell>
                <TableCell sx={{ color: theme.palette.text.secondary }}>
                  {student.totalObtainable}
                </TableCell>
                <TableCell sx={{ color: theme.palette.text.secondary }}>
                  {student.totalScore}
                </TableCell>
                <TableCell sx={{ color: theme.palette.text.secondary }}>
                  {student.average}
                </TableCell>
                {/* <TableCell sx={{ color: theme.palette.text.secondary }}>
                  {student.percentage}
                </TableCell> */}
                <TableCell sx={{ color: theme.palette.text.secondary }}>
                  {student.positionText}
                </TableCell>
                <TableCell sx={{ color: theme.palette.text.secondary }}>
                  {student.resultStatus}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BroadsheetTable;
