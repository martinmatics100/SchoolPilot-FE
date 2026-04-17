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
import { useTheme, alpha, Box, Typography, CircularProgress, Skeleton } from "@mui/material";
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
}) => {
  const [internalPage, setInternalPage] = React.useState(0);
  const [internalRowsPerPage, setInternalRowsPerPage] =
    React.useState(defaultRowsPerPage);
  const [selectedRows, setSelectedRows] = React.useState<any[]>([]);

  const theme = useTheme();

  const currentPage =
    controlledPage !== undefined ? controlledPage : internalPage;
  const currentRowsPerPage =
    controlledRowsPerPage !== undefined
      ? controlledRowsPerPage
      : internalRowsPerPage;

  const isServerSide = totalCount !== undefined;

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

  // Loading skeleton rows
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

  // Empty state component
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
        </Box>
      )}

      <TableContainer sx={{ maxHeight: 600, overflowX: "auto" }}>
        <Table stickyHeader aria-label="reusable table" sx={{ minWidth: 800 }}>
          <TableHead>
            <TableRow
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.04),
                "& .MuiTableCell-root": {
                  borderBottom: `2px solid ${alpha(theme.palette.divider, 0.1)}`,
                },
              }}
            >
              {showCheckboxes && (
                <TableCell
                  padding="checkbox"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.04),
                    borderBottom: `2px solid ${alpha(theme.palette.divider, 0.1)}`,
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
                      fontWeight: 600,
                      fontSize: "0.875rem",
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      bgcolor: alpha(theme.palette.primary.main, 0.04),
                      borderBottom: `2px solid ${alpha(theme.palette.divider, 0.1)}`,
                      "& .MuiTableSortLabel-root": {
                        fontWeight: 600,
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