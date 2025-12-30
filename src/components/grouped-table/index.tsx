import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
} from "@mui/material";
import { type ReactNode } from "react";
import { useTheme } from "@mui/material";

export type TableHeader = {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  visible?: boolean;
};

type GroupedTableProps<T> = {
  headers: TableHeader[];
  data: T[];
  renderRows: (item: T, index: number) => ReactNode;
  emptyMessage?: string;
};

const GroupedTable = <T,>({
  headers,
  data,
  renderRows,
  emptyMessage = "No records found",
}: GroupedTableProps<T>) => {
  const theme = useTheme();

  const visibleHeaders = headers.filter((h) => h.visible !== false);

  return (
    <TableContainer
      component={Paper}
      sx={{ mt: 4, bgcolor: theme.palette.background.default }}
    >
      <Table>
        <TableHead>
          <TableRow>
            {visibleHeaders.map((header) => (
              <TableCell
                key={header.key}
                align={header.align || "left"}
                sx={{
                  fontWeight: 600,
                  color: theme.palette.text.secondary,
                }}
              >
                {header.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody
          sx={{
            "& .MuiTableCell-root": {
              color: theme.palette.text.secondary,
              borderBottom: `1px solid ${theme.palette.grey[300]}`,
            },
          }}
        >
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={visibleHeaders.length} align="center">
                <Typography variant="body2" color="text.secondary">
                  {emptyMessage}
                </Typography>
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => renderRows(item, index))
          )}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default GroupedTable;
