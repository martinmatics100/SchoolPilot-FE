import React, { useEffect, useState, useMemo } from "react";
import { ReusableTable, type Column } from "../../../../components/table";
import { getInitialAuthData } from "../../../../utils/apiClient";
import { useEnums } from "../../../../hooks/useEnums";
import { NavigationButton } from "../../../../components/navigation-button";
import { fetchClassesWithSubjects } from "../../../../api/subjectServies";
import { type SubjectModel } from "../../../../types/interfaces/i-subject";
import {
  Alert,
  Box,
  CircularProgress,
  IconButton,
  Snackbar,
} from "@mui/material";
import { Chip, Stack } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@mui/material";

const Subjects = () => {
  const [data, setData] = useState<SubjectModel[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState<string>("subject");
  const [order, setOrder] = useState<`asc` | `desc`>(`asc`);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const { selectedAccount } = getInitialAuthData();
  const { enums, isLoading: isEnumLoading } = useEnums({
    fetchPermissionData: false,
  });
  const theme = useTheme();

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

  const columns: Column[] = [
    {
      id: "className",
      label: "Class Name",
      minWidth: 250,
      sortable: true,
      // format: (value: number | undefined | null) => getSubjectName(value),
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
    render: (row: SubjectModel) => (
      <div>
        <IconButton aria-label="edit" onClick={() => handleEdit(row.id)}>
          <EditIcon color="primary" />
        </IconButton>
        <IconButton aria-label="delete" onClick={() => handleDelete(row.id)}>
          <DeleteIcon color="primary" />
        </IconButton>
      </div>
    ),
  };

  const handleEdit = (id: string) => {
    console.log("Edit subject:", id);
  };

  const handleDelete = (id: string) => {
    console.log("Delete subject:", id);
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
      {/* <h1>Subjects</h1> */}
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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Subjects;
