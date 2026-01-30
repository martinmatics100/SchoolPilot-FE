import React from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TextField,
  IconButton,
  Button,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@mui/material";

export interface Column {
  key: string;
  label: string;
  type?: "text" | "number";
  width?: string | number; // 👈 NEW: width support
}

export interface EditableTableProps {
  columns: Column[];
  rows: any[];
  onChange: (updatedRows: any[]) => void;
}

const EditableTable: React.FC<EditableTableProps> = ({
  columns,
  rows,
  onChange,
}) => {
  const theme = useTheme();

  const handleCellChange = (index: number, key: string, value: string) => {
    const updated = [...rows];
    updated[index][key] = value;
    onChange(updated);
  };

  const handleAddRow = () => {
    const newRow: any = {};
    columns.forEach((col) => (newRow[col.key] = ""));
    onChange([...rows, newRow]);
  };

  const handleDeleteRow = (index: number) => {
    const updated = rows.filter((_, i) => i !== index);
    onChange(updated);
  };

  return (
    <Box sx={{ width: "100%", overflowX: "auto" }}>
      <TableContainer
        component={Paper}
        sx={{ bgcolor: theme.palette.background.default }}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  sx={{
                    width: col.width || "auto",
                    minWidth: col.width || "auto",
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
              <TableCell sx={{ width: 100 }}>Actions</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {rows.map((row, index) => (
              <TableRow key={index}>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    sx={{
                      width: col.width || "auto",
                      minWidth: col.width || "auto",
                    }}
                  >
                    <TextField
                      fullWidth
                      type={col.type || "text"}
                      value={row[col.key]}
                      onChange={(e) =>
                        handleCellChange(index, col.key, e.target.value)
                      }
                      size="small"
                    />
                  </TableCell>
                ))}

                <TableCell sx={{ width: 100 }}>
                  <IconButton
                    color="error"
                    onClick={() => handleDeleteRow(index)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}

            {/* <TableRow>
              <TableCell colSpan={columns.length + 1} align="center">
                <Button
                  startIcon={<AddIcon />}
                  variant="contained"
                  onClick={handleAddRow}
                >
                  Add Row
                </Button>
              </TableCell>
            </TableRow> */}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default EditableTable;
