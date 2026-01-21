import React, { useEffect, useState } from "react";
import { Box, MenuItem, TextField } from "@mui/material";
import ScoreInputComponent from "../../../components/score-input";
import {
  fetchTeacherClasses,
  fetchTeacherSubjectsByClass,
} from "../../../api/classServices";
import { SchoolService } from "../../../api/schoolService";
import { useAuth } from "../../../context";
import { useEnums } from "../../../hooks/useEnums";
import { saveClassStudentScores } from "../../../api/studentService";

const ScoreInput: React.FC = () => {
  const { selectedAccount } = useAuth();
  const { enums } = useEnums({ fetchPermissionData: false });

  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");

  const [schoolSession, setSchoolSession] = useState<number | null>(null);
  const [schoolTerm, setSchoolTerm] = useState<number | null>(null);

  useEffect(() => {
    SchoolService.getSchoolDetails().then((data) => {
      if (!data) return;
      setSchoolSession(data.currentSession);
      setSchoolTerm(data.currentTerm);
    });
  }, []);

  useEffect(() => {
    if (!selectedAccount) return;
    fetchTeacherClasses(selectedAccount).then(setClasses);
  }, [selectedAccount]);

  useEffect(() => {
    if (!selectedClass || !selectedAccount) return;

    fetchTeacherSubjectsByClass(selectedAccount, selectedClass).then(
      (items) => {
        const mapped = items.map((x: any) => {
          const enumItem = enums.AcademicSubjects?.find(
            (e: any) => e.value === x.subject
          );

          return {
            id: x.subjectId,
            name: enumItem?.name ?? "Subject",
          };
        });

        setSubjects(mapped);
      }
    );
  }, [selectedClass, selectedAccount, enums.AcademicSubjects]);

  const handleSubmit = async (payload: any) => {
    try {
      await saveClassStudentScores(selectedAccount, payload);
      alert("Scores saved successfully");
    } catch (err) {
      console.error(err);
      alert("Failed to save scores");
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <TextField
        select
        fullWidth
        label="Select Class"
        value={selectedClass}
        onChange={(e) => setSelectedClass(e.target.value)}
        sx={{ mb: 3 }}
      >
        {classes.map((c) => (
          <MenuItem key={c.classId} value={c.classId}>
            {c.className}
          </MenuItem>
        ))}
      </TextField>

      {selectedClass && schoolSession !== null && schoolTerm !== null && (
        <ScoreInputComponent
          subjects={subjects}
          classId={selectedClass}
          schoolSession={schoolSession}
          schoolTerm={schoolTerm}
          onSubmit={handleSubmit}
        />
      )}
    </Box>
  );
};

export default ScoreInput;
