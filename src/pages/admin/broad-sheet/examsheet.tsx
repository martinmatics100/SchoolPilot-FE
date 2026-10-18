import React, { useEffect, useState } from "react";
import {
  Box,
  FormControl,
  MenuItem,
  Select,
  Typography,
  Paper,
  alpha,
  useTheme,
  Fade,
  Chip,
} from "@mui/material";
import BroadsheetTable from "../../../components/broad-sheetTable";
import { useEnums } from "../../../hooks/useEnums";
import { useAuth } from "../../../context";
import {
  fetchClasses,
  fetchClassBroadsheet,
  downloadClassBroadsheet,
} from "../../../api/classServices";
import { ActionButton } from "../../../components/action-button";
import IconifyIcon from "../../../components/base/iconifyIcon";

const ExampleBroadsheetPage = () => {
  const theme = useTheme();
  const { enums, isLoading } = useEnums({ fetchPermissionData: false });
  const { apiClient, selectedAccount } = useAuth();

  const [classes, setClasses] = useState<{ value: string; label: string }[]>([]);
  const [sessions, setSessions] = useState<{ value: string; label: string }[]>([]);
  const [terms, setTerms] = useState<{ value: string; label: string }[]>([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");

  const [subjects, setSubjects] = useState<string[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showBroadsheet, setShowBroadsheet] = useState(false);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!selectedAccount) return;
    fetchClasses(selectedAccount).then((res) => {
      setClasses(
        (res || []).map((c: any) => ({
          value: c.id,
          label: c.className,
        }))
      );
    });
  }, [selectedAccount]);

  useEffect(() => {
    if (isLoading || !enums) return;
    setSessions(
      (enums.SchoolSessions || []).map((s: any) => ({
        value: String(s.value),
        label: s.displayName || s.name,
      }))
    );
    setTerms(
      (enums.SchoolTerms || []).map((t: any) => ({
        value: String(t.value),
        label: t.displayName || t.name,
      }))
    );
  }, [isLoading, enums]);

  const readyToView = selectedClass && selectedSession && selectedTerm;

  const handleViewBroadsheet = async () => {
    try {
      setLoadingSheet(true);
      const response = await fetchClassBroadsheet(apiClient, {
        classId: selectedClass,
        schoolSession: Number(selectedSession),
        schoolTerm: Number(selectedTerm),
      });
      const data = response?.data ?? response;
      const subjectLabels = (data.subjects || []).map((subjectValue: number) => {
        const enumMatch = enums?.AcademicSubjects?.find(
          (e: any) => e.value === subjectValue
        );
        return enumMatch?.displayName || enumMatch?.name || String(subjectValue);
      });
      setSubjects(subjectLabels);
      setStudents(data.students || []);
      setShowBroadsheet(true);
    } catch (err) {
      console.error("Failed to load broadsheet", err);
    } finally {
      setLoadingSheet(false);
    }
  };

  const handleDownloadPdf = async () => {
    if (!selectedClass || !selectedSession || !selectedTerm) return;

    try {
      setIsDownloading(true);

      const blob = await downloadClassBroadsheet(apiClient, {
        classId: selectedClass,
        schoolSession: Number(selectedSession),
        schoolTerm: Number(selectedTerm),
      });

      // Build a friendly filename
      const className =
        classes.find((c) => c.value === selectedClass)?.label || "Class";
      const sessionLabel =
        sessions.find((s) => s.value === selectedSession)?.label || "";
      const termLabel =
        terms.find((t) => t.value === selectedTerm)?.label || "";

      const safeName = `${className}_${sessionLabel}_${termLabel}_Broadsheet`
        .replace(/[^\w\-]+/g, "_")
        .replace(/_+/g, "_");

      // Trigger browser download
      const url = window.URL.createObjectURL(
        new Blob([blob], { type: "application/pdf" })
      );
      const link = document.createElement("a");
      link.href = url;
      link.download = `${safeName}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Cleanup
      setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    } catch (err) {
      console.error("Failed to download broadsheet", err);
    } finally {
      setIsDownloading(false);
    }
  };

  if (isLoading) return null;

  const selectedClassLabel = classes.find((c) => c.value === selectedClass)?.label;
  const selectedSessionLabel = sessions.find((s) => s.value === selectedSession)?.label;
  const selectedTermLabel = terms.find((t) => t.value === selectedTerm)?.label;

  const hasSelections = selectedClass || selectedSession || selectedTerm;

  return (
    <Fade in timeout={400}>
      <Box
        sx={{
          minHeight: "100%",
          bgcolor: "background.default",
          p: { xs: 1.5, sm: 2, md: 3 },
        }}
      >
        <Box sx={{ maxWidth: "1400px", mx: "auto" }}>
          {/* Header */}
          <Box sx={{ mb: 2.5 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 700,
                color: "text.primary",
                fontSize: { xs: "1.25rem", sm: "1.5rem" },
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <IconifyIcon
                icon="mdi:table-document"
                width={28}
                color={theme.palette.primary.main}
              />
              Class Broadsheet
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: "text.secondary", mt: 0.5 }}
            >
              Generate and export student performance reports
            </Typography>
          </Box>

          {/* Filter Bar */}
          <Paper
            elevation={0}
            sx={{
              borderRadius: 3,
              bgcolor: "background.default",
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              overflow: "auto",
              mb: 2.5,
              whiteSpace: "nowrap",
            }}
          >
            <Box
              sx={{
                display: "inline-flex",
                alignItems: "center",
                gap: 1,
                p: 1.5,
                flexWrap: "nowrap",
              }}
            >
              {/* Class Select */}
              <FormControl
                size="small"
                sx={{ minWidth: { xs: 140, sm: 160 }, width: "auto" }}
              >
                <Select
                  value={selectedClass}
                  onChange={(e) => {
                    setSelectedClass(e.target.value);
                    setShowBroadsheet(false);
                  }}
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) {
                      return (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <IconifyIcon
                            icon="mdi:school-outline"
                            width={16}
                            color={theme.palette.text.secondary}
                          />
                          <Typography
                            variant="body2"
                            sx={{ color: "text.secondary" }}
                          >
                            Class
                          </Typography>
                        </Box>
                      );
                    }
                    const item = classes.find((c) => c.value === selected);
                    return (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <IconifyIcon
                          icon="mdi:school-outline"
                          width={16}
                          color={theme.palette.primary.main}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item?.label}
                        </Typography>
                      </Box>
                    );
                  }}
                  sx={{
                    "& .MuiSelect-select": { py: 1, pr: 4 },
                    "& fieldset": {
                      borderColor: alpha(theme.palette.divider, 0.5),
                    },
                  }}
                >
                  {classes.map((cls) => (
                    <MenuItem key={cls.value} value={cls.value}>
                      {cls.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <IconifyIcon
                icon="mdi:chevron-right"
                width={16}
                color={theme.palette.text.disabled}
              />

              {/* Session Select */}
              <FormControl
                size="small"
                sx={{ minWidth: { xs: 140, sm: 160 }, width: "auto" }}
              >
                <Select
                  value={selectedSession}
                  disabled={!selectedClass}
                  onChange={(e) => {
                    setSelectedSession(e.target.value);
                    setSelectedTerm("");
                    setShowBroadsheet(false);
                  }}
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) {
                      return (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <IconifyIcon
                            icon="mdi:calendar-outline"
                            width={16}
                            color={theme.palette.text.secondary}
                          />
                          <Typography
                            variant="body2"
                            sx={{ color: "text.secondary" }}
                          >
                            Session
                          </Typography>
                        </Box>
                      );
                    }
                    const item = sessions.find((s) => s.value === selected);
                    return (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <IconifyIcon
                          icon="mdi:calendar-outline"
                          width={16}
                          color={theme.palette.primary.main}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item?.label}
                        </Typography>
                      </Box>
                    );
                  }}
                  sx={{
                    "& .MuiSelect-select": { py: 1, pr: 4 },
                    "& fieldset": {
                      borderColor: alpha(theme.palette.divider, 0.5),
                    },
                  }}
                >
                  {sessions.map((s) => (
                    <MenuItem key={s.value} value={s.value}>
                      {s.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <IconifyIcon
                icon="mdi:chevron-right"
                width={16}
                color={theme.palette.text.disabled}
              />

              {/* Term Select */}
              <FormControl
                size="small"
                sx={{ minWidth: { xs: 140, sm: 160 }, width: "auto" }}
              >
                <Select
                  value={selectedTerm}
                  disabled={!selectedSession}
                  onChange={(e) => {
                    setSelectedTerm(e.target.value);
                    setShowBroadsheet(false);
                  }}
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) {
                      return (
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 0.5,
                          }}
                        >
                          <IconifyIcon
                            icon="mdi:flag-outline"
                            width={16}
                            color={theme.palette.text.secondary}
                          />
                          <Typography
                            variant="body2"
                            sx={{ color: "text.secondary" }}
                          >
                            Term
                          </Typography>
                        </Box>
                      );
                    }
                    const item = terms.find((t) => t.value === selected);
                    return (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <IconifyIcon
                          icon="mdi:flag-outline"
                          width={16}
                          color={theme.palette.primary.main}
                        />
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {item?.label}
                        </Typography>
                      </Box>
                    );
                  }}
                  sx={{
                    "& .MuiSelect-select": { py: 1, pr: 4 },
                    "& fieldset": {
                      borderColor: alpha(theme.palette.divider, 0.5),
                    },
                  }}
                >
                  {terms.map((t) => (
                    <MenuItem key={t.value} value={t.value}>
                      {t.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              {/* Generate Button */}
              <ActionButton
                onClick={handleViewBroadsheet}
                disabled={!readyToView || loadingSheet}
                loading={loadingSheet}
                variant="outlined"
                color="primary"
                size="small"
                startIcon={<IconifyIcon icon="mdi:eye-outline" width={16} />}
                sx={{ minWidth: "auto", px: 2, whiteSpace: "nowrap" }}
              >
                Generate
              </ActionButton>
            </Box>
          </Paper>

          {/* Selection Chips */}
          {hasSelections && (
            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 1,
                mb: 2.5,
                p: 1,
                bgcolor: alpha(theme.palette.background.default, 0.02),
                borderRadius: 2,
              }}
            >
              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Selected:
              </Typography>
              {selectedClass && (
                <Chip
                  label={selectedClassLabel}
                  size="small"
                  onDelete={() => {
                    setSelectedClass("");
                    setSelectedSession("");
                    setSelectedTerm("");
                    setShowBroadsheet(false);
                  }}
                  sx={{ height: 24 }}
                />
              )}
              {selectedSession && (
                <Chip
                  label={selectedSessionLabel}
                  size="small"
                  onDelete={() => {
                    setSelectedSession("");
                    setSelectedTerm("");
                    setShowBroadsheet(false);
                  }}
                  sx={{ height: 24 }}
                />
              )}
              {selectedTerm && (
                <Chip
                  label={selectedTermLabel}
                  size="small"
                  onDelete={() => {
                    setSelectedTerm("");
                    setShowBroadsheet(false);
                  }}
                  sx={{ height: 24 }}
                />
              )}
              {readyToView && (
                <Chip
                  icon={<IconifyIcon icon="mdi:check-circle" width={14} />}
                  label="Ready to view"
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ height: 24 }}
                />
              )}
            </Box>
          )}

          {/* Action Buttons: Download PDF */}
          {showBroadsheet && (
            <Fade in timeout={300}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 1.5,
                  mb: 2.5,
                  flexWrap: "wrap",
                }}
              >
                <ActionButton
                  onClick={handleDownloadPdf}
                  disabled={isDownloading}
                  loading={isDownloading}
                  variant="outlined"
                  color="primary"
                  size="small"
                  startIcon={
                    <IconifyIcon icon="mdi:file-pdf-box" width={16} />
                  }
                  sx={{
                    minWidth: "auto",
                    px: 2,
                    whiteSpace: "nowrap",
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                    background: `linear-gradient(135deg, ${theme.palette.background.default} 0%, ${theme.palette.background.default} 100%)`,
                  }}
                >
                  {isDownloading ? "Downloading..." : "Download PDF"}
                </ActionButton>
              </Box>
            </Fade>
          )}

          {/* Broadsheet Table */}
          {showBroadsheet && (
            <Fade in timeout={400}>
              <div>
                <BroadsheetTable
                  students={students}
                  subjects={subjects}
                  columnWidths={{ sn: 50, name: 280, subject: 60 }}
                />
              </div>
            </Fade>
          )}

          {/* Empty State */}
          {!showBroadsheet && (
            <Paper
              elevation={0}
              sx={{
                borderRadius: 3,
                bgcolor: "background.default",
                border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
                p: { xs: 3, sm: 4 },
                textAlign: "center",
              }}
            >
              <Box
                sx={{
                  width: 64,
                  height: 64,
                  mx: "auto",
                  mb: 2,
                  borderRadius: "50%",
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IconifyIcon
                  icon="mdi:table-search"
                  width={32}
                  color={theme.palette.primary.main}
                />
              </Box>
              <Typography variant="body1" sx={{ color: "text.secondary" }}>
                {!selectedClass
                  ? "Select a class to get started"
                  : !selectedSession
                    ? "Choose an academic session"
                    : !selectedTerm
                      ? "Select a term to view results"
                      : "Click Generate to view the broadsheet"}
              </Typography>
            </Paper>
          )}
        </Box>
      </Box>
    </Fade>
  );
};

export default ExampleBroadsheetPage;