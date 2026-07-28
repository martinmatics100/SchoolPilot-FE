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
  Typography,
  alpha,
  Paper,
  Stack,
  Card,
  CardContent,
  Chip,
  Grid,
} from "@mui/material";
import { getInitialAuthData } from "../../../../utils/apiClient";
import { useEnums } from "../../../../hooks/useEnums";
import {
  type SchoolTerm,
  type SchoolDetails,
} from "../../../../types/interfaces/i-school";
import { SchoolService } from "../../../../api/schoolService";
import { type AssessmentTypeConfig } from "../../../../types/interfaces/i-assessment";
import IconifyIcon from "../../../../components/base/iconifyIcon";

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
  const isTablet = useMediaQuery(theme.breakpoints.down("md"));
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
        <Box display="flex" alignItems="center" gap={1}>
          <span>{termMap[row.value.toString()] || value}</span>
          {schoolDetails?.currentTerm === row.value && (
            <Chip
              label="Active"
              size="small"
              color="success"
              sx={{
                height: 20,
                fontSize: "0.65rem",
                fontWeight: 600,
              }}
            />
          )}
        </Box>
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
      format: (value: number) => (
        <Box display="flex" alignItems="center" gap={1}>
          <IconifyIcon
            icon="mdi:clipboard-text-outline"
            width={18}
            color={theme.palette.primary.main}
          />
          <span>{assessmentMap[value.toString()] || value}</span>
        </Box>
      ),
    },
    {
      id: "maxScore",
      label: "Max Score",
      minWidth: 100,
      sortable: true,
      format: (value: number) => (
        <Chip
          label={`${value}%`}
          size="small"
          sx={{
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            color: theme.palette.primary.main,
            fontWeight: 600,
            fontSize: "0.75rem",
          }}
        />
      ),
    },
  ];

  if (loading || isEnumsLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="300px"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="body2" color="text.secondary">
          Loading school information...
        </Typography>
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

  const handleScoreChange = (id: string, value: string) => {
    if (value === "") {
      setUpdatedScores((prev) => ({ ...prev, [id]: 0 }));
      setError("");
      return;
    }
    const numValue = Number(value);
    if (!isNaN(numValue) && numValue >= 0 && numValue <= 100) {
      setUpdatedScores((prev) => ({ ...prev, [id]: numValue }));
      setError("");
    } else if (numValue > 100) {
      setError("Score cannot exceed 100");
    }
  };

  const handleUpdateAll = async () => {
    const total = Object.values(updatedScores).reduce(
      (sum, val) => sum + val,
      0,
    );
    if (total !== 100) {
      setError(`Total must equal 100. Current total: ${total}`);
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
      setError("Failed to update assessment types. Please try again.");
    }
  };

  const totalScore = Object.values(updatedScores).reduce(
    (sum, val) => sum + val,
    0,
  );
  const isTotalValid = totalScore === 100;

  // Mobile card view for terms
  const TermsMobileView = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, p: 1 }}>
      {terms.map((term) => (
        <Card
          key={term.value}
          sx={{
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            bgcolor: "background.default",
          }}
        >
          <CardContent sx={{ py: 1.5, px: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" fontWeight={500}>
                {termMap[term.value.toString()] || term.name}
              </Typography>
              {schoolDetails?.currentTerm === term.value && (
                <Chip
                  label="Active"
                  size="small"
                  color="success"
                  sx={{ height: 20, fontSize: "0.65rem" }}
                />
              )}
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  // Mobile card view for assessments
  const AssessmentsMobileView = () => (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5, p: 1 }}>
      {assessmentData.map((item) => (
        <Card
          key={item.id}
          sx={{
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            bgcolor: "background.default",
          }}
        >
          <CardContent sx={{ py: 1.5, px: 2 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Box display="flex" alignItems="center" gap={1}>
                <IconifyIcon
                  icon="mdi:clipboard-text-outline"
                  width={18}
                  color={theme.palette.primary.main}
                />
                <Typography variant="body2" fontWeight={500}>
                  {assessmentMap[item.assessmentType.toString()] || item.assessmentType}
                </Typography>
              </Box>
              <Chip
                label={`${item.maxScore}%`}
                size="small"
                sx={{
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  color: theme.palette.primary.main,
                  fontWeight: 600,
                }}
              />
            </Box>
          </CardContent>
        </Card>
      ))}
    </Box>
  );

  return (
    <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
      {/* Header */}
      <Box sx={{ mb: 3 }}>
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
            icon="mdi:school-outline"
            width={28}
            color={theme.palette.primary.main}
          />
          School Configuration
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mt: 0.5 }}>
          Manage school terms and assessment configurations
        </Typography>
      </Box>

      <Box display="flex" flexDirection="column" gap={3}>
        {/* School Terms Section */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            overflow: "hidden",
            bgcolor: "background.default",
          }}
        >
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconifyIcon
                icon="mdi:calendar-multiple"
                width={24}
                color={theme.palette.primary.main}
              />
              <Typography variant="h6" fontWeight={600}>
                School Terms
              </Typography>
              {schoolDetails?.currentTerm && (
                <Chip
                  label={`Active: ${termMap[schoolDetails.currentTerm.toString()] || schoolDetails.currentTerm}`}
                  size="small"
                  color="success"
                  variant="outlined"
                  sx={{ height: 24 }}
                />
              )}
            </Stack>
            <Typography variant="caption" color="text.secondary">
              {terms.length} {terms.length === 1 ? "term" : "terms"} configured
            </Typography>
          </Box>

          <Box sx={{ p: { xs: 1, sm: 2 } }}>
            {isMobile ? (
              <TermsMobileView />
            ) : (
                <ReusableTable
                  columns={termColumns}
                  data={terms}
                  showActionColumn={false}
                  loading={loading || isEnumsLoading}
                  showCheckboxes={false}
                  showPagination={false}
                  showSorting={false}
                />
            )}
          </Box>
        </Paper>

        {/* Assessment Types Section */}
        <Paper
          elevation={0}
          sx={{
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            overflow: "hidden",
            bgcolor: "background.default",
          }}
        >
          <Box
            sx={{
              p: { xs: 2, sm: 3 },
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1}>
              <IconifyIcon
                icon="mdi:clipboard-check-outline"
                width={24}
                color={theme.palette.primary.main}
              />
              <Typography variant="h6" fontWeight={600}>
                Assessment Types
              </Typography>
            </Stack>
            <Box display="flex" gap={1} flexWrap="wrap">
              <Chip
                label={`${assessmentData.length} types`}
                size="small"
                variant="outlined"
              />
              <Button
                variant="contained"
                size="small"
                startIcon={<IconifyIcon icon="mdi:pencil-outline" width={18} />}
                onClick={handleEditAll}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 600,
                  background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
                  "&:hover": {
                    background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
                  },
                }}
              >
                Edit All
              </Button>
            </Box>
          </Box>

          <Box sx={{ p: { xs: 1, sm: 2 } }}>
            {isMobile ? (
              <AssessmentsMobileView />
            ) : (
                <ReusableTable
                  columns={assessmentColumns}
                  data={assessmentData || []}
                  showActionColumn={false}
                  loading={loading}
                  showCheckboxes={false}
                  showPagination={false}
                  showSorting={false}
                />
            )}
          </Box>
        </Paper>
      </Box>

      {/* Edit All Modal */}
      <Dialog
        open={editAllOpen}
        onClose={() => setEditAllOpen(false)}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 3,
            bgcolor: "background.default",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            pb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Edit Assessment Types
          </Typography>
          <IconButton onClick={() => setEditAllOpen(false)} size="small">
            <IconifyIcon icon="mdi:close" width={24} />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, pb: 2 }}>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Adjust the maximum scores for each assessment type. Total must equal 100%.
            </Typography>
          </Box>

          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {assessmentData.map((item) => (
              <Box
                key={item.id}
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  alignItems: { xs: "stretch", sm: "center" },
                  gap: 1,
                  p: 1.5,
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.background.paper, 0.5),
                  border: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                }}
              >
                <Box flex={1}>
                  <Typography variant="body2" fontWeight={500}>
                    {assessmentMap[item.assessmentType.toString()] || item.assessmentType}
                  </Typography>
                </Box>
                <Box sx={{ width: { xs: "100%", sm: 120 } }}>
                  <TextField
                    type="number"
                    size="small"
                    fullWidth
                    value={updatedScores[item.id] ?? item.maxScore}
                    onChange={(e) => handleScoreChange(item.id, e.target.value)}
                    placeholder="0"
                    InputProps={{
                      inputProps: {
                        min: 0,
                        max: 100,
                        step: 1,
                      },
                      endAdornment: (
                        <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                          %
                        </Typography>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "& input": {
                          padding: "8px 12px",
                        },
                      },
                    }}
                  />
                </Box>
              </Box>
            ))}
          </Box>

          {error && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.error.main, 0.1),
                display: "flex",
                alignItems: "center",
                gap: 1,
              }}
            >
              <IconifyIcon
                icon="mdi:alert-circle-outline"
                width={20}
                color={theme.palette.error.main}
              />
              <Typography variant="body2" color="error.main">
                {error}
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              mt: 2,
              p: 1.5,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.info.main, 0.08),
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Total:
            </Typography>
            <Chip
              label={`${totalScore}%`}
              size="small"
              sx={{
                bgcolor: isTotalValid
                  ? alpha(theme.palette.success.main, 0.1)
                  : alpha(theme.palette.error.main, 0.1),
                color: isTotalValid
                  ? theme.palette.success.main
                  : theme.palette.error.main,
                fontWeight: 600,
              }}
            />
          </Box>
        </DialogContent>

        <DialogActions
          sx={{
            p: 2.5,
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            gap: 1,
            flexWrap: "wrap",
          }}
        >
          <Button
            onClick={() => setEditAllOpen(false)}
            variant="outlined"
            sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateAll}
            variant="contained"
            disabled={!isTotalValid}
            startIcon={<IconifyIcon icon="mdi:content-save-outline" width={18} />}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              fontWeight: 600,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              "&:hover": {
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.secondary.dark} 100%)`,
              },
              "&.Mui-disabled": {
                background: theme.palette.action.disabledBackground,
              },
            }}
          >
            Update All
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Index;