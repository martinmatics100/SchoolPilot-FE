import React, { useEffect, useState, useMemo } from "react";
import { ReusableTable, type Column } from "../../../../components/table";
import {
  useTheme,
  useMediaQuery,
  Box,
  Divider,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Paper,
  Card,
  CardContent,
  alpha,
  Stack,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
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
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          <span>{termMap[row.value.toString()] || value}</span>
          {schoolDetails?.currentTerm === row.value && (
            <Chip
              label="Active"
              size="small"
              color="success"
              sx={{
                height: 20,
                fontSize: '0.6rem',
                fontWeight: 600,
                '& .MuiChip-label': {
                  px: 1,
                },
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

  const handleScoreChange = (id: string, value: string) => {
    // Only allow numbers and limit to 3 digits
    const numericValue = value.replace(/[^0-9]/g, '');
    if (numericValue.length <= 3) {
      const num = numericValue === '' ? 0 : parseInt(numericValue, 10);
      if (num >= 0 && num <= 100) {
        setUpdatedScores((prev) => ({ ...prev, [id]: num }));
      } else if (numericValue === '') {
        setUpdatedScores((prev) => ({ ...prev, [id]: 0 }));
      }
    }
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

  // Mobile Card View for Terms
  const renderTermCards = () => {
    if (terms.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">No terms available</Typography>
        </Box>
      );
    }

    return (
      <Stack spacing={2}>
        {terms.map((term) => (
          <Card
            key={term.value}
            sx={{
              borderRadius: 2,
              bgcolor: theme.palette.background.default,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            }}
          >
            <CardContent sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              py: 1.5,
              '&:last-child': { pb: 1.5 },
            }}>
              <Typography variant="body1" fontWeight={500}>
                {termMap[term.value.toString()] || term.name}
              </Typography>
              {schoolDetails?.currentTerm === term.value && (
                <Chip
                  label="Active"
                  size="small"
                  color="success"
                  sx={{
                    height: 22,
                    fontSize: '0.65rem',
                    fontWeight: 600,
                  }}
                />
              )}
            </CardContent>
          </Card>
        ))}
      </Stack>
    );
  };

  // Mobile Table View for Assessment Types
  const renderAssessmentMobile = () => {
    if (assessmentData.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">No assessment types available</Typography>
        </Box>
      );
    }

    return (
      <TableContainer component={Paper} sx={{ bgcolor: 'transparent', boxShadow: 'none' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                Assessment Type
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 600, color: 'text.secondary', fontSize: '0.75rem' }}>
                Max Score
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {assessmentData.map((item) => (
              <TableRow key={item.id}>
                <TableCell sx={{ fontSize: '0.85rem', fontWeight: 500 }}>
                  {assessmentMap[item.assessmentType.toString()] || item.assessmentType}
                </TableCell>
                <TableCell align="right" sx={{ fontSize: '0.85rem' }}>
                  <Chip
                    label={item.maxScore}
                    size="small"
                    variant="outlined"
                    sx={{
                      height: 24,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '100%',
        overflowX: 'hidden',
        p: { xs: 1, sm: 2 },
      }}
    >
      <Box
        display="flex"
        flexDirection={isMobile ? "column" : "row"}
        gap={2}
        alignItems="stretch"
        sx={{ width: '100%' }}
      >
        {/* Left Half - School Terms */}
        <Box flex={1} sx={{ minWidth: 0, width: '100%' }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              bgcolor: theme.palette.background.default,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              height: '100%',
              minHeight: { xs: 'auto', md: 350 },
              overflow: 'hidden',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: 1.5,
                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mr: 1.5,
                }}
              >
                <IconifyIcon
                  icon="mdi:calendar-check-outline"
                  width={20}
                  color={theme.palette.primary.main}
                />
              </Box>
              <Typography variant="h6" fontWeight={600}>
                School Terms
              </Typography>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {isMobile ? renderTermCards() : (
              <Box sx={{ overflow: 'hidden' }}>
                <ReusableTable
                  title=""
                  columns={termColumns}
                  data={terms}
                  showActionColumn={false}
                  loading={loading || isEnumsLoading}
                  showCheckboxes={false}
                  showPagination={false}
                  showSorting={false}
                />
              </Box>
            )}
          </Paper>
        </Box>

        {/* Divider between tables */}
        {!isMobile && (
          <Divider
            orientation="vertical"
            flexItem
            sx={{ borderColor: "grey.300" }}
          />
        )}

        {/* Right Half - Assessment Types */}
        <Box flex={1} sx={{ minWidth: 0, width: '100%' }}>
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2, sm: 3 },
              borderRadius: 2,
              bgcolor: theme.palette.background.default,
              border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
              height: '100%',
              minHeight: { xs: 'auto', md: 350 },
              overflow: 'hidden',
            }}
          >
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
              flexWrap: 'wrap',
              gap: 1,
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: 1.5,
                    bgcolor: alpha(theme.palette.secondary.main, 0.1),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mr: 1.5,
                  }}
                >
                  <IconifyIcon
                    icon="mdi:clipboard-text-outline"
                    width={20}
                    color={theme.palette.secondary.main}
                  />
                </Box>
                <Typography variant="h6" fontWeight={600}>
                  Assessment Types
                </Typography>
              </Box>

              <Button
                variant="contained"
                color="primary"
                size="small"
                onClick={handleEditAll}
                startIcon={<IconifyIcon icon="mdi:pencil-outline" width={16} />}
                sx={{
                  borderRadius: 1.5,
                  textTransform: 'none',
                  fontWeight: 600,
                  boxShadow: 'none',
                  '&:hover': {
                    boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                  },
                }}
              >
                Edit All
              </Button>
            </Box>

            <Divider sx={{ mb: 2 }} />

            {isMobile ? renderAssessmentMobile() : (
              <Box sx={{ overflow: 'hidden' }}>
                <ReusableTable
                  title=""
                  columns={assessmentColumns}
                  data={assessmentData || []}
                  showActionColumn={false}
                  loading={loading}
                  showCheckboxes={false}
                  showPagination={false}
                  showSorting={false}
                />
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Edit All Modal */}
      <Dialog
        open={editAllOpen}
        onClose={() => setEditAllOpen(false)}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: theme.palette.background.default,
            m: { xs: 2, sm: 3 },
          },
        }}
      >
        <DialogTitle sx={{
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          pb: 2,
          bgcolor: theme.palette.background.default,
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <IconifyIcon
              icon="mdi:pencil-box-outline"
              width={24}
              color={theme.palette.primary.main}
            />
            <Typography variant="h6" fontWeight={600}>
              Edit Assessment Types
            </Typography>
          </Box>
        </DialogTitle>

        <DialogContent sx={{
          bgcolor: theme.palette.background.default,
          pt: 3,
        }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Adjust the maximum scores for each assessment type. The total must equal 100.
          </Typography>

          <Stack spacing={2}>
            {assessmentData.map((item) => (
              <Box key={item.id}>
                <TextField
                  label={assessmentMap[item.assessmentType.toString()] || item.assessmentType}
                  type="text"
                  value={updatedScores[item.id] ?? item.maxScore}
                  onChange={(e) => handleScoreChange(item.id, e.target.value)}
                  fullWidth
                  size="small"
                  placeholder="Enter score (1-100)"
                  InputProps={{
                    inputProps: {
                      maxLength: 3,
                      style: { textAlign: 'left' }
                    },
                  }}
                  helperText="Enter a value between 1 and 100"
                  FormHelperTextProps={{
                    sx: { fontSize: '0.7rem' }
                  }}
                />
              </Box>
            ))}
          </Stack>

          {error && (
            <Box
              sx={{
                mt: 2,
                p: 1.5,
                bgcolor: alpha(theme.palette.error.main, 0.08),
                borderRadius: 1.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <IconifyIcon
                icon="mdi:alert-circle-outline"
                width={18}
                color={theme.palette.error.main}
              />
              <Typography color="error" variant="body2">
                {error}
              </Typography>
            </Box>
          )}

          <Box
            sx={{
              mt: 2,
              p: 1.5,
              bgcolor: alpha(theme.palette.info.main, 0.06),
              borderRadius: 1.5,
              border: `1px solid ${alpha(theme.palette.info.main, 0.12)}`,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <IconifyIcon
                icon="mdi:information-outline"
                width={16}
                color={theme.palette.info.main}
              />
              <Typography variant="caption" color="text.secondary">
                <strong>Total: </strong>
                {Object.values(updatedScores).reduce((sum, val) => sum + val, 0)} / 100
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{
          borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
          pt: 2,
          pb: 2,
          px: 3,
          bgcolor: theme.palette.background.default,
          gap: 1,
        }}>
          <Button
            onClick={() => setEditAllOpen(false)}
            variant="outlined"
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 600,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleUpdateAll}
            variant="contained"
            color="primary"
            sx={{
              borderRadius: 1.5,
              textTransform: 'none',
              fontWeight: 600,
              boxShadow: 'none',
              '&:hover': {
                boxShadow: `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
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