import React, { useEffect, useState, useMemo } from "react";
import { ReusableTable, type Column } from "../../../../components/table";
import {
  useTheme,
  useMediaQuery,
  Box,
  Divider,
  CircularProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import { getInitialAuthData } from "../../../../utils/apiClient";
import { useEnums } from "../../../../hooks/useEnums";
import {
  type SchoolTerm,
  type SchoolDetails,
} from "../../../../types/interfaces/i-school";
import { SchoolService } from "../../../../api/schoolService";
import { type AssessmentTypeConfig } from "../../../../types/interfaces/i-assessment";

const Index = () => {
  const [terms, setTerms] = useState<SchoolTerm[]>([]);
  const [schoolDetails, setSchoolDetails] = useState<SchoolDetails | null>(
    null,
  );
  const [assessmentData, setAssessmentData] = useState<AssessmentTypeConfig[]>(
    [],
  );
  const [updatedScores, setUpdatedScores] = useState<Record<string, number>>(
    {},
  );
  const [editAllOpen, setEditAllOpen] = useState(false);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const { selectedAccount } = getInitialAuthData();
  const { enums, isLoading: isEnumsLoading } = useEnums({
    fetchPermissionData: false,
  });

  const termMap = useMemo(() => {
    return (
      enums?.SchoolTerms?.reduce(
        (
          acc: Record<string, string>,
          item: { value: number; displayName: string; name: string },
        ) => {
          acc[item.value] = item.displayName || item.name;
          return acc;
        },
        {},
      ) || {}
    );
  }, [enums]);

  const assessmentMap = useMemo(() => {
    return (
      enums?.AssessmentType?.reduce(
        (
          acc: Record<string, string>,
          item: { value: number; displayName: string; name: string },
        ) => {
          acc[item.value] = item.displayName || item.name;
          return acc;
        },
        {},
      ) || {}
    );
  }, [enums]);

  const fetchSchoolTerms = async () => {
    if (!selectedAccount) {
      console.error("No account selected");
      setTerms([]);
      return;
    }
    setLoading(true);
    try {
      const termsData = await SchoolService.getSchoolTerms();
      setTerms(termsData);
    } catch (error) {
      console.error("Error fetching school terms:", error);
      setTerms([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchSchoolDetails = async () => {
    if (!selectedAccount) {
      console.error("No account selected");
      setSchoolDetails(null);
      return;
    }
    setLoading(true);
    try {
      const details = await SchoolService.getSchoolDetails();
      setSchoolDetails(details);
    } catch (error) {
      console.error("Error fetching school details:", error);
      setSchoolDetails(null);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssessmentTypes = async () => {
    if (!selectedAccount) return;
    setLoading(true);
    try {
      const data = await SchoolService.getAssessmentTypes();
      setAssessmentData(data);
    } catch (err) {
      console.error("Error fetching assessment types:", err);
      setAssessmentData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedAccount) {
      fetchSchoolTerms();
      fetchSchoolDetails();
      fetchAssessmentTypes();
    }
  }, [selectedAccount]);

  // Columns for School Terms
  const termColumns: Column[] = [
    {
      id: "name",
      label: "Term",
      minWidth: 150,
      sortable: true,
      format: (value: string, row: SchoolTerm) => (
        <span>
          {termMap[row.value.toString()] || value}
          {schoolDetails?.currentTerm === row.value && (
            <span style={{ color: "red", marginLeft: "8px" }}>
              (active term)
            </span>
          )}
        </span>
      ),
    },
  ];

  // Columns for Assessment Types
  const assessmentColumns: Column[] = [
    {
      id: "assessmentType",
      label: "Assessment Type",
      minWidth: 150,
      sortable: true,
      format: (value: number) => assessmentMap[value.toString()] || value,
    },
    {
      id: "maxScore",
      label: "Max Score",
      minWidth: 100,
      sortable: true,
    },
  ];

  if (loading || isEnumsLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  const handleEditAll = () => {
    const initialScores: Record<string, number> = {};
    assessmentData.forEach((item) => {
      initialScores[item.id] = item.maxScore;
    });
    setUpdatedScores(initialScores);
    setEditAllOpen(true);
  };

  const handleScoreChange = (id: string, value: number) => {
    setUpdatedScores((prev) => ({ ...prev, [id]: value }));
  };

  const handleUpdateAll = async () => {
    const total = Object.values(updatedScores).reduce(
      (sum, val) => sum + val,
      0,
    );
    if (total !== 100) {
      setError("Total of all scores must equal 100");
      return;
    }
    setError("");

    try {
      const configs = assessmentData.map((item) => ({
        assessmentType: item.assessmentType,
        maxScore: updatedScores[item.id],
      }));
      await SchoolService.updateAssessmentTypesBatch(configs);
      setEditAllOpen(false);
      fetchAssessmentTypes();
    } catch (err) {
      console.error("Error updating assessment types batch:", err);
    }
  };

  return (
    <Box
      display="flex"
      flexDirection={isMobile ? "column" : "row"}
      gap={2}
      alignItems="stretch"
    >
      {/* Left Half - School Terms */}
      <Box flex={1}>
        <ReusableTable
          title="School Terms"
          columns={termColumns}
          data={terms}
          showActionColumn={false}
          loading={loading || isEnumsLoading}
          showCheckboxes={false}
          showPagination={false}
          showSorting={false}
        />
      </Box>

      {/* Divider between tables */}
      {!isMobile && (
        <Divider
          orientation="vertical"
          flexItem
          sx={{ borderColor: "grey.400" }}
        />
      )}

      {/* Right Half - Assessment Types */}
      <Box flex={1}>
        <ReusableTable
          title="Assessment Types"
          columns={assessmentColumns}
          data={assessmentData || []}
          showActionColumn={false} // no per-row actions
          loading={loading}
          showCheckboxes={false}
          showPagination={false}
          showSorting={false}
        />

        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          onClick={handleEditAll}
        >
          Edit All
        </Button>
      </Box>

      {/* Edit All Modal */}
      <Dialog open={editAllOpen} onClose={() => setEditAllOpen(false)}>
        <DialogTitle sx={{ bgcolor: theme.palette.background.default }}>
          Edit All Assessment Types
        </DialogTitle>
        <DialogContent sx={{ bgcolor: theme.palette.background.default }}>
          {assessmentData.map((item) => (
            <TextField
              key={item.id}
              label={
                assessmentMap[item.assessmentType.toString()] ||
                item.assessmentType
              }
              type="number"
              value={updatedScores[item.id] ?? item.maxScore}
              onChange={(e) =>
                handleScoreChange(item.id, Number(e.target.value))
              }
              fullWidth
              margin="normal"
            />
          ))}
          {error && (
            <Box color="error.main" mt={1}>
              {error}
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ bgcolor: theme.palette.background.default }}>
          <Button onClick={() => setEditAllOpen(false)}>Cancel</Button>
          <Button onClick={handleUpdateAll} variant="contained" color="primary">
            Update All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Index;
