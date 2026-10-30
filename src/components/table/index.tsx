import * as React from "react";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TablePagination from "@mui/material/TablePagination";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import Checkbox from "@mui/material/Checkbox";
import {
  useTheme,
  alpha,
  Box,
  Typography,
  CircularProgress,
  Skeleton,
  Stack,
  Tooltip,
  Button,
  IconButton,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import IconifyIcon from "../../components/base/iconifyIcon";

export interface Column {
  id: string;
  label: string;
  minWidth?: number;
  align?: "right" | "left" | "center";
  format?: (
    value: any,
    row?: any,
    index?: number
  ) => string | number | React.ReactNode;
  sortable?: boolean;
}

export interface TableActionButton {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: "text" | "outlined" | "contained";
  color?: "primary" | "secondary" | "success" | "error" | "info" | "warning";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  tooltip?: string;
  show?: boolean;
}

// ─────────────────────────────────────────────────────────────
// FILTER SUPPORT
// ─────────────────────────────────────────────────────────────

export type FilterType = "select" | "text" | "date" | "number";

export interface FilterOption {
  value: string | number;
  label: string;
}

export interface FilterConfig {
  /** Key used to report the filter value back to the parent. */
  name: string;
  label: string;
  type: FilterType;
  /** Required for `select`. */
  options?: FilterOption[];
  /** Initial value. */
  defaultValue?: string | number | "";
  /** Column span within the filter row. Default 1. */
  colSpan?: number;
  /** Min width of the filter control. Default 180px. */
  minWidth?: number;
  /** Placeholder text (for text/number inputs). */
  placeholder?: string;
}

interface ReusableTableProps {
  columns: Column[];
  data: any[];
  defaultRowsPerPage?: number;
  rowsPerPageOptions?: number[];
  onRowClick?: (rowData: any) => void;
  showActionColumn?: boolean;
  actionColumn?: {
    label: string;
    minWidth?: number;
    align?: "right" | "left" | "center";
    render: (rowData: any, index?: number) => React.ReactNode;
  };
  sortBy?: string;
  order?: "asc" | "desc";
  onSortChange?: (sortBy: string, order: "asc" | "desc") => void;
  title?: string;
  onSelectedRowsChange?: (selectedRows: any[]) => void;
  page?: number;
  onPageChange?: (event: unknown, newPage: number) => void;
  rowsPerPage?: number;
  onRowsPerPageChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
  totalCount?: number;
  loading?: boolean;
  showSorting?: boolean;
  showCheckboxes?: boolean;
  showRowsPerPage?: boolean;
  showPagination?: boolean;
  actionButtons?: TableActionButton[];

  // ── Filter support ──
  /** Toggle for showing a filter bar. Default false. */
  showFilters?: boolean;
  /** Definitions of the filters. At least one is required when showFilters is true. */
  filters?: FilterConfig[];
  /** Called whenever a filter value changes. Receives the full map of filter values. */
  onFilterChange?: (values: Record<string, string | number | "">) => void;
  /** Optional: clears all filters and re-fires onFilterChange with defaults. */
  showClearFilters?: boolean;
}

export const ReusableTable: React.FC<ReusableTableProps> = ({
  columns,
  data,
  defaultRowsPerPage = 10,
  rowsPerPageOptions = [10, 25, 50],
  onRowClick,
  showActionColumn = false,
  actionColumn,
  sortBy,
  order,
  onSortChange,
  title,
  onSelectedRowsChange,
  page: controlledPage,
  onPageChange,
  rowsPerPage: controlledRowsPerPage,
  onRowsPerPageChange,
  totalCount,
  loading = false,
  showSorting = true,
  showCheckboxes = true,
  showRowsPerPage = true,
  showPagination = true,
  actionButtons = [],

  // Filter props
  showFilters = false,
  filters = [],
  onFilterChange,
  showClearFilters = true,
}) => {
  const [internalPage, setInternalPage] = React.useState(0);
  const [internalRowsPerPage, setInternalRowsPerPage] =
    React.useState(defaultRowsPerPage);
  const [selectedRows, setSelectedRows] = React.useState<any[]>([]);

  // Internal filter state, keyed by filter.name
  const [filterValues, setFilterValues] = React.useState<
    Record<string, string | number | "">
  >(() => {
    const initial: Record<string, string | number | ""> = {};
    filters.forEach((f) => {
      initial[f.name] = f.defaultValue ?? "";
    });
    return initial;
  });

  /**
   * Re-seed filter values when:
   *   - the set of filter names changes, OR
   *   - any filter's `defaultValue` changes.
   *
   * Behaviour:
   *   - If the user hasn't touched a filter yet (its current value equals
   *     the old default, or is empty), it follows the new `defaultValue`.
   *     This lets parents pre-select a value (e.g. the first item of an
   *     asynchronously loaded list).
   *   - If the user has picked something, we preserve their choice.
   */
  React.useEffect(() => {
    setFilterValues((prev) => {
      const next: Record<string, string | number | ""> = {};
      filters.forEach((f) => {
        const prevValue = prev[f.name];
        const newDefault = f.defaultValue ?? "";
        const wasPristine =
          prevValue === undefined ||
          prevValue === "" ||
          prevValue === newDefault;

        next[f.name] = wasPristine ? newDefault : prevValue;
      });
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters
      .map((f) => `${f.name}:${String(f.defaultValue ?? "")}`)
      .join("|"),
  ]);

  const theme = useTheme();

  const currentPage =
    controlledPage !== undefined ? controlledPage : internalPage;
  const currentRowsPerPage =
    controlledRowsPerPage !== undefined
      ? controlledRowsPerPage
      : internalRowsPerPage;

  const isServerSide = totalCount !== undefined;

  const visibleButtons = actionButtons.filter((btn) => btn.show !== false);

  // ── Filter handlers ──
  const handleFilterChange = (name: string, value: string | number | "") => {
    const next = { ...filterValues, [name]: value };
    setFilterValues(next);
    onFilterChange?.(next);
  };

  const handleClearFilters = () => {
    const cleared: Record<string, string | number | ""> = {};
    filters.forEach((f) => {
      cleared[f.name] = f.defaultValue ?? "";
    });
    setFilterValues(cleared);
    onFilterChange?.(cleared);
  };

  const hasActiveFilters = Object.entries(filterValues).some(
    ([key, value]) =>
      value !== "" &&
      value !== undefined &&
      value !== filters.find((f) => f.name === key)?.defaultValue
  );

  const handleChangePage = (event: unknown, newPage: number) => {
    if (onPageChange) {
      onPageChange(event, newPage);
    } else {
      setInternalPage(newPage);
    }
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const newRowsPerPage = +event.target.value;
    if (onRowsPerPageChange) {
      onRowsPerPageChange(event);
    } else {
      setInternalRowsPerPage(newRowsPerPage);
      setInternalPage(0);
    }
  };

  const handleSort = (columnId: string) => {
    if (!onSortChange || !showSorting) return;
    const isAsc = sortBy === columnId && order === "asc";
    const newOrder = isAsc ? "desc" : "asc";
    onSortChange(columnId, newOrder);
  };

  const pageData = isServerSide
    ? data
    : data.slice(
        currentPage * currentRowsPerPage,
        currentPage * currentRowsPerPage + currentRowsPerPage
      );

  const isRowSelected = (row: any) => selectedRows.some((r) => r.id === row.id);
  const areAllSelected =
    pageData.every((row) => isRowSelected(row)) && pageData.length > 0;

  const handleSelectAll = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!showCheckboxes) return;
    let newSelection = [...selectedRows];

    if (event.target.checked) {
      const newRows = pageData.filter((row) => !isRowSelected(row));
      newSelection = [...selectedRows, ...newRows];
    } else {
      newSelection = selectedRows.filter(
        (row) => !pageData.some((p) => p.id === row.id)
      );
    }

    setSelectedRows(newSelection);
    onSelectedRowsChange?.(newSelection);
  };

  const handleCheckboxChange = (row: any) => {
    if (!showCheckboxes) return;
    const isSelected = isRowSelected(row);
    const newSelection = isSelected
      ? selectedRows.filter((r) => r.id !== row.id)
      : [...selectedRows, row];

    setSelectedRows(newSelection);
    onSelectedRowsChange?.(newSelection);
  };

  const allColumns = [
    ...columns,
    ...(showActionColumn && actionColumn
      ? [
          {
            id: "actions",
            label: actionColumn.label,
            minWidth: actionColumn.minWidth || 100,
            align: actionColumn.align || "right",
          },
        ]
      : []),
  ];

  const LoadingSkeleton = () => (
    <>
      {[1, 2, 3, 4, 5].map((_, idx) => (
        <TableRow key={`skeleton-${idx}`}>
          {showCheckboxes && (
            <TableCell padding="checkbox">
              <Skeleton variant="circular" width={20} height={20} />
            </TableCell>
          )}
          {allColumns.map((column, colIdx) => (
            <TableCell key={`skeleton-cell-${idx}-${colIdx}`}>
              <Skeleton variant="text" width="80%" height={30} />
            </TableCell>
          ))}
        </TableRow>
      ))}
    </>
  );

  const EmptyState = () => (
    <TableRow>
      <TableCell
        colSpan={allColumns.length + (showCheckboxes ? 1 : 0)}
        align="center"
        sx={{ py: 8 }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 2,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: "50%",
              bgcolor: alpha(theme.palette.text.disabled, 0.1),
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconifyIcon
              icon="mdi:database-outline"
              width={40}
              color={theme.palette.text.disabled}
            />
          </Box>
          <Typography variant="h6" sx={{ color: theme.palette.text.secondary }}>
            No data available
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.disabled }}>
            There are no records to display at this time
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );

  // ── Filter bar renderer ──
  const shouldRenderFilters = showFilters && filters.length > 0;

  return (
    <Paper
      elevation={0}
      sx={{
        width: "100%",
        overflow: "hidden",
        bgcolor: "background.default",
        borderRadius: 3,
        border: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
        transition: "box-shadow 0.2s ease",
        "&:hover": {
          boxShadow: `0 8px 24px ${alpha(theme.palette.common.black, 0.08)}`,
        },
      }}
    >
      {title && (
        <Box
          sx={{
            p: 3,
            pb: 2,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              color: "text.secondary",
              fontSize: "1.25rem",
              letterSpacing: "-0.01em",
            }}
          >
            {title}
          </Typography>

          {visibleButtons.length > 0 && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              {visibleButtons.map((button, index) => (
                <React.Fragment key={`action-btn-${index}`}>
                  {button.tooltip ? (
                    <Tooltip title={button.tooltip} arrow>
                      <span>
                        <Button
                          variant={button.variant || "contained"}
                          color={button.color || "secondary"}
                          size={button.size || "small"}
                          onClick={button.onClick}
                          disabled={button.disabled || button.loading}
                          startIcon={
                            button.loading ? (
                              <CircularProgress size={16} />
                            ) : (
                              button.icon
                            )
                          }
                          sx={{
                            minWidth: "auto",
                            px: 1.5,
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: 2,
                          }}
                        >
                          {button.loading ? "Loading..." : button.label}
                        </Button>
                      </span>
                    </Tooltip>
                  ) : (
                    <Button
                      variant={button.variant || "contained"}
                      color={button.color || "secondary"}
                      size={button.size || "small"}
                      onClick={button.onClick}
                      disabled={button.disabled || button.loading}
                        startIcon={
                          button.loading ? (
                            <CircularProgress size={16} />
                          ) : (
                            button.icon
                          )
                        }
                      sx={{
                        minWidth: "auto",
                        px: 1.5,
                        textTransform: "none",
                        fontWeight: 600,
                        borderRadius: 2,
                      }}
                    >
                      {button.loading ? "Loading..." : button.label}
                    </Button>
                  )}
                </React.Fragment>
              ))}
            </Stack>
          )}
        </Box>
      )}

      {/* ── Filter bar ── */}
      {shouldRenderFilters && (
        <Box
          sx={{
            px: 3,
            py: 2,
            borderBottom: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            bgcolor: alpha(theme.palette.background.default, 0.6),
            color: theme.palette.text.secondary,
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexWrap: "wrap",
              gap: 2,
              alignItems: "center",
            }}
          >
            {filters.map((filter) => {
              const value = filterValues[filter.name] ?? "";
              const minWidth = filter.minWidth ?? 180;

              if (filter.type === "select") {
                // Determine whether an "All" option was supplied by the caller.
                const hasAllOption = filter.options?.some((o) => o.value === "");
                const allOption = filter.options?.find((o) => o.value === "");
                const selectableOptions =
                  filter.options?.filter((o) => o.value !== "") ?? [];

                return (
                  <FormControl key={filter.name} size="small" sx={{ minWidth }}>
                    <InputLabel id={`filter-${filter.name}-label`}>
                      {filter.label}
                    </InputLabel>
                    <Select
                      labelId={`filter-${filter.name}-label`}
                      id={`filter-${filter.name}`}
                      value={value === "" ? "" : value}
                      label={filter.label}
                      onChange={(e) =>
                        handleFilterChange(
                          filter.name,
                          e.target.value as string | number
                        )
                      }
                    >
                      {/* Render "All" only if the caller supplied a "" option. */}
                      {hasAllOption && (
                        <MenuItem value="">
                          <em>{allOption?.label ?? "All"}</em>
                        </MenuItem>
                      )}

                      {selectableOptions.map((opt) => (
                        <MenuItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                );
              }

              if (filter.type === "text") {
                return (
                  <TextField
                    key={filter.name}
                    size="small"
                    label={filter.label}
                    placeholder={filter.placeholder}
                    value={value}
                    onChange={(e) =>
                      handleFilterChange(filter.name, e.target.value)
                    }
                    sx={{ minWidth }}
                  />
                );
              }

              if (filter.type === "number") {
                return (
                  <TextField
                    key={filter.name}
                    size="small"
                    type="number"
                    label={filter.label}
                    placeholder={filter.placeholder}
                    value={value}
                    onChange={(e) =>
                      handleFilterChange(filter.name, e.target.value)
                    }
                    sx={{ minWidth }}
                  />
                );
              }

              if (filter.type === "date") {
                return (
                  <TextField
                    key={filter.name}
                    size="small"
                    type="date"
                    label={filter.label}
                    InputLabelProps={{ shrink: true }}
                    value={value}
                    onChange={(e) =>
                      handleFilterChange(filter.name, e.target.value)
                    }
                    sx={{ minWidth }}
                  />
                );
              }

              return null;
            })}

            {showClearFilters && hasActiveFilters && (
              <Button
                size="small"
                variant="outlined"
                onClick={handleClearFilters}
                sx={{
                  textTransform: "none",
                  borderRadius: 2,
                  height: 40,
                }}
              >
                Clear filters
              </Button>
            )}
          </Box>
        </Box>
      )}

      <TableContainer sx={{ maxHeight: 450, overflowX: "auto" }}>
        <Table stickyHeader aria-label="reusable table" sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow>
              {showCheckboxes && (
                <TableCell
                  padding="checkbox"
                  sx={{
                    bgcolor: theme.palette.background.default,
                    borderBottom: `2px solid ${alpha(theme.palette.divider, 0.1)}`,
                    zIndex: 2,
                  }}
                >
                  <Checkbox
                    checked={areAllSelected}
                    onChange={handleSelectAll}
                    sx={{
                      color: alpha(theme.palette.text.secondary, 0.5),
                      "&.Mui-checked": {
                        color: theme.palette.primary.main,
                      },
                      "&:hover": {
                        bgcolor: alpha(theme.palette.primary.main, 0.04),
                      },
                      transition: "all 0.2s ease",
                    }}
                  />
                </TableCell>
              )}
              {allColumns.map((column) => {
                const isSortable =
                  showSorting &&
                  columns.find((col) => col.id === column.id)?.sortable;
                const isSorted = sortBy === column.id;

                return (
                  <TableCell
                    key={column.id}
                    align={column.align}
                    style={{ minWidth: column.minWidth }}
                    sortDirection={isSorted && showSorting ? order : false}
                    sx={{
                      color: theme.palette.text.secondary,
                      fontWeight: 700,
                      fontSize: "0.75rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.8px",
                      bgcolor: theme.palette.background.default,
                      borderBottom: `2px solid ${theme.palette.primary.main}`,
                      zIndex: 2,
                      "& .MuiTableSortLabel-root": {
                        fontWeight: 700,
                      },
                    }}
                  >
                    {isSortable ? (
                      <TableSortLabel
                        active={isSorted}
                        direction={isSorted ? order : "asc"}
                        onClick={() => handleSort(column.id)}
                        sx={{
                          "&.Mui-active": {
                            color: theme.palette.primary.main,
                          },
                          "& .MuiTableSortLabel-icon": {
                            color: `${theme.palette.primary.main} !important`,
                          },
                        }}
                      >
                        {column.label}
                      </TableSortLabel>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {loading ? (
              <LoadingSkeleton />
            ) : pageData.length === 0 ? (
                <EmptyState />
            ) : (
              pageData.map((row, index) => (
                <TableRow
                  hover
                  role="checkbox"
                  tabIndex={-1}
                  key={`row-${index}`}
                  onClick={() => onRowClick && onRowClick(row)}
                  selected={isRowSelected(row)}
                  sx={{
                    cursor: onRowClick ? "pointer" : "default",
                    bgcolor: isRowSelected(row)
                      ? alpha(theme.palette.primary.main, 0.04)
                      : "transparent",
                    transition: "background-color 0.2s ease",
                    "&:hover": {
                      bgcolor: isRowSelected(row)
                        ? alpha(theme.palette.primary.main, 0.06)
                        : alpha(theme.palette.action.hover, 0.04),
                    },
                    "& .MuiTableCell-root": {
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.06)}`,
                    },
                    "&:last-child .MuiTableCell-root": {
                      borderBottom: "none",
                    },
                  }}
                >
                  {showCheckboxes && (
                    <TableCell padding="checkbox">
                      <Checkbox
                        checked={isRowSelected(row)}
                        onChange={() => handleCheckboxChange(row)}
                        sx={{
                          color: alpha(theme.palette.text.secondary, 0.5),
                          "&.Mui-checked": {
                            color: theme.palette.primary.main,
                          },
                          "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.04),
                          },
                          transition: "all 0.2s ease",
                        }}
                      />
                    </TableCell>
                  )}
                  {columns.map((column) => {
                    const value = row[column.id];
                    return (
                      <TableCell
                        key={`${column.id}-${index}`}
                        align={column.align}
                        sx={{
                          color: theme.palette.text.secondary,
                          fontSize: "0.875rem",
                          py: 1.75,
                        }}
                      >
                        {column.format
                          ? column.format(value, row, index)
                          : value}
                      </TableCell>
                    );
                  })}
                  {showActionColumn && actionColumn && (
                    <TableCell
                      key={`actions-${index}`}
                      align={actionColumn.align || "right"}
                      sx={{
                        py: 1.75,
                      }}
                    >
                      {actionColumn.render(row, index)}
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {showPagination && (
        <Box
          sx={{
            borderTop: `1px solid ${alpha(theme.palette.divider, 0.08)}`,
            bgcolor: alpha(theme.palette.background.default, 0.5),
          }}
        >
          <TablePagination
            rowsPerPageOptions={showRowsPerPage ? rowsPerPageOptions : []}
            component="div"
            count={totalCount ?? data.length}
            rowsPerPage={currentRowsPerPage}
            page={currentPage}
            onPageChange={handleChangePage}
            onRowsPerPageChange={
              showRowsPerPage ? handleChangeRowsPerPage : undefined
            }
            sx={{
              color: theme.palette.text.secondary,
              "& .MuiTablePagination-toolbar": {
                minHeight: "52px",
              },
              "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows":
              {
                fontSize: "0.813rem",
              },
              "& .MuiSelect-select": {
                fontSize: "0.813rem",
              },
              "& .MuiTablePagination-actions button": {
                color: theme.palette.text.secondary,
                "&:hover": {
                  bgcolor: alpha(theme.palette.action.hover, 0.04),
                },
              },
            }}
          />
        </Box>
      )}
    </Paper>
  );
};