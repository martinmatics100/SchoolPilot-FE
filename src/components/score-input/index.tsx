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

interface Student {
  id: string;
  name: string;
}

interface AssessmentScore {
  subjectAssessmentId: string;
  assessmentName: string;
  score: number | null;
}

interface Props {
  subjects: { id: string; name: string }[];
  classId: string;
  schoolSession: number;
  schoolTerm: number;
  onSubmit: (payload: any) => void;
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
  const [scores, setScores] = useState<Record<string, AssessmentScore[]>>({});

  useEffect(() => {
    setSelectedSubject("");
    setStudents([]);
    setScores({});
  }, [classId, subjects]);

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

      const mappedScores: Record<string, AssessmentScore[]> = {};
      data.forEach((s: any) => {
        mappedScores[s.studentId] = s.scores.map((x: any) => ({
          subjectAssessmentId: x.assessmentId,
          assessmentName: x.assessmentName,
          score: x.score ?? null,
        }));
      });

      setStudents(mappedStudents);
      setScores(mappedScores);
    });
  }, [selectedSubject, selectedAccount]);

  const handleScoreChange = (
    studentId: string,
    assessmentId: string,
    value: string,
  ) => {
    setScores((prev) => ({
      ...prev,
      [studentId]: prev[studentId].map((s) =>
        s.subjectAssessmentId === assessmentId
          ? { ...s, score: value === "" ? null : Number(value) }
          : s,
      ),
    }));
  };

  const handleSubmit = () => {
    const payload = {
      classId,
      subjectId: selectedSubject,
      schoolSession,
      schoolTerm,
      students: Object.entries(scores).map(([studentId, scores]) => ({
        studentId,
        scores: scores.map((s) => ({
          subjectAssessmentId: s.subjectAssessmentId,
          score: s.score,
        })),
      })),
    };

    onSubmit(payload);
  };

  const assessmentHeaders =
    students.length > 0 ? (scores[students[0].id] ?? []) : [];

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
                  <TableCell>Student</TableCell>
                  {assessmentHeaders.map((a) => (
                    <TableCell key={a.subjectAssessmentId}>
                      {a.assessmentName}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody>
                {students.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell
                      sx={{
                        fontWeight: 700,
                        fontSize: "16px",
                        color: theme.palette.text.secondary,
                      }}
                    >
                      {s.name}
                    </TableCell>

                    {scores[s.id]?.map((a) => (
                      <TableCell key={a.subjectAssessmentId}>
                        <TextField
                          type="number"
                          value={a.score ?? ""}
                          onWheel={(e) => e.currentTarget.blur()}
                          onKeyDown={(e) => {
                            if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                              e.preventDefault();
                            }
                          }}
                          onChange={(e) =>
                            handleScoreChange(
                              s.id,
                              a.subjectAssessmentId,
                              e.target.value,
                            )
                          }
                          inputProps={{
                            min: 0,
                            inputMode: "numeric",
                            pattern: "[0-9]*",
                          }}
                          sx={{
                            width: "120px",
                            "& input": {
                              textAlign: "center",
                              fontSize: "1.2rem",
                              fontWeight: 600,
                              padding: "10px",
                            },
                            "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                              {
                                WebkitAppearance: "none",
                                margin: 0,
                              },
                            "& input[type=number]": {
                              MozAppearance: "textfield",
                            },
                          }}
                        />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Button variant="contained" sx={{ mt: 2 }} onClick={handleSubmit}>
            Submit Scores
          </Button>
        </>
      )}
    </Box>
  );
};

export default ScoreInputComponent;
