import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import BroadsheetTable from "../../../components/broad-sheetTable";
import { useEnums } from "../../../hooks/useEnums";
import { useAuth } from "../../../context";
import {
  fetchClasses,
  fetchClassBroadsheet,
  printClassBroadsheet,
} from "../../../api/classServices";
import { CircularProgress } from "@mui/material";
import { ActionButton } from "../../../components/action-button";
import IconifyIcon from "../../../components/base/iconifyIcon";

const ExampleBroadsheetPage = () => {
  const { enums, isLoading } = useEnums({ fetchPermissionData: false });
  const { apiClient, selectedAccount } = useAuth();

  const [classes, setClasses] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [sessions, setSessions] = useState<{ value: string; label: string }[]>(
    [],
  );
  const [terms, setTerms] = useState<{ value: string; label: string }[]>([]);

  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSession, setSelectedSession] = useState("");
  const [selectedTerm, setSelectedTerm] = useState("");

  const [subjects, setSubjects] = useState<string[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [showBroadsheet, setShowBroadsheet] = useState(false);
  const [loadingSheet, setLoadingSheet] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);

  // Fetch classes
  useEffect(() => {
    if (!selectedAccount) return;

    fetchClasses(selectedAccount).then((res) => {
      setClasses(
        (res || []).map((c: any) => ({
          value: c.id,
          label: c.className,
        })),
      );
    });
  }, [selectedAccount]);

  // Load enums
  useEffect(() => {
    if (isLoading || !enums) return;

    setSessions(
      (enums.SchoolSessions || []).map((s: any) => ({
        value: String(s.value),
        label: s.displayName || s.name,
      })),
    );

    setTerms(
      (enums.SchoolTerms || []).map((t: any) => ({
        value: String(t.value),
        label: t.displayName || t.name,
      })),
    );
  }, [isLoading, enums]);

  const readyToView = selectedClass && selectedSession && selectedTerm;

  // VIEW BROADSHEET
  const handleViewBroadsheet = async () => {
    try {
      setLoadingSheet(true);

      const response = await fetchClassBroadsheet(apiClient, {
        classId: selectedClass,
        schoolSession: Number(selectedSession),
        schoolTerm: Number(selectedTerm),
      });

      const data = response?.data ?? response;

      // Map subject enum values → display names
      const subjectLabels = (data.subjects || []).map(
        (subjectValue: number) => {
          const enumMatch = enums?.AcademicSubjects?.find(
            (e: any) => e.value === subjectValue,
          );
          return (
            enumMatch?.displayName || enumMatch?.name || String(subjectValue)
          );
        },
      );

      setSubjects(subjectLabels);
      setStudents(data.students || []);
      setShowBroadsheet(true);
    } catch (err) {
      console.error("Failed to load broadsheet", err);
    } finally {
      setLoadingSheet(false);
    }
  };

  // Download CSV
  const handleDownload = () => {
    const header = [
      "S/N",
      "Student Name",
      ...subjects,
      "Total Subjects",
      "Total Obtainable",
      "Total Score",
      "Average",
      "Percentage",
      "PositionText",
      "Result Status",
    ].join(",");

    const rows = students.map((s, i) => {
      const scores = (s.subjects || []).map(
        (sub: any) => sub.totalScore ?? "-",
      );
      return [
        i + 1,
        s.studentName,
        ...scores,
        s.totalSubjects,
        s.totalObtainable,
        s.totalScore,
        s.average,
        s.percentage,
        s.position,
        s.resultStatus,
      ].join(",");
    });

    const csvContent = [header, ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "broadsheet.csv";
    link.click();
  };

  const handlePrint = async () => {
    try {
      setIsPrinting(true);
      const blob = await printClassBroadsheet(apiClient, {
        classId: selectedClass,
        schoolSession: Number(selectedSession),
        schoolTerm: Number(selectedTerm),
      });

      const url = window.URL.createObjectURL(blob);

      // 1. Create the iframe
      const iframe = document.createElement("iframe");

      // 2. Instead of display: none, use visibility: hidden 
      // Some browsers won't render/print a 0-pixel or display:none element correctly
      iframe.style.position = 'fixed';
      iframe.style.right = '0';
      iframe.style.bottom = '0';
      iframe.style.width = '0';
      iframe.style.height = '0';
      iframe.style.border = '0';
      iframe.src = url;

      document.body.appendChild(iframe);

      iframe.onload = () => {
        // 3. Give the PDF a tiny bit of time to internalize in the iframe
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();

          setIsPrinting(false);

          // 4. IMPORTANT: Wait longer before cleanup
          // We wait for the user to interact with the print dialog
          // Re-checking every second if the window is still focused is overkill,
          // so we just give it a generous 2-minute window or wait for focus to return.
          const focusHandler = () => {
            window.removeEventListener('focus', focusHandler);
            setTimeout(() => {
              window.URL.revokeObjectURL(url);
              document.body.removeChild(iframe);
            }, 500);
          };
          window.addEventListener('focus', focusHandler);
        }, 500);
      };
    } catch (err) {
      console.error("Failed to print broadsheet", err);
      setIsPrinting(false);
    }
  };

  if (isLoading) return null;

  return (
    <Box sx={{ p: 2 }}>
      {/* FILTERS */}
      <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Class</InputLabel>
          <Select
            value={selectedClass}
            onChange={(e) => {
              setSelectedClass(e.target.value);
              setShowBroadsheet(false);
            }}
          >
            {classes.map((cls) => (
              <MenuItem key={cls.value} value={cls.value}>
                {cls.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Session</InputLabel>
          <Select
            value={selectedSession}
            disabled={!selectedClass}
            onChange={(e) => {
              setSelectedSession(e.target.value);
              setSelectedTerm("");
            }}
          >
            {sessions.map((s) => (
              <MenuItem key={s.value} value={s.value}>
                {s.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Term</InputLabel>
          <Select
            value={selectedTerm}
            disabled={!selectedSession}
            onChange={(e) => setSelectedTerm(e.target.value)}
          >
            {terms.map((t) => (
              <MenuItem key={t.value} value={t.value}>
                {t.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {readyToView && !showBroadsheet && (
        <Button
          variant="contained"
          onClick={handleViewBroadsheet}
          disabled={loadingSheet}
        >
          {loadingSheet ? "Loading..." : "View Broadsheet"}
        </Button>
      )}

      {showBroadsheet && (
        <Box>
          <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
            <ActionButton
              onClick={handlePrint}
              disabled={isPrinting}
              loading={isPrinting}
              variant="outlined"
              color="primary"
              size="small"
              startIcon={<IconifyIcon icon="mdi:printer-outline" width={16} />}
            >
              {isPrinting ? "Printing..." : "Print"}
            </ActionButton>
            <ActionButton
              onClick={handleDownload}
              variant="outlined"
              color="success"
              size="small"
              startIcon={<IconifyIcon icon="mdi:download-outline" width={16} />}
            >
              Download CSV
            </ActionButton>
          </Box>

          <BroadsheetTable
            students={students}
            subjects={subjects}
            columnWidths={{ sn: 40, name: 300, subject: 55 }}
          />
        </Box>
      )}
    </Box>
  );
};

export default ExampleBroadsheetPage;
