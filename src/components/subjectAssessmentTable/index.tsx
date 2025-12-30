// SubjectAssessmentTable.tsx
import {
  Box,
  TableRow,
  TableCell,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Fragment } from "react";
import GroupedTable, { type TableHeader } from "../grouped-table/index.tsx";

type Assessment = {
  id: string;
  name: string;
  type: number;
  order: number;
};

type SubjectAssessmentRow = {
  subjectName: string;
  assessments: Assessment[];
};

type Props = {
  data: SubjectAssessmentRow[];
};

const SubjectAssessmentTable = ({ data }: Props) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const theme = useTheme();

  const headers: TableHeader[] = [
    { key: "subject", label: "Subject" },
    { key: "assessment", label: "Assessment" },
  ];

  return (
    <GroupedTable
      headers={headers}
      data={data}
      emptyMessage="No assessments found"
      renderRows={(subject, subjectIndex) => (
        <Fragment key={subjectIndex}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600 }}>
              {subject.subjectName}
            </TableCell>
            <TableCell>
              <Box>
                {subject.assessments.map((assess) => (
                  <Box
                    key={assess.id}
                    sx={{
                      borderRadius: 1,
                      marginBottom: "5px",
                      color: theme.palette.text.secondary,
                      bgcolor: theme.palette.background.default,
                    }}
                  >
                    {assess.name}
                  </Box>
                ))}
              </Box>
            </TableCell>
          </TableRow>
        </Fragment>
      )}
    />
  );
};

export default SubjectAssessmentTable;
