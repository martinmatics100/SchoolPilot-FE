import React, { useEffect, useState, useMemo } from "react";
import { ReusableTable, type Column } from "../../../../components/table";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import SchoolIcon from "@mui/icons-material/School";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import { useTheme, alpha, Box, Typography, Chip, Avatar, Tooltip, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { NavigationButton } from "../../../../components/navigation-button";
import { getInitialAuthData } from "../../../../utils/apiClient";
import { useEnums } from "../../../../hooks/useEnums";
import CircularProgress from "@mui/material/CircularProgress";
import AssignmentIndIcon from "@mui/icons-material/AssignmentInd";
import PeopleIcon from "@mui/icons-material/People";
import { fetchStudents } from "../../../../api/studentService";
import { type Student } from "../../../../types/interfaces/i-student";
import { type StatusConfig } from "../../../../types/interfaces/i-user";
import EditStudentDrawer from "../edit-student-drawer";

const statusConfig: StatusConfig = {
  active: {
    icon: CheckCircleIcon,
    color: "success",
    textColor: "#2e7d32",
    bgColor: "#e8f5e9",
  },
  graduated: {
    icon: SchoolIcon,
    color: "success",
    textColor: "#2e7d32",
    bgColor: "#e8f5e9",
  },
  transferred: {
    icon: SwapHorizIcon,
    color: "info",
    textColor: "#1976d2",
    bgColor: "#e3f2fd",
  },
  withdrawn: {
    icon: ExitToAppIcon,
    color: "warning",
    textColor: "#ed6c02",
    bgColor: "#fff3e0",
  },
  suspended: {
    icon: DoNotDisturbIcon,
    color: "warning",
    textColor: "#ed6c02",
    bgColor: "#fff3e0",
  },
  expelled: {
    icon: CancelIcon,
    color: "error",
    textColor: "#c62828",
    bgColor: "#ffebee",
  },
  default: {
    icon: CancelIcon,
    color: "error",
    textColor: "#c62828",
    bgColor: "#ffebee",
  },
};

const StudentList = () => {
  const [data, setData] = useState<Student[]>([]);
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [sortBy, setSortBy] = useState<string>("studentfullName");
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(false);
  const [rawStudents, setRawStudents] = useState<any[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [editDrawerOpen, setEditDrawerOpen] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const theme = useTheme();
  const { selectedAccount } = getInitialAuthData();
  const { enums, isLoading: isEnumsLoading } = useEnums({
    fetchPermissionData: false,
  });

  const studentStatusMap = useMemo(() => {
    return (
      enums?.StudentStatus?.reduce(
        (
          acc: Record<string, string>,
          item: { value: number; displayName: string; name: string }
        ) => {
          acc[item.value] = item.displayName || item.name;
          return acc;
        },
        {}
      ) || {}
    );
  }, [enums]);

  const genderMap = useMemo(() => {
    return (
      enums?.Gender?.reduce(
        (
          acc: Record<string, string>,
          item: { value: number; displayName: string; name: string }
        ) => {
          acc[item.value] = item.displayName || item.name;
          return acc;
        },
        {}
      ) || {}
    );
  }, [enums]);

  const getStatusConfig = (status: string) => {
    const normalizedStatus = status.toLowerCase();
    return (
      statusConfig[normalizedStatus as keyof StatusConfig] ||
      statusConfig.default
    );
  };

  useEffect(() => {
    if (selectedAccount) {
      setLoading(true);
      fetchStudents(selectedAccount, page, rowsPerPage)
        .then(({ items, itemCount }) => {
          setRawStudents(items || []);
          setTotalCount(itemCount || 0);
        })
        .catch((error) => {
          console.error("Error fetching students:", error);
          setData([]);
          setTotalCount(0);
        })
        .finally(() => setLoading(false));
    } else {
      console.error("No account selected");
      setData([]);
      setTotalCount(0);
    }
  }, [page, rowsPerPage, sortBy, order, selectedAccount]);

  useEffect(() => {
    if (rawStudents.length > 0 && !isEnumsLoading) {
      const mappedData = rawStudents.map((item: any) => {
        const genderValue = item.gender?.toString();
        const statusValue = item.status?.toString();
        const statusName = studentStatusMap[statusValue] || "Unknown";

        return {
          id: item.id,
          firstName: item.firstName || "Not available",
          lastName: item.lastName || "Not available",
          schoolName: item.schoolName,
          gender: genderMap[genderValue] || "Not available",
          status: statusName.toLowerCase(),
          studentId: item.studentId || "pending",
          class: item.className || "not available",
          rawGender: item.gender,
          rawStatus: item.status,
        };
      });
      setData(mappedData);
    } else if (rawStudents.length === 0) {
      setData([]);
    }
  }, [rawStudents, isEnumsLoading, studentStatusMap, genderMap]);

  const getGenderColor = (gender: string) => {
    const genderColors: Record<string, string> = {
      male: theme.palette.primary.main,
      female: theme.palette.secondary.main,
    };
    return genderColors[gender.toLowerCase()] || theme.palette.info.main;
  };

  // Calculate active students count
  const activeStudentsCount = data.filter(student => student.status === 'active').length;

  const columns: Column[] = [
    {
      id: "studentfullName",
      label: "Student",
      minWidth: 200,
      sortable: false,
      format: (value, row: Student) => (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: alpha(theme.palette.primary.main, 0.1),
              color: theme.palette.primary.main,
              fontWeight: 600,
              fontSize: "0.875rem",
            }}
          >
            {row.firstName?.charAt(0)}{row.lastName?.charAt(0)}
          </Avatar>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 600, color: "text.primary" }}>
              {row.lastName}, {row.firstName}
            </Typography>
            <Typography variant="caption" sx={{ color: "text.secondary" }}>
              ID: {row.studentId}
            </Typography>
          </Box>
        </Box>
      ),
    },
    {
      id: "gender",
      label: "Gender",
      minWidth: 100,
      sortable: false,
      format: (value: string, row: Student) => {
        const gender = !isEnumsLoading && enums
          ? genderMap[row.rawGender?.toString()] || "Not available"
          : value;
        return (
          <Chip
            label={gender}
            size="small"
            sx={{
              bgcolor: alpha(getGenderColor(gender), 0.1),
              color: getGenderColor(gender),
              fontWeight: 500,
              borderRadius: 1.5,
              height: 24,
              fontSize: "0.75rem",
            }}
          />
        );
      },
    },
    {
      id: "status",
      label: "Status",
      minWidth: 110,
      align: "center",
      format: (value: string, row: Student) => {
        const currentStatus =
          !isEnumsLoading && enums
            ? (studentStatusMap[row.rawStatus?.toString()] || "Unknown").toLowerCase()
            : value;
        const config = getStatusConfig(currentStatus);
        const StatusIcon = config.icon;
        return (
          <Chip
            icon={<StatusIcon sx={{ fontSize: 14 }} />}
            label={currentStatus}
            size="small"
            sx={{
              bgcolor: config.bgColor,
              color: config.textColor,
              fontWeight: 500,
              borderRadius: 1.5,
              height: 24,
              textTransform: "capitalize",
              "& .MuiChip-icon": {
                color: config.textColor,
              },
            }}
          />
        );
      },
    },
    {
      id: "class",
      label: "Class",
      minWidth: 120,
      sortable: false,
      format: (value: string) => (
        <Chip
          label={value || "Not available"}
          size="small"
          sx={{
            bgcolor: alpha(theme.palette.warning.main, 0.1),
            color: theme.palette.warning.main,
            fontWeight: 500,
            borderRadius: 1.5,
            height: 24,
            fontSize: "0.75rem",
          }}
        />
      ),
    },
    {
      id: "schoolName",
      label: "School",
      minWidth: 150,
      sortable: false,
      format: (value: string) => (
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          {value || "Not available"}
        </Typography>
      ),
    },
  ];

  const actionColumn = {
    label: "Actions",
    minWidth: 100,
    align: "center" as const,
    render: (row: Student) => (
      <Box sx={{ display: "flex", gap: 0.5, justifyContent: "center" }}>
        <Tooltip title="Edit Student" arrow>
          <IconButton
            aria-label="edit"
            onClick={() => handleEdit(row.id)}
            size="small"
            sx={{
              color: theme.palette.info.main,
              "&:hover": {
                bgcolor: alpha(theme.palette.info.main, 0.1),
              },
            }}
          >
            <EditIcon fontSize="small" />
          </IconButton>
        </Tooltip>
      </Box>
    ),
  };

  const handleEdit = (id: string) => {
    setSelectedStudentId(id);
    setEditDrawerOpen(true);
  };

  const refreshStudents = () => {
    if (selectedAccount) {
      fetchStudents(selectedAccount, page, rowsPerPage)
        .then(({ items, itemCount }) => {
          setRawStudents(items || []);
          setTotalCount(itemCount || 0);
        })
        .catch((error) => {
          console.error("Error fetching students:", error);
          setData([]);
          setTotalCount(0);
        });
    }
  };

  const handleSortChange = (sortByField: string, sortOrder: "asc" | "desc") => {
    setSortBy(sortByField);
    setOrder(sortOrder);
    setPage(1);
  };

  const handlePageChange = (event: unknown, newPage: number) => {
    setPage(newPage + 1);
  };

  const handleRowsPerPageChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const handleAssignedSelected = async () => {
    if (selectedRows.length === 0) return;
    setIsDeleting(true);
    try {
      const response = await fetch("/api/users/delete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ids: selectedRows }),
      });
      if (!response.ok) {
        throw new Error("Failed to delete users");
      }
      setData((prev) => prev.filter((user) => !selectedRows.includes(user.id)));
      setSelectedRows([]);
    } catch (error) {
      console.error("Error deleting users:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isEnumsLoading && loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        sx={{ bgcolor: "background.default" }}
      >
        <CircularProgress size={48} sx={{ color: "primary.main" }} />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 3, md: 4 },
        bgcolor: "background.default",
        minHeight: "100%",
      }}
    >
      {/* Header Section */}
      <Box sx={{ mb: 3 }}>
        <Typography
          variant="h5"
          sx={{
            fontWeight: 700,
            color: "text.primary",
            fontSize: { xs: "1.25rem", sm: "1.5rem" },
            mb: 0.5,
          }}
        >
          Student Management
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary" }}>
          Manage all students across your school
        </Typography>
      </Box>

      {/* Action Buttons - Far Right */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          gap: 1,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <NavigationButton
          onClick={handleAssignedSelected}
          disabled={selectedRows.length === 0 || isDeleting}
          size="small"
          color="error"
          variant="outlined"
          startIcon={<AssignmentIndIcon />}
          sx={{
            minWidth: "auto",
            px: 1.5,
          }}
        >
          {selectedRows.length > 0 && `(${selectedRows.length})`}
        </NavigationButton>

        <NavigationButton
          to="create-student"
          size="small"
          color="info"
          variant="contained"
          startIcon={<AddIcon />}
          sx={{
            minWidth: "auto",
            px: 1.5,
          }}
        >
          Add
        </NavigationButton>

        <NavigationButton
          to="bulk-create-student"
          size="small"
          color="secondary"
          variant="outlined"
          sx={{
            minWidth: "auto",
            px: 1.5,
          }}
        >
          Bulk Add
        </NavigationButton>
      </Box>

      {/* Table */}
      <ReusableTable
        title="Students List"
        columns={columns}
        data={data}
        defaultRowsPerPage={rowsPerPage}
        rowsPerPageOptions={[10, 25, 50]}
        showActionColumn={true}
        actionColumn={actionColumn}
        sortBy={sortBy}
        order={order}
        onSortChange={handleSortChange}
        onSelectedRowsChange={(selected) => setSelectedRows(selected)}
        page={page - 1}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        totalCount={totalCount}
        loading={loading || isEnumsLoading}
      />

      {/* Edit Drawer */}
      <EditStudentDrawer
        open={editDrawerOpen}
        onClose={() => {
          setEditDrawerOpen(false);
          setSelectedStudentId(null);
        }}
        studentId={selectedStudentId}
        onSuccess={refreshStudents}
      />
    </Box>
  );
};

export default StudentList;