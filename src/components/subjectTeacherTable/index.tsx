import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Fragment } from "react";
import GroupedTable, { type TableHeader } from "../grouped-table/index.tsx";
import { useTheme } from "@mui/material";

type TeacherRow = {
  teacherName: string;
  classes: string[];
};

type SubjectTeacherRow = {
  subjectName: string;
  teachers: TeacherRow[];
};

type Props = {
  data: SubjectTeacherRow[];
};

const SubjectTeacherTable = ({ data }: Props) => {
  const isMobile = useMediaQuery("(max-width:600px)");

  const theme = useTheme();

  const headers: TableHeader[] = [
    { key: "subject", label: "Subject" },
    { key: "teacher", label: "Teacher" },
    { key: "classes", label: "Classes" },
  ];

  return (
    <GroupedTable
      headers={headers}
      data={data}
      emptyMessage="No assignments found"
      renderRows={(subject, subjectIndex) => (
        <Fragment key={subjectIndex}>
          {subject.teachers.map((teacher, teacherIndex) => (
            <TableRow key={teacherIndex}>
              {teacherIndex === 0 && (
                <TableCell
                  rowSpan={subject.teachers.length}
                  sx={{ fontWeight: 600 }}
                >
                  {subject.subjectName}
                </TableCell>
              )}

              <TableCell>{teacher.teacherName}</TableCell>

              <TableCell>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 0.5,
                  }}
                >
                  {teacher.classes.map((cls) => (
                    <Box
                      key={cls}
                      sx={{
                        px: 1,
                        py: 0.5,
                        borderRadius: 1,
                        fontSize: "0.85rem",
                        fontWeight: "3rem",
                        color: theme.palette.text.primary,
                        bgcolor: theme.palette.background.default,
                      }}
                    >
                      {cls}
                    </Box>
                  ))}
                </Box>
              </TableCell>
            </TableRow>
          ))}
        </Fragment>
      )}
    />
  );
};

export default SubjectTeacherTable;
