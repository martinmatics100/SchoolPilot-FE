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
import IconifyIcon from "../../components/base/iconifyIcon";

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

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      passed: theme.palette.success.main,
      failed: theme.palette.error.main,
      promoted: theme.palette.success.main,
      retained: theme.palette.warning.main,
    };
    return statusColors[status?.toLowerCase()] || theme.palette.text.secondary;
  };

  const getPositionColor = (position: string) => {
    if (position === "1st" || position === "1") return theme.palette.warning.main;
    if (position === "2nd" || position === "2") return theme.palette.text.secondary;
    if (position === "3rd" || position === "3") return theme.palette.info.main;
    return theme.palette.text.primary;
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
          border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        }}
      >
        <Table size="small" stickyHeader>
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  width: columnWidths?.sn || 50,
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  color: theme.palette.text.primary,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  borderBottom: `2px solid ${theme.palette.primary.main}`,
                  py: 1.5,
                }}
              >
                S/N
              </TableCell>
              <TableCell
                sx={{
                  width: columnWidths?.name || 250,
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  color: theme.palette.text.primary,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  borderBottom: `2px solid ${theme.palette.primary.main}`,
                  py: 1.5,
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
                    width: columnWidths?.subject || 60,
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    height: "120px",
                    writingMode: "vertical-rl",
                    transform: "rotate(180deg)",
                    fontSize: "0.7rem",
                    fontWeight: 600,
                    color: theme.palette.primary.main,
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    borderBottom: `2px solid ${theme.palette.primary.main}`,
                    py: 1.5,
                  }}
                >
                  {subj}
                </TableCell>
              ))}

              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  color: theme.palette.text.primary,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  borderBottom: `2px solid ${theme.palette.primary.main}`,
                  py: 1.5,
                  whiteSpace: "nowrap",
                }}
              >
                Total Subj
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  color: theme.palette.text.primary,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  borderBottom: `2px solid ${theme.palette.primary.main}`,
                  py: 1.5,
                  whiteSpace: "nowrap",
                }}
              >
                Obtainable
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  color: theme.palette.text.primary,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  borderBottom: `2px solid ${theme.palette.primary.main}`,
                  py: 1.5,
                  whiteSpace: "nowrap",
                }}
              >
                Grand Total
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  color: theme.palette.text.primary,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  borderBottom: `2px solid ${theme.palette.primary.main}`,
                  py: 1.5,
                  whiteSpace: "nowrap",
                }}
              >
                Average
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  color: theme.palette.text.primary,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  borderBottom: `2px solid ${theme.palette.primary.main}`,
                  py: 1.5,
                  whiteSpace: "nowrap",
                }}
              >
                Position
              </TableCell>
              <TableCell
                sx={{
                  fontWeight: 700,
                  fontSize: "0.75rem",
                  color: theme.palette.text.primary,
                  bgcolor: alpha(theme.palette.primary.main, 0.04),
                  borderBottom: `2px solid ${theme.palette.primary.main}`,
                  py: 1.5,
                  whiteSpace: "nowrap",
                }}
              >
                Status
              </TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {students.map((student, index) => (
              <TableRow
                key={student.studentId}
                sx={{
                  "&:hover": {
                    bgcolor: alpha(theme.palette.action.hover, 0.04),
                  },
                  "&:last-child td, &:last-child th": {
                    border: 0,
                  },
                }}
              >
                <TableCell
                  sx={{
                    color: theme.palette.text.secondary,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                    py: 1.5,
                  }}
                >
                  {index + 1}
                </TableCell>
                <TableCell
                  sx={{
                    fontWeight: 500,
                    color: theme.palette.text.primary,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                    py: 1.5,
                  }}
                >
                  {student.studentName}
                </TableCell>

                {/* SUBJECT SCORES */}
                {student.subjects.map((sub, i) => (
                  <TableCell
                    key={i}
                    align="center"
                    sx={{
                      color: sub.totalScore !== null && sub.totalScore >= 50
                        ? theme.palette.success.main
                        : sub.totalScore !== null && sub.totalScore < 50
                          ? theme.palette.error.main
                          : theme.palette.text.secondary,
                      fontWeight: sub.totalScore !== null && sub.totalScore >= 50 ? 600 : 400,
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                      py: 1.5,
                    }}
                  >
                    {sub.totalScore !== null ? sub.totalScore : "–"}
                  </TableCell>
                ))}

                <TableCell
                  align="center"
                  sx={{
                    color: theme.palette.text.secondary,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                    py: 1.5,
                  }}
                >
                  {student.totalSubjects}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: theme.palette.text.secondary,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                    py: 1.5,
                  }}
                >
                  {student.totalObtainable}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    color: theme.palette.text.primary,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                    py: 1.5,
                  }}
                >
                  {student.totalScore}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    color: theme.palette.text.secondary,
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                    py: 1.5,
                  }}
                >
                  {student.average}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    fontWeight: 600,
                    color: getPositionColor(student.positionText),
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                    py: 1.5,
                  }}
                >
                  {student.positionText}
                </TableCell>
                <TableCell
                  align="center"
                  sx={{
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                    py: 1.5,
                  }}
                >
                  <Chip
                    label={student.resultStatus}
                    size="small"
                    sx={{
                      bgcolor: alpha(getStatusColor(student.resultStatus), 0.1),
                      color: getStatusColor(student.resultStatus),
                      fontWeight: 500,
                      fontSize: "0.7rem",
                      height: 24,
                    }}
                  />
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