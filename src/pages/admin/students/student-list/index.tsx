import React, { useEffect, useState, useMemo } from "react";
import { ReusableTable, type Column, type TableActionButton } from "../../../../components/table";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import SchoolIcon from "@mui/icons-material/School";
import SwapHorizIcon from "@mui/icons-material/SwapHoriz";
import ExitToAppIcon from "@mui/icons-material/ExitToApp";
import DoNotDisturbIcon from "@mui/icons-material/DoNotDisturb";
import { useTheme, alpha, Box, Typography, Chip, Avatar, Tooltip } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { getInitialAuthData, getCurrentUser } from "../../../../utils/apiClient";
import { UserRoles } from "../../../../enums/user-roles";
import { useEnums } from "../../../../hooks/useEnums";
import CircularProgress from "@mui/material/CircularProgress";
import PeopleIcon from "@mui/icons-material/People";
import { fetchStudents } from "../../../../api/studentService";
import { fetchMyFormTeacherClasses } from "../../../../api/classServices";
import { type Student } from "../../../../types/interfaces/i-student";
import { type StatusConfig } from "../../../../types/interfaces/i-user";
import EditStudentDrawer from "../edit-student-drawer";
import { useNavigate } from "react-router-dom";

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
  const navigate = useNavigate();
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
  const [isAssigning, setIsAssigning] = useState(false);

  // ── Filter state ──
  const [classes, setClasses] = useState<Array<{ id: string; name: string }>>([]);
  const [classFilter, setClassFilter] = useState<string>("");
  const [classesLoaded, setClassesLoaded] = useState(false);
  const [initialFilterApplied, setInitialFilterApplied] = useState(false);

  const theme = useTheme();
  const { selectedAccount } = getInitialAuthData();
  const { enums, isLoading: isEnumsLoading } = useEnums({
    fetchPermissionData: false,
  });

  // ── Role detection (admin vs teacher) ──
  const currentUser = getCurrentUser();
  const isAdmin = !!currentUser?.roles?.some(
    (r) => r === UserRoles.ADMIN || r === UserRoles.SUPER_ADMIN
  );

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

  // ── Load classes (admin → all, teacher → form-teacher classes) ──
  useEffect(() => {
    const loadClasses = async () => {
      if (!selectedAccount) {
        setClassesLoaded(true);
        return;
      }
      try {
        const { ok, data } = await fetchMyFormTeacherClasses(selectedAccount);

        if (ok && Array.isArray(data?.classes)) {
          setClasses(
            data.classes.map((c: any) => ({
              id: c.classId,
              name: c.className,
            }))
          );
        } else {
          console.error("Failed to load classes:", data?.message);
          setClasses([]);
        }
      } catch (err) {
        console.error("Failed to load classes:", err);
        setClasses([]);
      } finally {
        setClassesLoaded(true);
      }
    };
    loadClasses();
  }, [selectedAccount]);

  // ── Auto-select first class once classes are loaded ──
  useEffect(() => {
    if (!classesLoaded) return;
    if (initialFilterApplied) return;

    if (classes.length > 0) {
      setClassFilter(classes[0].id);
    }
    setInitialFilterApplied(true);
  }, [classesLoaded, classes, initialFilterApplied]);

  // ── Fetch students (with filter) ──
  useEffect(() => {
    if (!selectedAccount) {
      console.error("No account selected");
      setData([]);
      setTotalCount(0);
      return;
    }

    // Wait until classes have resolved AND (either auto-select finished
    // or there are no classes to select).
    if (!classesLoaded) return;
    if (!initialFilterApplied && classes.length > 0) return;

    setLoading(true);
    fetchStudents(
      selectedAccount,
      page,
      rowsPerPage,
      classFilter || undefined
    )
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    rowsPerPage,
    sortBy,
    order,
    selectedAccount,
    classFilter,
    classesLoaded,
    initialFilterApplied,
    classes.length,
  ]);

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
          studentUniqueId: item.studentUniqueId || "pending",
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
      male: theme.palette.text.secondary,
      female: theme.palette.text.secondary,
    };
    return genderColors[gender.toLowerCase()] || theme.palette.info.main;
  };

  const columns: Column[] = [
    {
      id: "studentfullName",
      label: "Student",
      minWidth: 200,
      sortable: false,
      format: (value, row: Student) => {
        const hasId = row.studentUniqueId && row.studentUniqueId !== "pending";
        return (
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
              <Typography
                variant="body1"
                sx={{
                  fontWeight: 700,
                  fontSize: "1rem",
                  color: "text.secondary",
                  lineHeight: 1.2,
                }}
              >
                {row.lastName}, {row.firstName}
              </Typography>

              <Typography
                variant="caption"
                sx={{
                  display: "inline-block",
                  mt: 0.25,
                  fontWeight: hasId ? 600 : 400,
                  fontStyle: hasId ? "normal" : "italic",
                  color: hasId
                    ? theme.palette.warning.dark
                    : theme.palette.text.disabled,
                  bgcolor: hasId
                    ? alpha(theme.palette.primary.main, 0.08)
                    : "transparent",
                  px: hasId ? 0.75 : 0,
                  py: hasId ? 0.25 : 0,
                  borderRadius: 1,
                  fontSize: "0.75rem",
                  letterSpacing: hasId ? "0.02em" : "0",
                }}
              >
                ID: {hasId ? row.studentUniqueId : "pending"}
              </Typography>
            </Box>
          </Box>
        );
      },
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
            bgcolor: alpha(theme.palette.background.default, 0.1),
            color: theme.palette.text.secondary,
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

  // ── Filter config ──
  // - Admin: "All Classes" + every class (default = first class)
  // - Teacher: only their classes, no "All" option
  const tableFilters = useMemo(() => {
    const classOptions = classes.map((c) => ({ value: c.id, label: c.name }));

    const options = isAdmin
      ? [{ value: "", label: "All Classes" }, ...classOptions]
      : classOptions;

    return [
      {
        name: "classId",
        label: "Class",
        type: "select" as const,
        defaultValue: classes.length > 0 ? classes[0].id : "",
        minWidth: 200,
        options,
      },
    ];
  }, [classes, isAdmin]);

  const handleFilterChange = (values: Record<string, string | number | "">) => {
    const newClassId = (values.classId as string) || "";
    setClassFilter(newClassId);
    setPage(1);
  };

  const handleEdit = (id: string) => {
    setSelectedStudentId(id);
    setEditDrawerOpen(true);
  };

  const refreshStudents = () => {
    if (selectedAccount) {
      fetchStudents(
        selectedAccount,
        page,
        rowsPerPage,
        classFilter || undefined
      )
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

  const tableActionButtons: TableActionButton[] = [
    {
      label: "New Student",
      icon: <AddIcon />,
      onClick: () => navigate("create-student"),
      color: "info",
      variant: "contained",
      tooltip: "Add new student",
      show: true,
    },
    {
      label: "Import",
      icon: <PeopleIcon />,
      onClick: () => navigate("bulk-import-students"),
      color: "primary",
      variant: "outlined",
      tooltip: "Bulk import students",
      show: true,
    },
  ];

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
        minHeight: "85%",
      }}
    >
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
        onSelectedRowsChange={(selected) => setSelectedRows(selected.map((row: any) => row.id))}
        page={page - 1}
        onPageChange={handlePageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleRowsPerPageChange}
        totalCount={totalCount}
        loading={loading || isEnumsLoading}
        actionButtons={tableActionButtons}
        showFilters={true}
        filters={tableFilters}
        onFilterChange={handleFilterChange}
      />

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