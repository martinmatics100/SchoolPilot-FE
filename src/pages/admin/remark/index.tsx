import React, { useEffect, useState, useMemo } from "react";
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
  Paper,
  Card,
  CardContent,
  Stack,
  Avatar,
  Chip,
  Divider,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import EditNoteIcon from "@mui/icons-material/EditNote";
import SaveIcon from "@mui/icons-material/Save";
import ClassIcon from "@mui/icons-material/Class";
import { useAuth } from "../../../context";
import { fetchClasses } from "../../../api/classServices";
import {
  fetchGradingSystemByClass,
  saveGradingSystem,
} from "../../../api/gradeServices";

const GradingSystem: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { selectedAccount } = useAuth();

  const [classes, setClasses] = useState<{ value: string; label: string }[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>("");
  const [rows, setRows] = useState<any[]>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const [loadingGrades, setLoadingGrades] = useState(false);
  const [saving, setSaving] = useState(false);
  const [hasEdits, setHasEdits] = useState(false);

  /* ------------------ TABLE COLUMNS ------------------ */
  // Only `descriptor` is editable. Boundaries are shown read-only so
  // teachers can see the range each remark applies to but can't
  // change the numeric breakpoints.
  const columns: Column[] = useMemo(
    () => [
      {
        key: "lowerBound",
        label: "Lower Bound",
        type: "number",
        width: 120,
        readOnly: true,
      },
      {
        key: "upperBound",
        label: "Upper Bound",
        type: "number",
        width: 120,
        readOnly: true,
      },
      {
        key: "descriptor",
        label: "Remark for this range",
        width: 600,
        // editable
      },
    ],
    []
  );

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
        if (mapped.length > 0) setSelectedClass(mapped[0].value);
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
        remarks: rows,
      });
      setHasEdits(false);
      alert("Remarks saved successfully");
    } catch (error) {
      console.error("Failed to save remarks", error);
      alert("Failed to save remarks");
    } finally {
      setSaving(false);
    }
  };

  /* ------------------ ENUM LABEL LOOKUP ------------------ */
  const selectedClassLabel =
    classes.find((c) => c.value === selectedClass)?.label ?? "Class";

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        bgcolor: theme.palette.background.default,
        minHeight: "85vh",
      }}
    >
      {/* Header card */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 3,
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${alpha(
            theme.palette.primary.dark,
            0.9
          )} 100%)`,
          color: theme.palette.primary.contrastText,
        }}
      >
        <CardContent>
          <Stack
            direction={isMobile ? "column" : "row"}
            spacing={2}
            alignItems={isMobile ? "flex-start" : "center"}
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Avatar sx={{ bgcolor: alpha(theme.palette.common.white, 0.2) }}>
                <EditNoteIcon />
              </Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  Grade Remarks
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Set the remark that flows into report cards for each score
                  range.
                </Typography>
              </Box>
            </Stack>

            <Chip
              label={`${rows.length} range${rows.length === 1 ? "" : "s"}`}
              sx={{
                bgcolor: alpha(theme.palette.common.white, 0.2),
                color: "inherit",
                fontWeight: 600,
              }}
            />
          </Stack>
        </CardContent>
      </Card>

      {/* Class selector + Save button */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          mb: 3,
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.background.default,
        }}
      >
        <Stack
          direction={isMobile ? "column" : "row"}
          spacing={2}
          alignItems={isMobile ? "stretch" : "center"}
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1} alignItems="center" sx={{ flex: 1 }}>
            <ClassIcon sx={{ color: theme.palette.text.secondary }} />
            <FormControl
              fullWidth
              size="small"
              disabled={loadingClasses || classes.length === 0}
              sx={{ maxWidth: isMobile ? "100%" : 320 }}
            >
              <InputLabel>Select Class</InputLabel>
              <Select
                value={selectedClass}
                label="Select Class"
                onChange={(e) => setSelectedClass(e.target.value)}
              >
                {classes.length === 0 ? (
                  <MenuItem value="" disabled>
                    No classes available
                  </MenuItem>
                ) : (
                  classes.map((cls) => (
                    <MenuItem key={cls.value} value={cls.value}>
                      {cls.label}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Stack>

          <Button
            variant="contained"
            color="primary"
            disabled={!hasEdits || saving}
            onClick={handleSave}
            startIcon={
              saving ? (
                <CircularProgress size={16} color="inherit" />
              ) : (
                <SaveIcon />
              )
            }
            sx={{
              minWidth: isMobile ? "100%" : 160,
              textTransform: "none",
              fontWeight: 600,
              borderRadius: 2,
            }}
          >
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </Stack>
      </Paper>

      {/* Content */}
      {loadingGrades ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: 240,
          }}
        >
          <CircularProgress />
        </Box>
      ) : rows.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 4,
            borderRadius: 2,
            border: `1px dashed ${theme.palette.divider}`,
            textAlign: "center",
            bgcolor: theme.palette.background.default,
          }}
        >
          <Typography color="text.secondary">
            No grading ranges found for{" "}
            <Typography component="span" fontWeight={600}>
              {selectedClassLabel}
            </Typography>
            . Contact your administrator to set one up.
          </Typography>
        </Paper>
      ) : (
        <>
          <Paper
            elevation={0}
            sx={{
              borderRadius: 2,
              border: `1px solid ${theme.palette.divider}`,
              overflow: "hidden",
              bgcolor: theme.palette.background.default,
            }}
          >
            <Box
              sx={{
                px: { xs: 2, sm: 3 },
                py: 1.5,
                borderBottom: `1px solid ${theme.palette.divider}`,
                bgcolor: alpha(theme.palette.primary.main, 0.04),
              }}
            >
              <Typography
                variant="subtitle2"
                fontWeight={700}
                sx={{
                  color: theme.palette.text.secondary,
                  textTransform: "uppercase",
                  letterSpacing: 0.5,
                  fontSize: 12,
                }}
              >
                {selectedClassLabel} · Remarks per score range
              </Typography>
            </Box>

            <EditableTable
              columns={columns}
              rows={rows}
              onChange={(updated) => {
                setRows(updated);
                setHasEdits(true);
              }}
            />

            <Divider />

            <Box
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "flex-end",
                bgcolor: alpha(theme.palette.background.default, 0.5),
              }}
            >
              <Button
                variant="contained"
                color="primary"
                disabled={!hasEdits || saving}
                onClick={handleSave}
                startIcon={
                  saving ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : (
                    <SaveIcon />
                  )
                }
                sx={{
                  minWidth: 180,
                  textTransform: "none",
                  fontWeight: 600,
                  borderRadius: 2,
                }}
              >
                {saving ? "Saving…" : "Save Changes"}
              </Button>
            </Box>
          </Paper>

          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 2,
              color: theme.palette.text.secondary,
              textAlign: "center",
            }}
          >
            Only the remark text can be edited. Score boundaries are fixed by
            your administrator.
          </Typography>
        </>
      )}
    </Box>
  );
};

export default GradingSystem;