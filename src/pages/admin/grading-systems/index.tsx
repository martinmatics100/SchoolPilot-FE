import React, { useEffect, useState } from "react";
import EditableTable, { type Column } from "../../../components/editable-table";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
} from "@mui/material";
import { useAuth } from "../../../context";
import { fetchClasses } from "../../../api/classServices";
import {
  fetchGradingSystemByClass,
  saveGradingSystem,
} from "../../../api/gradeServices";

const GradingSystem: React.FC = () => {
  const { selectedAccount } = useAuth();

  const [classes, setClasses] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [showTable, setShowTable] = useState(false);
  const [rows, setRows] = useState<any[]>([]);

  /* ------------------ TABLE COLUMNS ------------------ */
  const columns: Column[] = [
    {
      key: "lowerBound",
      label: "Lower Boundary Mark",
      type: "number",
      width: 150,
    },
    {
      key: "upperBound",
      label: "Upper Boundary Mark",
      type: "number",
      width: 150,
    },
    { key: "gradeName", label: "Grade Name", width: 150 },
    { key: "gradeRemark", label: "Grade Remark", width: 150 },
    { key: "gradePoint", label: "Grade Point", type: "number", width: 150 },
    { key: "descriptor", label: "Grade Descriptor", width: 500 },
  ];

  /* ------------------ FETCH CLASSES ON LOAD ------------------ */
  useEffect(() => {
    if (!selectedAccount) return;

    fetchClasses(selectedAccount).then((res) => {
      setClasses(
        res.map((c: any) => ({
          value: c.id,
          label: c.className,
        })),
      );
    });
  }, [selectedAccount]);

  /* ------------------ VIEW GRADING SYSTEM ------------------ */
  const handleView = async () => {
    if (!selectedClass || !selectedAccount) return;

    try {
      const grades = await fetchGradingSystemByClass(
        selectedAccount,
        selectedClass,
      );

      setRows(grades); // empty array if none exists
      setShowTable(true);
    } catch (error) {
      console.error("Failed to load grading system", error);
      setRows([]);
      setShowTable(true);
    }
  };

  const handleSave = async () => {
    if (!selectedClass || !selectedAccount) return;

    try {
      await saveGradingSystem(selectedAccount, {
        classId: selectedClass,
        grades: rows,
      });

      alert("Grading system saved successfully");
    } catch (error) {
      console.error("Failed to save grading system", error);
      alert("Failed to save grading system");
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Grading System Settings
      </Typography>

      {/* CLASS SELECTOR */}
      <Box sx={{ maxWidth: 300, mb: 2 }}>
        <FormControl fullWidth>
          <InputLabel>Select Class</InputLabel>
          <Select
            value={selectedClass}
            label="Select Class"
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setShowTable(false);
            }}
          >
            {classes.map((cls) => (
              <MenuItem key={cls.value} value={cls.value}>
                {cls.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* VIEW BUTTON */}
      <Button
        variant="contained"
        disabled={!selectedClass}
        sx={{ mb: 3 }}
        onClick={handleView}
      >
        View Grading System
      </Button>

      {/* TABLE + SAVE BUTTON (ONLY AFTER VIEW CLICK) */}
      {showTable && (
        <>
          <EditableTable
            columns={columns}
            rows={rows}
            onChange={(updated) => setRows(updated)}
          />

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              disabled={!rows.length}
              onClick={handleSave}
            >
              Save Grading System
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default GradingSystem;
