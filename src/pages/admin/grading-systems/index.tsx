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
  CircularProgress,
  alpha,
} from "@mui/material";
import { useAuth } from "../../../context";
import { fetchClasses } from "../../../api/classServices";
import {
  fetchGradingSystemByClass,
  saveGradingSystem,
} from "../../../api/gradeServices";

const GradingSystem: React.FC = () => {
  const { selectedAccount } = useAuth();

  const [classes, setClasses] = useState<{ value: string; label: string }[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [rows, setRows] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasEdits, setHasEdits] = useState(false);

  /* ------------------ TABLE COLUMNS ------------------ */
  // Only `descriptor` is editable. Everything else is read-only,
  // so teachers/admins can tweak the wording without changing
  // the numeric boundaries or grade names.
  const columns: Column[] = [
    {
      key: "lowerBound",
      label: "Lower Boundary Mark",
      type: "number",
      width: 150,
      readOnly: true,
    },
    {
      key: "upperBound",
      label: "Upper Boundary Mark",
      type: "number",
      width: 150,
      readOnly: true,
    },
    {
      key: "gradeName",
      label: "Grade Name",
      width: 150,
      readOnly: true,
    },
    {
      key: "gradeRemark",
      label: "Grade Remark",
      width: 150,
      readOnly: true,
    },
    {
      key: "gradePoint",
      label: "Grade Point",
      type: "number",
      width: 150,
      readOnly: true,
    },
    {
      key: "descriptor",
      label: "Grade Descriptor",
      width: 500,
      // editable
    },
  ];

  /* ------------------ FETCH CLASSES ON LOAD ------------------ */
  useEffect(() => {
    if (!selectedAccount) return;

    let cancelled = false;
    setLoadingClasses(true);

    fetchClasses(selectedAccount)
      .then((res) => {
        if (cancelled) return;
        const mapped = res.map((c: any) => ({
          value: c.id,
          label: c.className,
        }));
        setClasses(mapped);

        // Auto-select the first class so the page is useful
        // immediately without an extra click.
        if (mapped.length > 0) {
          setSelectedClass(mapped[0].value);
        }
      })
      .catch((err) => {
        console.error("Failed to load classes", err);
      })
      .finally(() => {
        if (!cancelled) setLoadingClasses(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedAccount]);

  /* ------------------ LOAD GRADING SYSTEM WHEN CLASS CHANGES ------------------ */
  useEffect(() => {
    if (!selectedClass || !selectedAccount) return;

    let cancelled = false;
    setLoadingGrades(true);
    setHasEdits(false);

    fetchGradingSystemByClass(selectedAccount, selectedClass)
      .then((grades) => {
        if (cancelled) return;
        setRows(grades ?? []);
      })
      .catch((error) => {
        if (cancelled) return;
        console.error("Failed to load grading system", error);
        setRows([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingGrades(false);
      });

    return () => {
      cancelled = true;
    };
  }, [selectedClass, selectedAccount]);

  /* ------------------ SAVE DESCRIPTOR EDITS ------------------ */
  const handleSave = async () => {
    if (!selectedClass || !selectedAccount) return;

    setSaving(true);
    try {
      await saveGradingSystem(selectedAccount, {
        classId: selectedClass,
        grades: rows,
      });
      setHasEdits(false);
      alert("Grading system saved successfully");
    } catch (error) {
      console.error("Failed to save grading system", error);
      alert("Failed to save grading system");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Grading System Settings
      </Typography>

      {/* CLASS SELECTOR */}
      <Box sx={{ maxWidth: 300, mb: 3 }}>
        <FormControl fullWidth disabled={loadingClasses}>
          <InputLabel>Select Class</InputLabel>
          <Select
            value={selectedClass}
            label="Select Class"
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            {classes.map((cls) => (
              <MenuItem key={cls.value} value={cls.value}>
                {cls.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {/* TABLE */}
      {loadingGrades ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 200,
          }}
        >
          <CircularProgress />
        </Box>
      ) : rows.length === 0 ? (
        <Box
          sx={(theme) => ({
            p: 3,
            borderRadius: 2,
            bgcolor: alpha(theme.palette.info.main, 0.08),
            color: theme.palette.info.dark,
          })}
        >
          <Typography variant="body2">
            No grading system found for this class. Contact your administrator
            to set one up.
          </Typography>
        </Box>
      ) : (
        <>
          <EditableTable
            columns={columns}
            rows={rows}
            onChange={(updated) => {
              setRows(updated);
              setHasEdits(true);
            }}
          />

          <Box sx={{ mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              disabled={!hasEdits || saving}
              onClick={handleSave}
              startIcon={
                saving ? <CircularProgress size={16} color="inherit" /> : undefined
              }
            >
              {saving ? "Saving…" : "Save Changes"}
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
};

export default GradingSystem;