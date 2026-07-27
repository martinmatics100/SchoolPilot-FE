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
  Typography,
  alpha,
} from "@mui/material";
import { useEnums } from "../../hooks/useEnums";
import { useAuth } from "../../context";
import { fetchStudentScoresBySubject } from "../../api/studentService";
import { SchoolService } from "../../api/schoolService";
import { useTheme } from "@mui/material";
import IconifyIcon from "../../components/base/iconifyIcon";

interface Student {
  id: string;
  name: string;
}

interface AssessmentScore {
  subjectAssessmentId: string;
  assessmentName: string;
  score: number | null;
  maxScore?: number;
}

interface AssessmentTypeConfig {
  id: string;
  assessmentType: number;
  maxScore: number;
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
  const [assessmentConfigs, setAssessmentConfigs] = useState<
    Record<string, number>
  >({});
  const [validationErrors, setValidationErrors] = useState<
    Record<string, Record<string, string>>
  >({});
  const [loading, setLoading] = useState(false);

  // Fetch assessment types configuration
  useEffect(() => {
    const fetchAssessmentConfigs = async () => {
      try {
        const data = await SchoolService.getAssessmentTypes();
        const configMap: Record<string, number> = {};
        data.forEach((item: AssessmentTypeConfig) => {
          configMap[item.assessmentType.toString()] = item.maxScore;
        });
        setAssessmentConfigs(configMap);
      } catch (error) {
        console.error("Failed to fetch assessment types:", error);
      }
    };

    fetchAssessmentConfigs();
  }, []);

  useEffect(() => {
    setSelectedSubject("");
    setStudents([]);
    setScores({});
    setValidationErrors({});
  }, [classId, subjects]);

  useEffect(() => {
    if (!selectedSubject || !selectedAccount) return;

    setLoading(true);
    fetchStudentScoresBySubject({
      selectedAccount,
      classId,
      subjectId: selectedSubject,
      schoolSession,
      schoolTerm,
    })
      .then((data) => {
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
        setValidationErrors({});
      })
      .finally(() => setLoading(false));
  }, [selectedSubject, selectedAccount]);

  const getAssessmentMaxScore = (assessmentName: string): number | null => {
    // Find the assessment type from the assessment name
    // This assumes assessmentName matches the enum display name
    const configKey = Object.keys(assessmentConfigs).find((key) => {
      // Check if the assessment type name matches or contains the assessment name
      const enumItem = enums?.AssessmentType?.find(
        (e: any) => e.value === parseInt(key)
      );
      const enumName = enumItem?.displayName || enumItem?.name || "";
      return (
        enumName.toLowerCase() === assessmentName.toLowerCase() ||
        assessmentName.toLowerCase().includes(enumName.toLowerCase()) ||
        enumName.toLowerCase().includes(assessmentName.toLowerCase())
      );
    });

    if (configKey) {
      return assessmentConfigs[configKey];
    }

    // Fallback: try to match by common names
    const lowerName = assessmentName.toLowerCase();
    if (lowerName.includes("test")) return assessmentConfigs["1"] || null; // Assuming Test is type 1
    if (lowerName.includes("exam")) return assessmentConfigs["2"] || null; // Assuming Exam is type 2
    if (lowerName.includes("assignment")) return assessmentConfigs["3"] || null;
    if (lowerName.includes("project")) return assessmentConfigs["4"] || null;

    return null;
  };

  const handleScoreChange = (
    studentId: string,
    assessmentId: string,
    assessmentName: string,
    value: string
  ) => {
    // Clear validation error for this field
    setValidationErrors((prev) => ({
      ...prev,
      [studentId]: {
        ...(prev[studentId] || {}),
        [assessmentId]: "",
      },
    }));

    // Update score
    setScores((prev) => ({
      ...prev,
      [studentId]: prev[studentId].map((s) =>
        s.subjectAssessmentId === assessmentId
          ? { ...s, score: value === "" ? null : Number(value) }
          : s
      ),
    }));
  };

  const handleValidateAndSubmit = () => {
    const errors: Record<string, Record<string, string>> = {};
    let hasErrors = false;

    // Validate each student's scores
    students.forEach((student) => {
      const studentScores = scores[student.id] || [];
      studentScores.forEach((score) => {
        if (score.score !== null && score.score !== undefined) {
          const maxScore = getAssessmentMaxScore(score.assessmentName);
          if (maxScore !== null && score.score > maxScore) {
            if (!errors[student.id]) errors[student.id] = {};
            errors[student.id][score.subjectAssessmentId] =
              `${score.assessmentName} score (${score.score}) exceeds maximum of ${maxScore}`;
            hasErrors = true;
          }
        }
      });
    });

    setValidationErrors(errors);

    if (hasErrors) {
      // Scroll to the first error
      const firstErrorElement = document.querySelector(
        ".score-error"
      );
      if (firstErrorElement) {
        firstErrorElement.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

  // Submit if no errors
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

  const { enums } = useEnums({ fetchPermissionData: false });

  const assessmentHeaders =
    students.length > 0 ? (scores[students[0].id] ?? []) : [];

  // Check if any score is being edited
  const hasEdits = Object.values(scores).some((studentScores) =>
    studentScores.some((s) => s.score !== null)
  );

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
            sx={{
              bgcolor: theme.palette.background.default,
              borderRadius: 2,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            }}
          >
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell
                    sx={{
                      fontWeight: 700,
                      fontSize: "0.8rem",
                      color: theme.palette.text.secondary,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      borderBottom: `2px solid ${theme.palette.primary.main}`,
                    }}
                  >
                    Student
                  </TableCell>
                  {assessmentHeaders.map((a) => {
                    const maxScore = getAssessmentMaxScore(a.assessmentName);
                    return (
                      <TableCell
                        key={a.subjectAssessmentId}
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.8rem",
                          color: theme.palette.text.secondary,
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          bgcolor: alpha(theme.palette.primary.main, 0.04),
                          borderBottom: `2px solid ${theme.palette.primary.main}`,
                          textAlign: "center",
                        }}
                      >
                        {a.assessmentName}
                        {maxScore && (
                          <Typography
                            component="span"
                            sx={{
                              display: "block",
                              fontSize: "0.6rem",
                              fontWeight: 400,
                              color: theme.palette.text.disabled,
                              mt: 0.5,
                            }}
                          >
                            Max: {maxScore}
                          </Typography>
                        )}
                      </TableCell>
                    );
                  })}
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
                        whiteSpace: "nowrap",
                      }}
                    >
                      {s.name}
                    </TableCell>

                    {scores[s.id]?.map((a) => {
                      const maxScore = getAssessmentMaxScore(a.assessmentName);
                      const error = validationErrors[s.id]?.[a.subjectAssessmentId];
                      const hasError = !!error;

                      return (
                        <TableCell key={a.subjectAssessmentId}>
                          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
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
                                  a.assessmentName,
                                  e.target.value
                                )
                              }
                              inputProps={{
                                min: 0,
                                max: maxScore || 100,
                                inputMode: "numeric",
                                pattern: "[0-9]*",
                              }}
                              sx={{
                                width: "80px",
                                "& input": {
                                  textAlign: "center",
                                  fontSize: "1.1rem",
                                  fontWeight: 600,
                                  padding: "8px 4px",
                                  color: hasError ? theme.palette.error.main : "inherit",
                                },
                                "& input::-webkit-outer-spin-button, & input::-webkit-inner-spin-button":
                                {
                                  WebkitAppearance: "none",
                                  margin: 0,
                                },
                                "& input[type=number]": {
                                  MozAppearance: "textfield",
                                },
                                "& .MuiOutlinedInput-root": {
                                  "& fieldset": {
                                    borderColor: hasError
                                      ? theme.palette.error.main
                                      : "inherit",
                                    borderWidth: hasError ? 2 : 1,
                                  },
                                  "&:hover fieldset": {
                                    borderColor: hasError
                                      ? theme.palette.error.main
                                      : theme.palette.primary.main,
                                  },
                                },
                              }}
                            />
                            {hasError && (
                              <Box
                                className="score-error"
                                sx={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: 0.5,
                                  mt: 0.5,
                                  p: 0.5,
                                  bgcolor: alpha(theme.palette.error.main, 0.08),
                                  borderRadius: 1,
                                  maxWidth: "160px",
                                }}
                              >
                                <IconifyIcon
                                  icon="mdi:alert-circle-outline"
                                  width={14}
                                  color={theme.palette.error.main}
                                />
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: theme.palette.error.main,
                                    fontSize: "0.6rem",
                                    fontWeight: 500,
                                  }}
                                >
                                  Max: {maxScore}
                                </Typography>
                              </Box>
                            )}
                          </Box>
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mt: 2,
              flexWrap: "wrap",
              gap: 2,
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {students.length} student(s) loaded
            </Typography>

            <Button
              variant="contained"
              color="primary"
              onClick={handleValidateAndSubmit}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 600,
                px: 4,
                boxShadow: "none",
                "&:hover": {
                  boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                },
              }}
            >
              Submit Scores
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default ScoreInputComponent;