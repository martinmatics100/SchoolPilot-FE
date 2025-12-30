import React, { useState, useEffect } from "react";
import DynamicForm, { type FormField } from "../../../../components/my-form";
import MessageDisplay from "../../../../components/message-display";
import { NavigationButton } from "../../../../components/navigation-button";
import { useEnums } from "../../../../hooks/useEnums";
import { useAuth } from "../../../../context";
import { fetchSubjectsForAllocation } from "../../../../api/subjectServies";
import { fetchTeachers } from "../../../../api/classServices";
import { AssignTeacherToSubjectClass } from "../../../../api/subjectServies";
import { createApiClient } from "../../../../utils/apiClient";
import SubjectTeacherTable from "../../../../components/subjectTeacherTable";
import { fetchSubjectTeacherAssignments } from "../../../../api/subjectServies";

const AssignSubjectTeacher = () => {
  const { enums } = useEnums({ fetchPermissionData: false });
  const { selectedAccount } = useAuth();

  const [showForm, setShowForm] = useState(false);
  const [formFields, setFormFields] = useState<FormField[]>([]);
  const [alertMessage, setAlertMessage] = useState<any>({});
  const [subjects, setSubjects] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [classOptions, setClassOptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [tableData, setTableData] = useState<any[]>([]);

  // const tableData = [
  //     {
  //         subjectName: "Mathematics",
  //         teachers: [
  //             {
  //                 teacherName: "John Doe",
  //                 classes: ["SS1", "SS2", "SS3"]
  //             },
  //             {
  //                 teacherName: "Amaka James",
  //                 classes: ["JSS1", "JSS2", "JSS3"]
  //             }
  //         ]
  //     },

  //     {
  //         subjectName: "English",
  //         teachers: [
  //             {
  //                 teacherName: "Martin Nwatu",
  //                 classes: ["SS1", "SS2", "SS3"]
  //             },
  //             {
  //                 teacherName: "Nkechi Vivian",
  //                 classes: ["JSS1", "JSS2", "JSS3"]
  //             },
  //             {
  //                 teacherName: "Chisom Nwatu",
  //                 classes: ["JSS1", "JSS2", "JSS3"]
  //             }
  //         ]
  //     }
  // ];

  const loadTableData = async () => {
    if (!selectedAccount) return;

    try {
      setLoading(true);
      const data = await fetchSubjectTeacherAssignments(selectedAccount);
      setTableData(data);
    } catch (error) {
      setAlertMessage({
        feMessage: "Failed to load table data",
        httpStatus: 500,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTableData();
  }, [selectedAccount]);

  const loadFormData = async () => {
    if (!selectedAccount || !enums) return;

    try {
      setLoading(true);

      const subjectResponse = await fetchSubjectsForAllocation(
        selectedAccount,
        {
          page: 1,
          pageLength: 200,
        }
      );

      const mappedSubjects = subjectResponse.items.map((s: any) => {
        const subjectEnum = enums?.AcademicSubjects?.find(
          (e) => String(e.value).trim() === String(s.subject).trim()
        );

        return {
          value: s.id,
          label:
            subjectEnum?.displayName ||
            subjectEnum?.name ||
            `Subject ${s.subject}`,
          classes: s.classes.map((c: any) => ({
            value: c.id,
            label: c.className,
          })),
        };
      });

      setSubjects(mappedSubjects);

      const teacherResponse = await fetchTeachers(selectedAccount, enums, {
        excludeAssignedTeachers: false,
      });

      const mappedTeachers = teacherResponse.map((t: any) => ({
        value: t.id,
        label: `${t.firstName} ${t.lastName}`,
      }));

      setTeachers(mappedTeachers);

      const fields: FormField[] = [
        {
          name: "subjectId",
          label: "Subject",
          type: "select",
          required: true,
          placeholder: "Choose subject",
          colSpan: 1,
          options: mappedSubjects,
          onChange: (subjectId: string) => {
            const selected = mappedSubjects.find((s) => s.value === subjectId);
            setClassOptions(selected?.classes || []);
          },
        },
        {
          name: "classIds",
          label: "Classes",
          type: "multiselect",
          required: true,
          placeholder: "Choose classes",
          colSpan: 2,
          options: [],
        },
        {
          name: "teacherId",
          label: "Teacher",
          type: "select",
          required: true,
          placeholder: "Choose teacher",
          colSpan: 1,
          options: mappedTeachers,
        },
      ];

      setFormFields(fields);
    } catch (error) {
      setAlertMessage({
        feMessage: "Failed to load data",
        httpStatus: 500,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data: any) => {
    if (!selectedAccount) return;

    try {
      setAlertMessage({ feMessage: "Assigning teacher..." });
      setLoading(true);

      const apiClient = createApiClient({ selectedAccount });

      const payload = {
        subjectId: data.subjectId,
        assignments: data.classIds.map((classId: string) => ({
          classId,
          userAffiliationId: data.teacherId,
          fullMarkObtainable: 100,
          passMark: 40,
          isPrerequisiteToPass: false,
        })),
      };

      await AssignTeacherToSubjectClass(apiClient, payload);

      setAlertMessage({
        feMessage: "Teacher assigned successfully!",
        httpStatus: 200,
      });

      // Optional: reset form or close it
      // setShowForm(false);

      loadTableData();
    } catch (err: any) {
      setAlertMessage({
        feMessage: "Failed to assign teacher",
        beMessage: err?.message || "Unknown error",
        httpStatus: 500,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-5xl mx-auto">
      {/* Button to open form */}
      <button
        onClick={() => {
          setShowForm(true);
          loadFormData();
        }}
        style={{
          backgroundColor: "#2563eb", // blue-600
          color: "white",
          fontWeight: "600",
          padding: "12px 24px",
          borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          transition: "transform 0.2s ease, background-color 0.2s ease",
          cursor: "pointer",
          margin: "10px",
        }}
      >
        Assign Subjects
      </button>

      {/* Animated slide-down form */}
      <div
        className={`transition-all duration-500 ease-in-out transform ${
          showForm
            ? "opacity-100 max-h-screen translate-y-0"
            : "opacity-0 max-h-0 -translate-y-10 overflow-hidden"
        }`}
      >
        {showForm && (
          <div className="bg-white p-6 rounded shadow-lg border border-gray-200 mb-6">
            <MessageDisplay {...alertMessage} />

            {/* <NavigationButton to="" className="mb-4">
                            Go to Subject List
                        </NavigationButton> */}

            {loading || formFields.length === 0 ? (
              <div>Loading form...</div>
            ) : (
              <DynamicForm
                title="Assign Subject Teacher"
                fields={formFields.map((f) => {
                  if (f.name === "classIds") {
                    return { ...f, options: classOptions };
                  }
                  return f;
                })}
                onSubmit={handleSubmit}
                submitButtonText="Assign"
                columns={3}
              />
            )}

            {/* Button to close form */}
            <button
              onClick={() => setShowForm(false)}
              style={{
                backgroundColor: "#2563eb", // blue-600
                color: "white",
                fontWeight: "600",
                padding: "12px 24px",
                borderRadius: "8px",
                boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                transition: "transform 0.2s ease, background-color 0.2s ease",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        )}
        <SubjectTeacherTable data={tableData} />
      </div>
    </div>
  );
};

export default AssignSubjectTeacher;
