// import React, { useEffect, useState, useMemo } from "react";
// import { ReusableTable, type Column } from "../../../../components/table";
// import { getInitialAuthData } from "../../../../utils/apiClient";
// import { useEnums } from "../../../../hooks/useEnums";
// import { NavigationButton } from "../../../../components/navigation-button";
// import FilterComponent from "../../../../components/filters";
// import { type FilterConfig } from "../../../../components/filters";
// import { fetchSubjects } from "../../../../api/subjectServies";
// import { type SubjectModel } from "../../../../types/interfaces/i-subject";
// import { Category } from "@mui/icons-material";

// const Subjects = () => {
//   const [data, setData] = useState<SubjectModel[]>([]);
//   const [page, setPage] = useState(1);
//   const [rowsPerPage, setRowsPerPage] = useState(10);
//   const [totalCount, setTotalCount] = useState(0);
//   const [sortBy, setSortBy] = useState<string>("subjectName");
//   const [order, setOrder] = useState<`asc` | `desc`>(`asc`);
//   const [loading, setLoading] = useState(false);
//   const [snackbar, setSnackbar] = useState<{
//     open: boolean;
//     message: string;
//     severity: "success" | "error";
//   }>({ open: false, message: "", severity: "success" });
//   const { selectedAccount } = getInitialAuthData();
//   const { enums, isLoading: isEnumLoading } = useEnums({
//     fetchPermissionData: false,
//   });

//   const [filters, setFilters] = useState({
//     search: "",
//     level: "",
//     category: "",
//     teachers: [] as string[],
//     createdDated: null as Date | null,
//   });

//   const levelOptions = useMemo(() => {
//     const options =
//       enums?.SchoolLevels?.map((item: { value: string; name: string }) => ({
//         value: item.value.toString(),
//         label: item.name,
//       })) || [];
//     return [{ value: "", label: "All Levels" }, ...options];
//   }, [enums]);

//   const categoryOptions = useMemo(() => {
//     const options =
//       enums?.SubjectCategory?.map((item: { value: string; name: string }) => ({
//         value: item.value.toString(),
//         label: item.name,
//       })) || [];
//     return [{ value: "", label: "All Categories" }, ...options];
//   }, [enums]);

//   const filterConfigs: FilterConfig[] = [
//     {
//       type: "single-select",
//       label: "Level",
//       value: filters.level,
//       onChange: (value: string) => {
//         setFilters((prev) => ({ ...prev, category: value }));
//         setPage(1);
//       },
//       options: levelOptions,
//     },
//     {
//       type: "single-select",
//       label: "Category",
//       value: filters.category,
//       onChange: (value: string) => {
//         setFilters((prev) => ({ ...prev, category: value }));
//         setPage(1);
//       },
//       options: categoryOptions,
//     },
//   ];

//   const getENumDisplayName = (
//     enumValue: number,
//     enumType: "SchoolLevel" | "SubjectCategory"
//   ) => {
//     const enumItem = enums?.[enumType]?.find(
//       (item: { value: string; name: string }) =>
//         item.value.toString() === enumValue.toString()
//     );
//     return enumItem?.name || `Unknown ${enumType} (${enumValue})`;
//   };

//   const formatLevels = (levels: number[]) => {
//     if (!levels || levels.length === 0) return "Not available";
//     return levels
//       .map((level) => getENumDisplayName(level, "SchoolLevel"))
//       .join(", ");
//   };

//   const formatCategories = (categories: number[]) => {
//     if (!categories || categories.length === 0) return "Not available";
//     return categories
//       .map((category) => getENumDisplayName(category, "SubjectCategory"))
//       .join(", ");
//   };

//   useEffect(() => {
//     if (selectedAccount) {
//       setLoading(true);
//       fetchSubjects(selectedAccount, {
//         page,
//         pageLength: rowsPerPage,
//         level: filters.level,
//         category: filters.category,
//       })
//         .then((response) => {
//           setData(response.subjects || []);
//           setTotalCount(response.itemCount || response.subjects.length || 0);
//         })
//         .catch((error) => {
//           console.error("Error fething subjects", error);
//           setSnackbar({
//             open: true,
//             message: "Failed to fetch subjects",
//             severity: "error",
//           });
//           setData([]);
//           setTotalCount(0);
//         })
//         .finally(() => setLoading(false));
//     } else {
//       setSnackbar({
//         open: true,
//         message: "No Account Selected",
//         severity: "error",
//       });
//       setData([]);
//       setTotalCount(0);
//     }
//   }, [
//     selectedAccount,
//     page,
//     rowsPerPage,
//     sortBy,
//     order,
//     filters.level,
//     filters.category,
//   ]);

//   const columns: Column[] = [
//     {
//       id: "subjectName",
//       label: "subject Name",
//       minWidth: 150,
//       sortable: true,
//       format: (value: string) => value || "Not available",
//     },
//     {
//       id: "subjectCode",
//       label: "subject COde",
//       minWidth: 120,
//       sortable: true,
//       format: (value: string) => value || "Not available",
//     },
//     {
//       id: "level",
//       label: "subject Level",
//       minWidth: 200,
//       sortable: true,
//       format: (value: string) => formatLevels(value),
//     },
//   ];
// };
