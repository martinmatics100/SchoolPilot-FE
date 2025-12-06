import React, { useState } from "react";
import { Box, FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import BroadsheetTable from "../../../components/broad-sheetTable";

const ExampleBroadsheetPage = () => {
    const [selectedClass, setSelectedClass] = useState<keyof typeof classes | "">("");
    const [selectedSession, setSelectedSession] = useState("");
    const [selectedTerm, setSelectedTerm] = useState("");

    const classes = {
        JSS1: ["English Language", "Mathematics", "Basic Science", "Civic Edu", "Security Edu", "ICT", "English Language", "Mathematics", "Basic Science", "Civic Edu", "Security Edu", "ICT", "English Language", "Mathematics", "Basic Science", "Civic Edu", "Security Edu", "ICT"],
        JSS2: ["English", "Maths", "Agric", "History"],
        SS1: ["English", "Maths", "Biology", "Physics", "Chemistry"],
    };

    const students = ["John Paul", "Mercy Samuel", "Adeyemi Tolu", "John Paul", "Mercy Samuel", "Adeyemi Tolu", "John Paul", "Mercy Samuel", "Adeyemi Tolu", "John Paul", "Mercy Samuel", "Adeyemi Tolu", "John Paul", "Mercy Samuel", "Adeyemi Tolu", "John Paul", "Mercy Samuel", "Adeyemi Tolu", "John Paul", "Mercy Samuel", "Adeyemi Tolu", "John Paul", "Mercy Samuel", "Adeyemi Tolu"];

    const showTable = selectedClass && selectedSession && selectedTerm;
    const subjects = selectedClass ? classes[selectedClass] : [];

    return (
        <Box sx={{ p: 2 }}>
            {/* DROPDOWNS */}
            <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mb: 3 }}>
                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Class</InputLabel>
                    <Select
                        value={selectedClass}
                        onChange={(e) => setSelectedClass(e.target.value)}
                    >
                        {Object.keys(classes).map((cls) => (
                            <MenuItem key={cls} value={cls}>{cls}</MenuItem>
                        ))}
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Session</InputLabel>
                    <Select
                        value={selectedSession}
                        disabled={!selectedClass}
                        onChange={(e) => setSelectedSession(e.target.value)}
                    >
                        <MenuItem value="2023/2024">2023/2024</MenuItem>
                        <MenuItem value="2024/2025">2024/2025</MenuItem>
                    </Select>
                </FormControl>

                <FormControl sx={{ minWidth: 150 }}>
                    <InputLabel>Term</InputLabel>
                    <Select
                        value={selectedTerm}
                        disabled={!selectedSession}
                        onChange={(e) => setSelectedTerm(e.target.value)}
                    >
                        <MenuItem value="1st Term">1st Term</MenuItem>
                        <MenuItem value="2nd Term">2nd Term</MenuItem>
                        <MenuItem value="3rd Term">3rd Term</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* BROADSHEET TABLE */}
            {showTable && (
                <BroadsheetTable
                    students={students}
                    subjects={subjects}
                    columnWidths={{ sn: 40, name: 300, subject: 55 }}
                />
            )}
        </Box>
    );
};

export default ExampleBroadsheetPage;
