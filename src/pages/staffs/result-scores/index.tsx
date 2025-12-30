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

const ScoreInput: React.FC = () => {
  const { selectedAccount } = useAuth();
  const { enums } = useEnums({ fetchPermissionData: false });

  const [classes, setClasses] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState("");

  const [schoolSession, setSchoolSession] = useState<number | null>(null);
  const [schoolTerm, setSchoolTerm] = useState<number | null>(null);

  /* Get current session & term */
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
    if (!selectedClass || !enums) return;

    fetchTeacherSubjectsByClass(selectedAccount, selectedClass).then((data) => {
      const mapped = data.map((s: any) => {
        const enumItem = enums.AcademicSubjects?.find(
          (e: any) => String(e.value) === String(s.subject)
        );

        return {
          id: s.subjectId,
          name: enumItem?.displayName || enumItem?.name,
        };
      });

      setSubjects(mapped);
    });
  }, [selectedClass, selectedAccount, enums]);

  const handleSubmit = (scores: any) => {
    console.log("Scores submitted:", scores);
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

      {selectedClass && subjects.length > 0 && schoolSession && schoolTerm && (
        <ScoreInputComponent
          key={selectedClass}
          students={[]} // populated after subject select
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
