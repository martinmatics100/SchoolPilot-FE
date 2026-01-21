import React, { useState } from "react";
import { Box, Button, TextField, Paper } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SaveIcon from "@mui/icons-material/Save";
import { useTheme } from "@mui/material";

type Props = {
  onSave: () => void;
  onAddRows: (count: number) => void;
  disableSave?: boolean;
  saveLabel?: string;
};

export function BulkActionBar({
  onSave,
  onAddRows,
  disableSave,
  saveLabel = "Save",
}: Props) {
  const [count, setCount] = useState(1);

  const theme = useTheme();

  return (
    <Paper
      elevation={8}
      sx={{
        position: "sticky",
        bottom: 0,
        p: 2,
        mt: 3,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        borderTop: "1px solid",
        borderColor: "divider",
        zIndex: 20,
        bgcolor: theme.palette.background.default,
      }}
    >
      <Box display="flex" gap={1}>
        <TextField
          type="number"
          size="small"
          label="Rows"
          value={count}
          inputProps={{ min: 1 }}
          onChange={(e) => setCount(Math.max(1, Number(e.target.value)))}
          sx={{ width: 100 }}
        />

        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={() => onAddRows(count)}
        >
          Add
        </Button>
      </Box>

      <Button
        variant="contained"
        color="success"
        size="large"
        startIcon={<SaveIcon />}
        disabled={disableSave}
        onClick={onSave}
        sx={{
          color: theme.palette.success.light,
          bgcolor: theme.palette.action.focus,
          marginTop: "5px",
        }}
      >
        {saveLabel}
      </Button>
    </Paper>
  );
}
