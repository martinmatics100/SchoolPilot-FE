import React, { useEffect, useState, useMemo } from "react";
import { ReusableTable, type Column } from "../../../../components/table";
import { getInitialAuthData } from "../../../../utils/apiClient";
import { useEnums } from "../../../../hooks/useEnums";
import { NavigationButton } from "../../../../components/navigation-button";
import { fetchClassesWithSubjects, updateClassSubjects } from "../../../../api/subjectServies";
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Snackbar,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  useMediaQuery,
  useTheme,
  Paper,
} from "@mui/material";
import { Chip, Stack } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

// Define the actual interface based on your API response
interface ClassSubjectsResponse {
  classId: string;
  className: string;
  subjects: number[];
}

const Subjects = () => {
  const [data, setData] = useState<ClassSubjectsResponse[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState<string>("className");
  const [order, setOrder] = useState<`asc` | `desc`>(`asc`);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Modal state
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<ClassSubjectsResponse | null>(null);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [updating, setUpdating] = useState(false);

  const { selectedAccount } = getInitialAuthData();
  const { enums, isLoading: isEnumLoading } = useEnums({
    fetchPermissionData: false,
  });
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Get all available subjects from enums
  const availableSubjects = useMemo(() => {
    return enums?.AcademicSubjects || [];
  }, [enums]);

  const subjectMap = useMemo(() => {
    return (
      enums?.AcademicSubjects?.reduce(
        (
          acc: Record<string, string>,
          item: { value: number; displayName?: string; name: string }
        ) => {
          acc[item.value.toString()] = item.displayName || item.name;
          return acc;
        },
        {}
      ) || {}
    );
  }, [enums]);

  const getSubjectName = (value?: number | null) => {
    if (value === undefined || value === null) return "Unknown";
    return subjectMap[value.toString()] || `Unknown (${value})`;
  };

  useEffect(() => {
    if (!selectedAccount) return;

    setLoading(true);

    fetchClassesWithSubjects(selectedAccount, {
      page,
      pageLength: rowsPerPage,
    })
      .then((response) => {
        setData(response.items);
        setTotalCount(response.itemCount);
      })
      .catch((err) => {
        console.error("Failed to fetch classes with subjects", err);
        setSnackbar({
          open: true,
          message: "Failed to fetch classes",
          severity: "error",
        });
        setData([]);
        setTotalCount(0);
      })
      .finally(() => setLoading(false));
  }, [selectedAccount, page, rowsPerPage]);

  const renderSubjects = (subjects: number[]) => {
    if (!subjects || subjects.length === 0) {
      return (
        <Chip
          label="Not assigned"
          size="small"
          variant="outlined"
          sx={{
            color: theme.palette.text.secondary,
            borderColor: theme.palette.text.secondary,
          }}
        />
      );
    }

    return (
      <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
        {subjects.map((s) => (
          <Chip
            key={s}
            label={getSubjectName(s)}
            size="medium"
            variant="outlined"
            sx={{
              color: theme.palette.text.secondary,
              borderColor: theme.palette.text.secondary,
              fontWeight: 900,
            }}
          />
        ))}
      </Stack>
    );
  };

  const handleEdit = (row: ClassSubjectsResponse) => {
    setSelectedClass(row);
    // Initialize selected subjects with the class's current subjects
    setSelectedSubjects(row.subjects || []);
    setEditModalOpen(true);
  };

  const handleDelete = (id: string) => {
    console.log("Delete subject:", id);
  };

  const handleSubjectToggle = (subjectValue: number) => {
    setSelectedSubjects(prev => {
      if (prev.includes(subjectValue)) {
        return prev.filter(s => s !== subjectValue);
      } else {
        return [...prev, subjectValue];
      }
    });
  };

  const handleSaveSubjects = async () => {
    if (!selectedClass || !selectedAccount) return;

    setUpdating(true);
    try {
      // Call API to update class subjects
      await updateClassSubjects(selectedAccount, selectedClass.classId, {
        subjects: selectedSubjects
      });

      setSnackbar({
        open: true,
        message: "Subjects updated successfully",
        severity: "success",
      });

      // Refresh the table data
      const response = await fetchClassesWithSubjects(selectedAccount, {
        page,
        pageLength: rowsPerPage,
      });
      setData(response.items);
      setTotalCount(response.itemCount);

      // Close modal
      setEditModalOpen(false);
      setSelectedClass(null);
    } catch (error) {
      console.error("Failed to update subjects", error);
      setSnackbar({
        open: true,
        message: "Failed to update subjects",
        severity: "error",
      });
    } finally {
      setUpdating(false);
    }
  };

  const handleCloseModal = () => {
    setEditModalOpen(false);
    setSelectedClass(null);
    setSelectedSubjects([]);
  };

  const columns: Column[] = [
    {
      id: "className",
      label: "Class Name",
      minWidth: 250,
      sortable: true,
    },
    {
      id: "subjects",
      label: "Subjects Offered",
      minWidth: 200,
      sortable: false,
      format: (value: number[]) => renderSubjects(value),
    },
  ];

  const actionColumn = {
    label: "Actions",
    minWidth: 150,
    align: "center" as const,
    render: (row: ClassSubjectsResponse) => (
      <div>
        <IconButton aria-label="edit" onClick={() => handleEdit(row)}>
          <EditIcon color="primary" />
        </IconButton>
        <IconButton aria-label="delete" onClick={() => handleDelete(row.classId)}>
          <DeleteIcon color="primary" />
        </IconButton>
      </div>
    ),
  };

  const handlePageChange = (event: unknown, newPage: number) =>
    setPage(newPage + 1);
  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };
  const handleSortChange = (sortByField: string, sortOrder: "asc" | "desc") => {
    setSortBy(sortByField);
    setOrder(sortOrder);
    setPage(1);
  };

  if (loading || isEnumLoading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="240px"
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          gap: "8px",
          marginBottom: "8px",
        }}
      >
        <NavigationButton to="create-subject" sx={{ alignContent: "flex-end" }}>
          <AddIcon />
        </NavigationButton>
      </div>

      <ReusableTable
        title="Subject List"
        columns={columns}
        data={data}
        defaultRowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
        showActionColumn={true}
        actionColumn={actionColumn}
        sortBy={sortBy}
        order={order}
        onSortChange={handleSortChange}
        page={page - 1}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        totalCount={totalCount}
        loading={loading || isEnumLoading}
        showCheckboxes={false}
        showSorting={true}
        showPagination={true}
      />

      {/* Edit Subjects Modal */}
      <Dialog
        open={editModalOpen}
        onClose={handleCloseModal}
        maxWidth="sm"
        fullWidth
        fullScreen={isMobile}
        PaperProps={{
          sx: {
            borderRadius: isMobile ? 0 : 2,
            margin: isMobile ? 0 : 2,
            bgcolor: theme.palette.background.default
          }
        }}
      >
        <DialogTitle sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 2,
          bgcolor: theme.palette.background.default
        }}>
          <Typography variant="h6" component="span">
            Edit Subjects: {selectedClass?.className}
          </Typography>
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Select the subjects offered for this class. Uncheck any subjects to remove them.
          </Typography>

          <Paper
            variant="outlined"
            sx={{
              p: 2,
              maxHeight: isMobile ? 'calc(100vh - 200px)' : 400,
              overflow: 'auto',
              bgcolor: theme.palette.background.default
            }}
          >
            <FormControl component="fieldset" fullWidth>
              <FormGroup>
                {availableSubjects.length > 0 ? (
                  availableSubjects.map((subject: any) => (
                    <FormControlLabel
                      key={subject.value}
                      control={
                        <Checkbox
                          checked={selectedSubjects.includes(subject.value)}
                          onChange={() => handleSubjectToggle(subject.value)}
                          color="primary"
                        />
                      }
                      label={subject.displayName || subject.name}
                      sx={{
                        py: 0.5,
                        '&:hover': {
                          backgroundColor: theme.palette.action.hover,
                        },
                        borderRadius: 1,
                      }}
                    />
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary" align="center">
                    No subjects available
                  </Typography>
                )}
              </FormGroup>
            </FormControl>
          </Paper>

          {selectedSubjects.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <Typography variant="caption" color="text.secondary">
                Selected subjects: {selectedSubjects.length}
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1 }}>
                {selectedSubjects.map(subjectValue => (
                  <Chip
                    key={subjectValue}
                    label={getSubjectName(subjectValue)}
                    size="small"
                    onDelete={() => handleSubjectToggle(subjectValue)}
                    deleteIcon={<CloseIcon />}
                    sx={{
                      backgroundColor: theme.palette.primary.light,
                      color: theme.palette.primary.contrastText,
                      '& .MuiChip-deleteIcon': {
                        color: theme.palette.primary.contrastText,
                        '&:hover': {
                          color: theme.palette.primary.contrastText,
                        }
                      }
                    }}
                  />
                ))}
              </Stack>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{
          p: 2,
          borderTop: `1px solid ${theme.palette.divider}`,
          gap: 1
        }}>
          <Button onClick={handleCloseModal} disabled={updating}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveSubjects}
            variant="contained"
            color="primary"
            disabled={updating}
            startIcon={updating ? <CircularProgress size={20} /> : null}
          >
            {updating ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Subjects;