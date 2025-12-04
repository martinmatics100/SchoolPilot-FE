import React, { useState } from "react";
import EditableTable, { type Column } from "../../../components/editable-table";
import { Box, Typography } from "@mui/material";

const CommentBank: React.FC = () => {

    const columns: Column[] = [
        { key: "comment", label: "Comment / Remark", width: 500 },
        { key: "from", label: "Applies To Total Score Average (From)", type: "number", width: 300 },
        { key: "to", label: "Applies To Total Score Average (To)", type: "number", width: 300 },
    ];

    const [rows, setRows] = useState([
        {
            comment: "Very nice result, keep it up",
            from: 80,
            to: 100,
        },
        {
            comment: "Good performance, try harder",
            from: 60,
            to: 79,
        },
    ]);

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
                Comment Bank
            </Typography>

            <EditableTable
                columns={columns}
                rows={rows}
                onChange={(updated) => setRows(updated)}
            />
        </Box>
    );
};

export default CommentBank;
