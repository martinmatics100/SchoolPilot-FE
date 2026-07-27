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
  Typography,
  alpha,
  useTheme,
  Chip,
} from "@mui/material";

interface Subject {
  subject: number;
  totalScore: number | null;
  testScore: number | null;
  examScore: number | null;
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
    score?: number | string;
  };
}

const BroadsheetTable: React.FC<BroadsheetTableProps> = ({
  students,
  subjects,
  columnWidths,
}) => {
  const theme = useTheme();

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      passed: theme.palette.success.main,
      failed: theme.palette.error.main,
      promoted: theme.palette.success.main,
      retained: theme.palette.warning.main,
      pass: theme.palette.success.main,
      fail: theme.palette.error.main,
    };
    return statusColors[status?.toLowerCase()] || theme.palette.text.secondary;
  };

  const getPositionColor = (position: string) => {
    if (position === "1st" || position === "1") return theme.palette.warning.main;
    if (position === "2nd" || position === "2") return theme.palette.text.secondary;
    if (position === "3rd" || position === "3") return theme.palette.info.main;
    return theme.palette.text.primary;
  };

  const getScoreColor = (score: number | null) => {
    if (score === null) return theme.palette.text.secondary;
    if (score >= 50) return theme.palette.success.main;
    return theme.palette.error.main;
  };

  // Line styles for better visibility
  const lineStyles = {
    headerBottom: `2px solid ${theme.palette.grey[700]}`,
    subjectSeparator: `1px solid ${theme.palette.grey[400]}`,
    rowSeparator: `1px solid ${theme.palette.grey[300]}`,
    summarySeparator: `1px solid ${theme.palette.grey[500]}`,
    nameSeparator: `1px solid ${theme.palette.grey[400]}`,
  };

  return (
    <Box sx={{ p: { xs: 1, sm: 2 } }}>
      <TableContainer
        component={Paper}
        elevation={0}
        sx={{
          overflowX: "auto",
          bgcolor: "background.default",
          borderRadius: 3,
          border: `2px solid ${theme.palette.grey[400]}`,
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              {/* S/N */}
              <TableCell
                rowSpan={2}
                align="center"
                sx={{
                  width: columnWidths?.sn || 50,
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  color: theme.palette.text.primary,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  borderBottom: lineStyles.headerBottom,
                  borderRight: lineStyles.nameSeparator,
                  py: 2,
                }}
              >
                S/N
              </TableCell>

              {/* Student Name */}
              <TableCell
                rowSpan={2}
                sx={{
                  width: columnWidths?.name || 200,
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  color: theme.palette.text.primary,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  borderBottom: lineStyles.headerBottom,
                  borderRight: lineStyles.nameSeparator,
                  py: 2,
                }}
              >
                Student Name
              </TableCell>

              {/* Subject Headers - First row (Subject Names) */}
              {subjects.map((subj, i) => (
                <TableCell
                  key={`subject-${i}`}
                  align="center"
                  colSpan={3}
                  sx={{
                    fontWeight: 700,
                    fontSize: "0.7rem",
                    color: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    borderBottom: lineStyles.subjectSeparator,
                    borderRight: i < subjects.length - 1 ? lineStyles.subjectSeparator : 'none',
                    py: 1,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                >
                  {subj}
                </TableCell>
              ))}

              {/* Summary Headers */}
              <TableCell
                rowSpan={2}
                align="center"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  color: theme.palette.text.primary,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  borderBottom: lineStyles.headerBottom,
                  borderLeft: lineStyles.summarySeparator,
                  py: 2,
                  whiteSpace: "nowrap",
                  minWidth: 70,
                }}
              >
                Total Subj
              </TableCell>
              <TableCell
                rowSpan={2}
                align="center"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  color: theme.palette.text.primary,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  borderBottom: lineStyles.headerBottom,
                  py: 2,
                  whiteSpace: "nowrap",
                  minWidth: 70,
                }}
              >
                Obtainable
              </TableCell>
              <TableCell
                rowSpan={2}
                align="center"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  color: theme.palette.text.primary,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  borderBottom: lineStyles.headerBottom,
                  py: 2,
                  whiteSpace: "nowrap",
                  minWidth: 80,
                }}
              >
                Grand Total
              </TableCell>
              <TableCell
                rowSpan={2}
                align="center"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  color: theme.palette.text.primary,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  borderBottom: lineStyles.headerBottom,
                  py: 2,
                  whiteSpace: "nowrap",
                  minWidth: 65,
                }}
              >
                Average
              </TableCell>
              <TableCell
                rowSpan={2}
                align="center"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  color: theme.palette.text.primary,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  borderBottom: lineStyles.headerBottom,
                  py: 2,
                  whiteSpace: "nowrap",
                  minWidth: 65,
                }}
              >
                Position
              </TableCell>
              <TableCell
                rowSpan={2}
                align="center"
                sx={{
                  fontWeight: 700,
                  fontSize: "0.7rem",
                  color: theme.palette.text.primary,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  borderBottom: lineStyles.headerBottom,
                  py: 2,
                  whiteSpace: "nowrap",
                  minWidth: 65,
                }}
              >
                Status
              </TableCell>
            </TableRow>

            {/* Second Row - Test, Exam, Total labels */}
            <TableRow>
              {subjects.map((_, i) => (
                <React.Fragment key={`subheader-${i}`}>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.6rem",
                      color: theme.palette.text.secondary,
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                      borderBottom: lineStyles.headerBottom,
                      borderRight: i < subjects.length - 1 ? lineStyles.subjectSeparator : 'none',
                      py: 0.75,
                      px: 0.5,
                      minWidth: 40,
                    }}
                  >
                    Test
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.6rem",
                      color: theme.palette.text.secondary,
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                      borderBottom: lineStyles.headerBottom,
                      borderRight: i < subjects.length - 1 ? lineStyles.subjectSeparator : 'none',
                      py: 0.75,
                      px: 0.5,
                      minWidth: 40,
                    }}
                  >
                    Exam
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.6rem",
                      color: theme.palette.primary.main,
                      bgcolor: alpha(theme.palette.primary.main, 0.02),
                      borderBottom: lineStyles.headerBottom,
                      borderRight: i < subjects.length - 1 ? lineStyles.subjectSeparator : 'none',
                      py: 0.75,
                      px: 0.5,
                      minWidth: 40,
                    }}
                  >
                    Total
                  </TableCell>
                </React.Fragment>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {students.map((student, index) => {
              const isLastRow = index === students.length - 1;
              return (
                <TableRow
                  key={student.studentId}
                  sx={{
                    "&:hover": {
                      bgcolor: alpha(theme.palette.action.hover, 0.04),
                    },
                  }}
                >
                  {/* S/N */}
                  <TableCell
                    align="center"
                    sx={{
                      color: theme.palette.text.secondary,
                      borderBottom: isLastRow ? lineStyles.headerBottom : lineStyles.rowSeparator,
                      borderRight: lineStyles.nameSeparator,
                      py: 1.5,
                    }}
                  >
                    {index + 1}
                  </TableCell>

                  {/* Student Name */}
                  <TableCell
                    sx={{
                      fontWeight: 500,
                      color: theme.palette.text.primary,
                      borderBottom: isLastRow ? lineStyles.headerBottom : lineStyles.rowSeparator,
                      borderRight: lineStyles.nameSeparator,
                      py: 1.5,
                    }}
                  >
                    {student.studentName}
                  </TableCell>

                  {/* Subject Scores - Test, Exam, Total with separators */}
                  {student.subjects.map((sub, i) => (
                    <React.Fragment key={`scores-${i}`}>
                      {/* Test Score */}
                      <TableCell
                        align="center"
                        sx={{
                          color: getScoreColor(sub.testScore),
                          fontWeight: sub.testScore !== null && sub.testScore >= 50 ? 600 : 400,
                          fontSize: "0.8rem",
                          borderBottom: isLastRow ? lineStyles.headerBottom : lineStyles.rowSeparator,
                          borderRight: lineStyles.subjectSeparator,
                          py: 1.5,
                          px: 0.5,
                        }}
                      >
                        {sub.testScore !== null ? sub.testScore : "–"}
                      </TableCell>

                      {/* Exam Score */}
                      <TableCell
                        align="center"
                        sx={{
                          color: getScoreColor(sub.examScore),
                          fontWeight: sub.examScore !== null && sub.examScore >= 50 ? 600 : 400,
                          fontSize: "0.8rem",
                          borderBottom: isLastRow ? lineStyles.headerBottom : lineStyles.rowSeparator,
                          borderRight: lineStyles.subjectSeparator,
                          py: 1.5,
                          px: 0.5,
                        }}
                      >
                        {sub.examScore !== null ? sub.examScore : "–"}
                      </TableCell>

                      {/* Total Score */}
                      <TableCell
                        align="center"
                        sx={{
                          color: getScoreColor(sub.totalScore),
                          fontWeight: sub.totalScore !== null && sub.totalScore >= 50 ? 700 : 400,
                          fontSize: "0.85rem",
                          borderBottom: isLastRow ? lineStyles.headerBottom : lineStyles.rowSeparator,
                          borderRight: i < student.subjects.length - 1 ? lineStyles.subjectSeparator : 'none',
                          py: 1.5,
                          px: 0.5,
                        }}
                      >
                        {sub.totalScore !== null ? sub.totalScore : "–"}
                      </TableCell>
                    </React.Fragment>
                  ))}

                  {/* Summary Cells */}
                  <TableCell
                    align="center"
                    sx={{
                      color: theme.palette.text.secondary,
                      borderBottom: isLastRow ? lineStyles.headerBottom : lineStyles.rowSeparator,
                      borderLeft: lineStyles.summarySeparator,
                      py: 1.5,
                    }}
                  >
                    {student.totalSubjects}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      color: theme.palette.text.secondary,
                      borderBottom: isLastRow ? lineStyles.headerBottom : lineStyles.rowSeparator,
                      py: 1.5,
                    }}
                  >
                    {student.totalObtainable}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      color: student.totalScore >= 500 ? theme.palette.success.main : theme.palette.text.primary,
                      borderBottom: isLastRow ? lineStyles.headerBottom : lineStyles.rowSeparator,
                      py: 1.5,
                    }}
                  >
                    {student.totalScore}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      color: theme.palette.text.secondary,
                      borderBottom: isLastRow ? lineStyles.headerBottom : lineStyles.rowSeparator,
                      py: 1.5,
                    }}
                  >
                    {student.average}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      fontWeight: 700,
                      color: getPositionColor(student.positionText),
                      borderBottom: isLastRow ? lineStyles.headerBottom : lineStyles.rowSeparator,
                      py: 1.5,
                    }}
                  >
                    {student.positionText}
                  </TableCell>
                  <TableCell
                    align="center"
                    sx={{
                      borderBottom: isLastRow ? lineStyles.headerBottom : lineStyles.rowSeparator,
                      py: 1.5,
                    }}
                  >
                    <Chip
                      label={student.resultStatus}
                      size="small"
                      sx={{
                        bgcolor: alpha(getStatusColor(student.resultStatus), 0.1),
                        color: getStatusColor(student.resultStatus),
                        fontWeight: 600,
                        fontSize: "0.65rem",
                        height: 24,
                      }}
                    />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default BroadsheetTable;