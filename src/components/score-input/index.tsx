import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
} from "@mui/material";
import { useAuth } from "../../context";
import { fetchStudentScoresBySubject } from "../../api/studentService";
import { useTheme } from "@mui/material";

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

interface Props {
  students: Student[];
  subjects: Subject[];
  classId: string;
  schoolSession: number;
  schoolTerm: number;
  onSubmit: (scores: any) => void;
}

const ScoreInputComponent: React.FC<Props> = ({
  subjects,
  classId,
  schoolSession,
  schoolTerm,
  onSubmit,
}) => {
  const { selectedAccount } = useAuth();

  const theme = useTheme();

  const [selectedSubject, setSelectedSubject] = useState("");
  const [students, setStudents] = useState<Student[]>([]);
  const [scores, setScores] = useState<Record<string, Score>>({});

  /* Fetch scores when subject changes */
  useEffect(() => {
    if (!selectedSubject || !selectedAccount) return;

    fetchStudentScoresBySubject({
      selectedAccount,
      classId,
      subjectId: selectedSubject,
      schoolSession,
      schoolTerm,
    }).then((data) => {
      const mappedStudents = data.map((s: any) => ({
        id: s.studentId,
        name: s.studentName,
      }));

      const mappedScores: Record<string, Score> = {};
      data.forEach((s: any) => {
        mappedScores[s.studentId] = {
          test:
            s.scores.find((x: any) => x.assessmentName === "Test")?.score ??
            null,
          exam:
            s.scores.find((x: any) => x.assessmentName === "Exam")?.score ??
            null,
        };
      });

      setStudents(mappedStudents);
      setScores(mappedScores);
    });
  }, [selectedSubject]);

  const handleScoreChange = (
    studentId: string,
    type: "test" | "exam",
    value: string
  ) => {
    setScores((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [type]: value === "" ? null : Number(value),
      },
    }));
  };

  return (
    <Box mt={2}>
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Select Subject</InputLabel>
        <Select
          value={selectedSubject}
          label="Select Subject"
          onChange={(e) => setSelectedSubject(e.target.value)}
        >
          {subjects.map((s) => (
            <MenuItem key={s.id} value={s.id}>
              {s.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {selectedSubject && (
        <>
          <TableContainer
            component={Paper}
            sx={{ bgcolor: theme.palette.background.default }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ color: theme.palette.text.secondary }}>
                    Student
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.secondary }}>
                    Test
                  </TableCell>
                  <TableCell sx={{ color: theme.palette.text.secondary }}>
                    Exam
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell
                      sx={{
                        color: theme.palette.text.secondary,
                        fontWeight: "900",
                        fontSize: "18px",
                      }}
                    >
                      {s.name}
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={scores[s.id]?.test ?? ""}
                        onChange={(e) =>
                          handleScoreChange(s.id, "test", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        type="number"
                        value={scores[s.id]?.exam ?? ""}
                        onChange={(e) =>
                          handleScoreChange(s.id, "exam", e.target.value)
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => onSubmit({ subjectId: selectedSubject, scores })}
          >
            Submit Scores
          </Button>
        </>
      )}
    </Box>
  );
};

export default ScoreInputComponent;
