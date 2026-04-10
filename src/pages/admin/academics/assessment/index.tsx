// import React, { useState, useEffect } from "react";
// import DynamicForm, { type FormField } from "../../../../components/my-form";
// import MessageDisplay from "../../../../components/message-display";
// import { useEnums } from "../../../../hooks/useEnums";
// import { useAuth } from "../../../../context";
// import { fetchSubjectsForAllocation } from "../../../../api/subjectServies";
// import {
//   fetchSubjects,
//   fetchSubjectTeacherAssessment,
// } from "../../../../api/subjectServies";
// import { createSubjectAssessment } from "../../../../api/subjectServies";
// import SubjectAssessmentTable from "../../../../components/subjectAssessmentTable";
// import { type CreateSubjectAssessmentPayload } from "../../../../types/interfaces/i-subject";

// const CreateSubjectAssessment = () => {
//   const { enums } = useEnums({ fetchPermissionData: false });
//   const { selectedAccount } = useAuth();

//   const [showForm, setShowForm] = useState(false);
//   const [formFields, setFormFields] = useState<FormField[]>([]);
//   const [alertMessage, setAlertMessage] = useState<any>({});
//   const [loading, setLoading] = useState(false);
//   const [tableData, setTableData] = useState<any[]>([]);

//   const loadFormData = async () => {
//     if (!selectedAccount || !enums) return;

//     try {
//       setLoading(true);

//       const subjectResponse = await fetchSubjects(selectedAccount, {
//         page: 1,
//         pageLength: 200,
//       });

//       const subjectOptions = subjectResponse.subjects.map((s: any) => {
//         const subjectEnum = enums.AcademicSubjects?.find(
//           (e) => String(e.value) === String(s.subjectName)
//         );

//         return {
//           value: s.id,
//           label:
//             subjectEnum?.displayName ||
//             subjectEnum?.name ||
//             `Subject (${s.subjectName})`,
//         };
//       });

//       // 🔹 Enum-based dropdowns
//       const sessionOptions = enums.SchoolSessions.map((s: any) => ({
//         value: s.value,
//         label: s.displayName || s.name,
//       }));

//       const termOptions = enums.SchoolTerms.map((t: any) => ({
//         value: t.value,
//         label: t.displayName || t.name,
//       }));

//       const assessmentTypeOptions = enums.AssessmentType.map((a: any) => ({
//         value: a.value,
//         label: a.displayName || a.name,
//       }));

//       const fields: FormField[] = [
//         {
//           name: "schoolSession",
//           label: "School Session",
//           type: "select",
//           required: true,
//           options: sessionOptions,
//           colSpan: 1,
//         },
//         {
//           name: "schoolTerm",
//           label: "School Term",
//           type: "select",
//           required: true,
//           options: termOptions,
//           colSpan: 1,
//         },
//         {
//           name: "subjectIds",
//           label: "Subject",
//           type: "multiselect",
//           required: true,
//           options: subjectOptions,
//           colSpan: 1,
//         },
//       ];

//       setFormFields(fields);
//     } catch (error) {
//       setAlertMessage({
//         feMessage: "Failed to load form data",
//         httpStatus: 500,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Load assessments for the table
//   const loadAssessments = async () => {
//     if (!selectedAccount || !enums) return;

//     try {
//       setLoading(true);
//       const response = await fetchSubjectTeacherAssessment(selectedAccount);

//       const mappedData = response.map((item: any) => {
//         const subjectEnum = enums.AcademicSubjects?.find(
//           (e) => String(e.value) === String(item.subject)
//         );
//         return {
//           subjectName:
//             subjectEnum?.displayName ||
//             subjectEnum?.name ||
//             `Subject (${item.subject})`,
//           assessments: item.assessments || [],
//         };
//       });

//       setTableData(mappedData);
//     } catch (err) {
//       setAlertMessage({
//         feMessage: "Failed to load assessments",
//         httpStatus: 500,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (selectedAccount) loadAssessments();
//   }, [selectedAccount, enums]);

//   const handleSubmit = async (data: any) => {
//     try {
//       setAlertMessage({ feMessage: "Creating assessment..." });
//       setLoading(true);

//       const payload: CreateSubjectAssessmentPayload = {
//         subjectIds: data.subjectIds,
//         schoolSession: Number(data.schoolSession),
//         schoolTerm: Number(data.schoolTerm),
//       };

//       console.log("Assessment Payload:", payload);

//       await createSubjectAssessment(selectedAccount, payload);

//       setAlertMessage({
//         feMessage: "Assessment created successfully",
//         httpStatus: 200,
//       });

//       // Refresh table after creating assessment
//       loadAssessments();
//     } catch (err: any) {
//       setAlertMessage({
//         feMessage: "Failed to create assessment",
//         httpStatus: 500,
//       });
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="p-4 max-w-5xl mx-auto">
//       <button
//         onClick={() => {
//           setShowForm(true);
//           loadFormData();
//         }}
//         style={{
//           backgroundColor: "#2563eb", // blue-600
//           color: "white",
//           fontWeight: "600",
//           padding: "12px 24px",
//           borderRadius: "8px",
//           boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
//           transition: "transform 0.2s ease, background-color 0.2s ease",
//           cursor: "pointer",
//           margin: "10px",
//         }}
//       >
//         Create Assessment
//       </button>

//       {showForm && (
//         <div className="bg-white p-6 rounded shadow border mb-6">
//           <MessageDisplay {...alertMessage} />

//           {loading || formFields.length === 0 ? (
//             <div>Loading form...</div>
//           ) : (
//             <DynamicForm
//               title="Create Subject Assessment"
//               fields={formFields}
//               onSubmit={handleSubmit}
//               submitButtonText="Save Assessment"
//               columns={3}
//             />
//           )}

//           <button
//             onClick={() => setShowForm(false)}
//             style={{
//               backgroundColor: "#2563eb", // blue-600
//               color: "white",
//               fontWeight: "600",
//               padding: "12px 24px",
//               borderRadius: "8px",
//               boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
//               transition: "transform 0.2s ease, background-color 0.2s ease",
//               cursor: "pointer",
//             }}
//           >
//             Close
//           </button>
//         </div>
//       )}

//       <SubjectAssessmentTable data={tableData} />
//     </div>
//   );
// };

// export default CreateSubjectAssessment;
