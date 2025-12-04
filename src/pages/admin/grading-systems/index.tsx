import React, { useState } from "react";
import EditableTable, { type Column } from "../../../components/editable-table";
import {
    Box,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Button
} from "@mui/material";

const GradingSystem: React.FC = () => {

    const [selectedClass, setSelectedClass] = useState("");
    const [showTable, setShowTable] = useState(false);

    const columns: Column[] = [
        { key: "lowerBound", label: "Lower Boundary", type: "number", width: 20 },
        { key: "upperBound", label: "Upper Boundary", type: "number", width: 120 },
        { key: "gradeName", label: "Grade Name", width: 100 },
        { key: "gradeRemark", label: "Grade Remark", width: 150 },
        { key: "gradePoint", label: "Grade Point", type: "number", width: 120 },
        { key: "descriptor", label: "Grade Descriptor", width: 500 },
    ];

    const [rows, setRows] = useState<any[]>([]);

    const handleView = () => {
        if (!selectedClass) return;

        // Load data for selected class (static for now)
        setRows([
            {
                lowerBound: 70,
                upperBound: 100,
                gradeName: "A",
                gradeRemark: "Excellent",
                gradePoint: 5,
                descriptor: "Excellent grade, keep it up",
            },
            {
                lowerBound: 60,
                upperBound: 69,
                gradeName: "B",
                gradeRemark: "Very Good",
                gradePoint: 4,
                descriptor: "Nice score, try harder next time",
            },
        ]);

        setShowTable(true);
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h5" sx={{ mb: 2 }}>
                Grading System Settings
            </Typography>

            {/* CLASS SELECTOR */}
            <Box sx={{ maxWidth: 300, mb: 2 }}>
                <FormControl fullWidth>
                    <InputLabel>Select Class</InputLabel>
                    <Select
                        value={selectedClass}
                        label="Select Class"
                        onChange={(e) => {
                            setSelectedClass(e.target.value);
                            setShowTable(false); // hide table if class changes
                        }}
                    >
                        <MenuItem value="class1">Class 1</MenuItem>
                        <MenuItem value="class2">Class 2</MenuItem>
                        <MenuItem value="class3">Class 3</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* VIEW BUTTON */}
            <Button
                variant="contained"
                disabled={!selectedClass}
                sx={{ mb: 3 }}
                onClick={handleView}
            >
                View Grading System
            </Button>

            {/* TABLE ONLY SHOWS WHEN CLASS IS SELECTED */}
            {showTable && (
                <EditableTable
                    columns={columns}
                    rows={rows}
                    onChange={(updated) => setRows(updated)}
                />
            )}
        </Box>
    );
};

export default GradingSystem;
